import {mediaStore} from "@/lib/demo-store";

const validId=(id:string)=>/^[a-f0-9-]+$/.test(id);

export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!validId(id))return new Response("Identificador inválido",{status:400});
  const type=req.headers.get("content-type")||"";
  if(!["image/jpeg","image/png","image/webp","video/mp4","video/webm"].includes(type))return new Response("Formato não suportado",{status:400});
  const bytes=await req.arrayBuffer();
  if(bytes.byteLength>25*1024*1024)return new Response("Limite de 25 MB",{status:413});
  mediaStore().set(id,{bytes,type});
  return Response.json({ok:true});
}

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const file=mediaStore().get(id);
  if(!file)return new Response("Arquivo não encontrado",{status:404});
  return new Response(file.bytes,{headers:{"Content-Type":file.type,"Cache-Control":"private, max-age=3600","X-Content-Type-Options":"nosniff"}});
}
