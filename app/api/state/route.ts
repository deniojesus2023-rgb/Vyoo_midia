import {available,cost,type State} from "@/lib/model";
import {demoStore} from "@/lib/demo-store";

export async function GET(){
  const store=demoStore();
  return Response.json({state:store.state,version:store.version});
}

export async function POST(req:Request){
  try{
    const store=demoStore();
    const body=await req.json() as {version:number;action:string;payload:any};
    if(body.version!==store.version)return Response.json({error:"Os dados foram atualizados. Recarregue a página."},{status:409});
    const state:State=structuredClone(store.state);
    const value=body.payload??{};
    let log="";

    if(body.action==="campaign.create"){
      if(!value.name?.trim()||!value.screenIds?.length||![2,4,6].includes(Number(value.frequency))||value.end<value.start)throw Error("Revise nome, período, frequência e locais.");
      if(!state.creatives.some(item=>item.id===value.creativeId))throw Error("Selecione um criativo.");
      for(const screenId of [...new Set(value.screenIds)] as string[]){
        if(!state.screens.some(screen=>screen.id===screenId&&screen.approved)||available(state,screenId,value.start,value.end)<Number(value.frequency))throw Error("Um local não possui capacidade para o período.");
      }
      state.campaigns.push({id:crypto.randomUUID(),name:value.name.slice(0,100),advertiser:"Padaria Central",status:"Em análise",screenIds:[...new Set(value.screenIds)] as string[],creativeId:value.creativeId,frequency:Number(value.frequency),start:value.start,end:value.end,budget:cost(value.screenIds,Number(value.frequency),value.start,value.end),plays:0,objective:String(value.objective),paid:true});
      log="Campanha enviada para análise";
    }else if(body.action==="creative.approve"||body.action==="creative.reject"){
      const creative=[...state.creatives,...state.contents].find(item=>item.id===value.id);
      if(!creative)throw Error("Criativo não encontrado.");
      if(body.action.endsWith("reject")&&!value.reason?.trim())throw Error("Informe o motivo da reprovação.");
      creative.status=body.action.endsWith("approve")?"Aprovado":"Reprovado";
      creative.reason=value.reason||"";
      for(const campaign of state.campaigns.filter(item=>item.creativeId===creative.id&&["Em análise","Ajustes necessários"].includes(item.status)))campaign.status=creative.status==="Aprovado"?"Agendada":"Ajustes necessários";
      log=`Criativo ${creative.name}: ${creative.status}`;
    }else if(body.action==="campaign.pause"||body.action==="campaign.resume"){
      const campaign=state.campaigns.find(item=>item.id===value.id);
      if(!campaign)throw Error("Campanha não encontrada.");
      campaign.status=body.action.endsWith("pause")?"Pausada":"Agendada";
      log=`Campanha ${campaign.name}: ${campaign.status}`;
    }else if(body.action==="screen.create"){
      if(!value.name?.trim())throw Error("Informe o estabelecimento.");
      state.screens.push({id:`VYOO-ML-${crypto.randomUUID().slice(0,6).toUpperCase()}`,name:value.name.slice(0,100),category:value.category||"Lojas",status:"Aguardando ativação",sync:"Nunca",occupancy:0,hours:10,flow:0,approved:false});
      log="Tela cadastrada e aguardando instalação";
    }else if(body.action==="partner.approve"){
      const screen=state.screens.find(item=>item.id===value.id);
      if(!screen)throw Error("Local não encontrado.");
      screen.approved=true;
      log=`Cadastro aprovado: ${screen.name}`;
    }else if(body.action==="ticket.create"){
      if(!value.title?.trim()||!value.description?.trim())throw Error("Preencha título e descrição.");
      state.tickets.push({id:crypto.randomUUID(),title:value.title.slice(0,100),description:value.description.slice(0,2000),screenId:value.screenId||"VYOO-ML-001",status:"Aberto"});
      log="Chamado aberto";
    }else if(body.action==="ticket.resolve"){
      const ticket=state.tickets.find(item=>item.id===value.id);
      if(!ticket)throw Error("Chamado não encontrado.");
      ticket.status="Resolvido";
      log=`Chamado resolvido: ${ticket.title}`;
    }else if(body.action==="settings.save"){
      state.settings={name:String(value.name||"Rede VYOO").slice(0,100),email:String(value.email||"").slice(0,200)};
      log="Preferências atualizadas";
    }else if(body.action==="creative.create"){
      if(!value.name?.trim()||!/^\/api\/media\/[a-f0-9-]+$/.test(value.url))throw Error("Envie um arquivo válido.");
      const creative={id:crypto.randomUUID(),name:value.name.slice(0,100),status:"Em análise",url:value.url,type:value.type==="video"?"video":"image",own:!!value.own};
      (value.own?state.contents:state.creatives).push(creative);
      log="Conteúdo enviado para análise";
    }else throw Error("Ação não reconhecida.");

    state.audit.unshift({date:new Date().toISOString(),text:log});
    state.audit=state.audit.slice(0,200);
    store.state=state;
    store.version+=1;
    return Response.json({state,version:store.version,message:log});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Falha ao salvar"},{status:400});
  }
}
