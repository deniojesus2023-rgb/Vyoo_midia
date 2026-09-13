import {createClient} from "@/lib/supabase/server";
import {cost,type State} from "@/lib/model";

const status:any={online:"Online",offline:"Offline",unstable:"Instável",maintenance:"Manutenção",awaiting_activation:"Aguardando ativação",disabled:"Desativada",draft:"Rascunho",in_review:"Em análise",scheduled:"Agendada",active:"Ativa",paused:"Pausada",changes_requested:"Ajustes necessários",rejected:"Reprovada",ended:"Encerrada",cancelled:"Cancelada",pending:"Em análise",approved:"Aprovado"};
const objective:any={"Reconhecimento de marca":"brand_awareness","Lançamento":"launch","Divulgação institucional":"institutional","Promoção / oferta":"promotion","Evento":"event","Outro":"other"};
const fail=(message:string,code=400)=>Response.json({error:message},{status:code});

async function context(){
 const db=await createClient();const {data:c}=await db.auth.getClaims();const uid=c?.claims?.sub;if(!uid)return null;
 const {data:m}=await db.from("organization_members").select("organization_id,role,organizations!inner(name,kind,status)").eq("user_id",uid).limit(1).maybeSingle();
 return m?{db,uid,orgId:m.organization_id,role:m.role,org:m.organizations}:null;
}
async function loadState(ctx:NonNullable<Awaited<ReturnType<typeof context>>>){
 const {db,org}=ctx;
 const [sq,cq,kq,tq,aq]=await Promise.all([
  db.from("screens").select("id,device_code,status,last_sync_at,ad_slots_per_hour,operating_hours_per_day,venues!inner(name,category,daily_flow_estimate,approval_status)"),
  db.from("creatives").select("id,public_id,name,media_type,storage_path,moderation_status,rejection_reason"),
  db.from("campaigns").select("id,public_id,name,status,start_date,end_date,budget_amount,objective,organizations!inner(name),campaign_screens(screen_id,plays_per_hour),campaign_creatives(creative_id),campaign_daily_stats(plays)"),
  db.from("support_tickets").select("public_id,title,status,description,screen_id"),
  db.from("audit_logs").select("created_at,action").order("created_at",{ascending:false}).limit(200)
 ]);
 const screens=(sq.data??[]).map((s:any)=>({id:s.device_code,name:s.venues.name,category:s.venues.category,status:status[s.status]??s.status,sync:s.last_sync_at??"Nunca",occupancy:0,hours:Number(s.operating_hours_per_day),flow:s.venues.daily_flow_estimate,approved:s.venues.approval_status==="approved"}));
 const creatives=(cq.data??[]).map((c:any)=>({id:c.public_id,name:c.name,status:status[c.moderation_status]??c.moderation_status,url:`/api/media/${c.storage_path.split("/").pop()}`,type:c.media_type,reason:c.rejection_reason??undefined}));
 const screenById=new Map((sq.data??[]).map((s:any)=>[s.id,s.device_code]));
 const campaigns=(kq.data??[]).map((c:any)=>({id:c.public_id,name:c.name,advertiser:c.organizations.name,status:status[c.status]??c.status,screenIds:c.campaign_screens.map((x:any)=>screenById.get(x.screen_id)).filter(Boolean),creativeId:creatives.find((x:any)=>x.id===(cq.data??[]).find((y:any)=>y.id===c.campaign_creatives[0]?.creative_id)?.public_id)?.id??"",frequency:c.campaign_screens[0]?.plays_per_hour??0,start:c.start_date,end:c.end_date,budget:Number(c.budget_amount),plays:c.campaign_daily_stats.reduce((n:number,x:any)=>n+Number(x.plays),0),objective:c.objective,paid:!!c.paid_at}));
 const tickets=(tq.data??[]).map((t:any)=>({id:t.public_id,title:t.title,screenId:screenById.get(t.screen_id)??"",status:status[t.status]??t.status,description:t.description}));
 const state:State={screens,creatives:org.kind==="partner"?[]:creatives,campaigns,tickets,audit:(aq.data??[]).map((a:any)=>({date:a.created_at,text:a.action})),settings:{name:org.name,email:""},contents:org.kind==="partner"?creatives.map((x:any)=>({...x,own:true})):[]};
 return state;
}
export async function GET(){const ctx=await context();if(!ctx)return fail("Não autorizado",401);return Response.json({state:await loadState(ctx),version:Date.now()})}
export async function POST(req:Request){
 try{const ctx=await context();if(!ctx)return fail("Não autorizado",401);const {db,uid,orgId}=ctx;const {action,payload:v={}}=await req.json();let message="";
 if(action==="creative.create"){const mediaId=String(v.url??"").split("/").pop();const {error}=await db.from("creatives").insert({advertiser_organization_id:orgId,name:String(v.name).slice(0,120),media_type:v.type==="video"?"video":"image",storage_path:`${uid}/${mediaId}`,mime_type:v.type==="video"?"video/mp4":"image/jpeg",file_size_bytes:1,created_by:uid});if(error)throw error;message="Criativo enviado para análise"}
 else if(action==="campaign.create"){const {data:s}=await db.from("screens").select("id,device_code").in("device_code",v.screenIds);const {data:cr}=await db.from("creatives").select("id").eq("public_id",v.creativeId).single();const budget=cost(v.screenIds,Number(v.frequency),v.start,v.end);const {data:c,error}=await db.from("campaigns").insert({advertiser_organization_id:orgId,name:v.name,objective:objective[v.objective]??"other",start_date:v.start,end_date:v.end,budget_amount:0,created_by:uid}).select("id").single();if(error||!c)throw error;await db.from("campaign_screens").insert((s??[]).map((x:any)=>({campaign_id:c.id,screen_id:x.id,plays_per_hour:Number(v.frequency),contracted_plays:0,unit_price:budget/Math.max(1,(s??[]).length)})));await db.from("campaign_creatives").insert({campaign_id:c.id,creative_id:cr!.id,is_primary:true});const {error:u}=await db.from("campaigns").update({status:"in_review"}).eq("id",c.id);if(u)throw u;message="Campanha enviada para análise"}
 else if(action==="campaign.pause"||action==="campaign.resume"){const {error}=await db.from("campaigns").update({status:action.endsWith("pause")?"paused":"scheduled"}).eq("public_id",v.id);if(error)throw error;message="Status da campanha atualizado"}
 else if(action==="creative.approve"||action==="creative.reject"){const {error}=await db.from("creatives").update({moderation_status:action.endsWith("approve")?"approved":"rejected",rejection_reason:v.reason||null}).eq("public_id",v.id);if(error)throw error;message="Moderação atualizada"}
 else if(action==="ticket.create"){const screen=await db.from("screens").select("id").eq("device_code",v.screenId).maybeSingle();const {error}=await db.from("support_tickets").insert({organization_id:orgId,opened_by:uid,screen_id:screen.data?.id,title:v.title,description:v.description});if(error)throw error;message="Chamado aberto"}
 else if(action==="ticket.resolve"){const {error}=await db.from("support_tickets").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("public_id",v.id);if(error)throw error;message="Chamado resolvido"}
 else if(action==="settings.save"){message="Preferências atualizadas"}
 else throw Error("Ação ainda não disponível no banco real.");
 return Response.json({state:await loadState(ctx),version:Date.now(),message});
 }catch(e){return fail(e instanceof Error?e.message:"Falha ao salvar")}
}
