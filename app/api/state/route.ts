import { ActionError, applyAction, context, loadState } from "@/lib/state";

const fail = (message: string, code = 400) =>
  Response.json({ error: message }, { status: code });

export async function GET() {
  const ctx = await context();
  if (!ctx) return fail("Não autorizado", 401);
  return Response.json(
    { state: await loadState(ctx), version: Date.now() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const ctx = await context();
    if (!ctx) return fail("Não autorizado", 401);
    const { action, payload = {} } = await request.json();
    const message = await applyAction(ctx, action, payload as Record<string, any>);
    return Response.json(
      { state: await loadState(ctx), version: Date.now(), message },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof ActionError) return fail(error.message, error.code);
    return fail(error instanceof Error ? error.message : "Falha ao salvar");
  }
}
