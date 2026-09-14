import { notFound, redirect } from "next/navigation";
import AppShell, { type Area } from "@/components/app-shell";
import { areaForAccount, getAuthContext, roleLabel } from "@/lib/auth-context";

import AdminEstabelecimentos from "@/components/sections/admin/estabelecimentos";
import AdminTelas from "@/components/sections/admin/telas";
import AdminInventario from "@/components/sections/admin/inventario";
import AdminCampanhas from "@/components/sections/admin/campanhas";
import AdminCriativos from "@/components/sections/admin/criativos";
import AdminProgramacao from "@/components/sections/admin/programacao";
import AdminParceiros from "@/components/sections/admin/parceiros";
import AdminFinanceiro from "@/components/sections/admin/financeiro";
import AdminRelatorios from "@/components/sections/admin/relatorios";
import AdminIncidentes from "@/components/sections/admin/incidentes";
import AdminConfiguracoes from "@/components/sections/admin/configuracoes";

import AdsCampanhas from "@/components/sections/ads/campanhas";
import AdsLocais from "@/components/sections/ads/locais";
import AdsCriativos from "@/components/sections/ads/criativos";
import AdsRelatorios from "@/components/sections/ads/relatorios";
import AdsFaturamento from "@/components/sections/ads/faturamento";
import AdsAjuda from "@/components/sections/ads/ajuda";
import AdsConfiguracoes from "@/components/sections/ads/configuracoes";

import ParceiroMinhaTela from "@/components/sections/parceiro/minha-tela";
import ParceiroMeuConteudo from "@/components/sections/parceiro/meu-conteudo";
import ParceiroCampanhas from "@/components/sections/parceiro/campanhas";
import ParceiroFinanceiro from "@/components/sections/parceiro/financeiro";
import ParceiroExtratos from "@/components/sections/parceiro/extratos";
import ParceiroEstabelecimento from "@/components/sections/parceiro/estabelecimento";
import ParceiroSuporte from "@/components/sections/parceiro/suporte";
import ParceiroConfiguracoes from "@/components/sections/parceiro/configuracoes";

const SECTIONS: Record<Area, Record<string, (props: any) => React.ReactNode>> = {
  admin: {
    estabelecimentos: AdminEstabelecimentos,
    telas: AdminTelas,
    inventario: AdminInventario,
    campanhas: AdminCampanhas,
    criativos: AdminCriativos,
    programacao: AdminProgramacao,
    parceiros: AdminParceiros,
    financeiro: AdminFinanceiro,
    relatorios: AdminRelatorios,
    incidentes: AdminIncidentes,
    configuracoes: AdminConfiguracoes,
  },
  ads: {
    campanhas: AdsCampanhas,
    locais: AdsLocais,
    criativos: AdsCriativos,
    relatorios: AdsRelatorios,
    faturamento: AdsFaturamento,
    ajuda: AdsAjuda,
    configuracoes: AdsConfiguracoes,
  },
  parceiro: {
    "minha-tela": ParceiroMinhaTela,
    "meu-conteudo": ParceiroMeuConteudo,
    campanhas: ParceiroCampanhas,
    financeiro: ParceiroFinanceiro,
    extratos: ParceiroExtratos,
    estabelecimento: ParceiroEstabelecimento,
    suporte: ParceiroSuporte,
    configuracoes: ParceiroConfiguracoes,
  },
};

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string; section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { area, section } = await params;
  const resolvedSearchParams = await searchParams;
  if (!["admin", "ads", "parceiro"].includes(area)) notFound();
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");
  const allowedPath = areaForAccount(auth.organization.kind);
  if (`/${area}` !== allowedPath) redirect(allowedPath);

  const typedArea = area as Area;
  const Component = SECTIONS[typedArea]?.[section];
  if (!Component) notFound();

  return (
    <AppShell
      area={typedArea}
      orgName={auth.organization.name}
      roleLabel={roleLabel(auth.role)}
    >
      <Component path={`/${area}/${section}`} searchParams={resolvedSearchParams} />
    </AppShell>
  );
}
