import { PageHeader } from "@/components/page-header";

const faq = [
  {
    q: "Como funciona a veiculação na rede VYOO?",
    a: "Sua campanha é exibida em telas instaladas em estabelecimentos parceiros de Mateus Leme, com a frequência e o período que você escolher.",
  },
  {
    q: "Quanto tempo leva para minha campanha ser aprovada?",
    a: "A equipe VYOO analisa o criativo e a disponibilidade de inventário; a maioria das campanhas é aprovada em até 1 dia útil.",
  },
  {
    q: "Posso pausar uma campanha em andamento?",
    a: "Sim. Acesse Campanhas e use a ação de pausar; a veiculação para imediatamente e pode ser retomada quando desejar.",
  },
  {
    q: "Quais formatos de criativo são aceitos?",
    a: "Imagens (PNG, JPG, WebP) e vídeos (MP4, WebM) de até 25 MB, no formato recomendado 16:9.",
  },
  {
    q: "Como acompanho o desempenho da campanha?",
    a: "Em Relatórios você encontra exibições realizadas, alcance estimado e o progresso de cada campanha.",
  },
];

export default function AdsAjuda() {
  return (
    <>
      <PageHeader title="Ajuda" sub="Perguntas frequentes e suporte VYOO Ads." />
      <div className="panel">
        <div className="place-list">
          {faq.map((item) => (
            <div className="inventory-row" key={item.q} style={{ alignItems: "flex-start" }}>
              <span>
                <b>{item.q}</b>
                <small>{item.a}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="support-line">
        <span>Precisa falar com a equipe VYOO?</span>
        <a className="vy-button" href="mailto:contato@vyoomidia.com.br">
          Enviar e-mail
        </a>
      </div>
    </>
  );
}
