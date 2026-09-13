export type Screen = {
  id: string;
  name: string;
  category: string;
  status: string;
  sync: string;
  occupancy: number;
  hours: number;
  flow: number;
  approved: boolean;
  neighborhood?: string;
};
export type Creative = {
  id: string;
  name: string;
  status: string;
  url: string;
  type: string;
  reason?: string;
  own?: boolean;
};
export type Campaign = {
  id: string;
  name: string;
  advertiser: string;
  status: string;
  screenIds: string[];
  creativeId: string;
  frequency: number;
  start: string;
  end: string;
  budget: number;
  plays: number;
  objective: string;
  paid: boolean;
  contractedPlays?: number;
  reach?: number;
};
export type State = {
  screens: Screen[];
  creatives: Creative[];
  campaigns: Campaign[];
  tickets: {
    id: string;
    title: string;
    screenId: string;
    status: string;
    description: string;
  }[];
  audit: { date: string; text: string }[];
  settings: { name: string; email: string };
  contents: Creative[];
  financial?: { gross: number; share: number; paid: number; available: number };
};
export const seed: State = {
  screens: [
    ["001", "Academia Alpha", "Academias", "Online", 78, 16, 350],
    ["002", "Mercado Avenida", "Mercados", "Online", 59, 12, 600],
    ["003", "Clínica Central", "Clínicas", "Online", 42, 10, 180],
    ["014", "Padaria Central", "Padarias", "Offline", 64, 14, 480],
    ["019", "Restaurante Sabor", "Restaurantes", "Instável", 51, 10, 280],
    ["006", "Academia Movimento", "Academias", "Online", 38, 14, 300],
    ["007", "Mercado Bom Dia", "Mercados", "Online", 25, 12, 450],
    ["008", "Padaria São José", "Padarias", "Online", 45, 12, 320],
    ["009", "Clínica Vida", "Clínicas", "Online", 20, 8, 150],
    ["010", "Loja Aurora", "Lojas", "Online", 35, 10, 210],
    ["011", "Barbearia Centro", "Barbearias", "Online", 28, 10, 100],
    ["012", "Farmácia da Praça", "Farmácias", "Online", 40, 12, 380],
  ].map((r) => ({
    id: `VYOO-ML-${r[0]}`,
    name: String(r[1]),
    category: String(r[2]),
    status: String(r[3]),
    sync:
      r[3] === "Offline"
        ? "há 42 min"
        : r[3] === "Instável"
          ? "há 8 min"
          : "há 1 min",
    occupancy: Number(r[4]),
    hours: Number(r[5]),
    flow: Number(r[6]),
    approved: r[0] !== "007",
  })),
  creatives: [
    {
      id: "cr1",
      name: "Café da manhã",
      status: "Aprovado",
      url: "/assets/bakery.png",
      type: "image",
    },
    {
      id: "cr2",
      name: "Primavera na cidade",
      status: "Em análise",
      url: "/assets/bakery.png",
      type: "image",
    },
    {
      id: "cr3",
      name: "Sabores de outubro",
      status: "Em análise",
      url: "/assets/bakery.png",
      type: "image",
    },
  ],
  campaigns: [
    {
      id: "c1",
      name: "Café da manhã no Centro",
      advertiser: "Padaria Central",
      status: "Ativa",
      screenIds: [
        "VYOO-ML-001",
        "VYOO-ML-002",
        "VYOO-ML-003",
        "VYOO-ML-014",
        "VYOO-ML-019",
        "VYOO-ML-006",
        "VYOO-ML-008",
        "VYOO-ML-009",
      ],
      creativeId: "cr1",
      frequency: 4,
      start: "2026-09-01",
      end: "2026-09-30",
      budget: 1990,
      plays: 16800,
      objective: "Reconhecimento de marca",
      paid: true,
    },
    {
      id: "c2",
      name: "Encomendas da semana",
      advertiser: "Padaria Central",
      status: "Ativa",
      screenIds: ["VYOO-ML-001", "VYOO-ML-010", "VYOO-ML-011", "VYOO-ML-012"],
      creativeId: "cr1",
      frequency: 4,
      start: "2026-09-01",
      end: "2026-09-30",
      budget: 1000,
      plays: 8400,
      objective: "Promoção / oferta",
      paid: true,
    },
    {
      id: "c3",
      name: "Sabores de outubro",
      advertiser: "Padaria Central",
      status: "Em análise",
      screenIds: ["VYOO-ML-001", "VYOO-ML-002", "VYOO-ML-003"],
      creativeId: "cr3",
      frequency: 2,
      start: "2026-10-01",
      end: "2026-10-31",
      budget: 890,
      plays: 0,
      objective: "Lançamento",
      paid: true,
    },
    {
      id: "c4",
      name: "Primavera na cidade",
      advertiser: "Loja Aurora",
      status: "Em análise",
      screenIds: ["VYOO-ML-001", "VYOO-ML-002"],
      creativeId: "cr2",
      frequency: 2,
      start: "2026-10-01",
      end: "2026-10-31",
      budget: 650,
      plays: 0,
      objective: "Evento",
      paid: true,
    },
  ],
  tickets: [
    {
      id: "t1",
      title: "Sem sincronização",
      screenId: "VYOO-ML-014",
      status: "Aberto",
      description:
        "Sem sincronização há 42 min. Verificar conexão com o estabelecimento.",
    },
    {
      id: "t2",
      title: "Conexão instável",
      screenId: "VYOO-ML-019",
      status: "Aberto",
      description: "Oscilações de conexão. Reprodução local pode continuar.",
    },
  ],
  audit: [],
  settings: { name: "Rede VYOO", email: "" },
  contents: [
    {
      id: "own1",
      name: "Horários das aulas",
      status: "Aprovado",
      url: "/assets/gym.png",
      type: "image",
      own: true,
    },
  ],
};
export const money = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
export const num = (v: number) => v.toLocaleString("pt-BR");
export function cost(
  ids: string[],
  frequency: number,
  start: string,
  end: string,
) {
  const days = Math.max(
    1,
    Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1,
  );
  return Math.round(ids.length * frequency * days * 2.1);
}
export function available(
  s: State,
  screenId: string,
  start: string,
  end: string,
  ignore?: string,
) {
  const used = s.campaigns
    .filter(
      (c) =>
        c.id !== ignore &&
        c.screenIds.includes(screenId) &&
        !["Cancelada", "Encerrada"].includes(c.status) &&
        c.start <= end &&
        c.end >= start,
    )
    .reduce((n, c) => n + c.frequency, 0);
  return Math.max(0, 12 - used);
}
