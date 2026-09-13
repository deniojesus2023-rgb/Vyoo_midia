import { createClient } from "@/lib/supabase/server";

const validId = (id: string) => /^[a-f0-9-]+$/.test(id);

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return new Response("Não autorizado", { status: 401 });
  if (!validId(id))
    return new Response("Identificador inválido", { status: 400 });
  const type = req.headers.get("content-type") || "";
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ].includes(type)
  )
    return new Response("Formato não suportado", { status: 400 });
  const bytes = await req.arrayBuffer();
  if (bytes.byteLength > 25 * 1024 * 1024)
    return new Response("Limite de 25 MB", { status: 413 });
  const { error } = await supabase.storage
    .from("creatives")
    .upload(`${userId}/${id}`, bytes, { contentType: type, upsert: false });
  if (error) return new Response("Falha ao armazenar arquivo", { status: 400 });
  return Response.json({ ok: true, size: bytes.byteLength, contentType: type });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return new Response("Não autorizado", { status: 401 });
  if (!validId(id))
    return new Response("Identificador inválido", { status: 400 });
  const { data: creative } = await supabase
    .from("creatives")
    .select("storage_path,mime_type")
    .eq("public_id", id)
    .maybeSingle();
  if (!creative) return new Response("Arquivo não encontrado", { status: 404 });
  const { data, error } = await supabase.storage
    .from("creatives")
    .download(creative.storage_path);
  if (error || !data)
    return new Response("Arquivo não encontrado", { status: 404 });
  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Type":
        creative.mime_type || data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
