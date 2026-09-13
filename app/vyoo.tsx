"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  FileBarChart,
  Film,
  Grid2X2,
  Headphones,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  Monitor,
  MoreHorizontal,
  Megaphone,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Store,
  Upload,
  Users,
  Wifi,
  X,
} from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vyoo-ui";
import {
  State,
  seed,
  money,
  num,
  available,
  cost,
  Campaign,
  Creative,
} from "@/lib/model";

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: any,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

type Area = "admin" | "ads" | "parceiro";
type Modal = { type: string; data?: any } | null;
const series = [
  620, 780, 910, 860, 1040, 980, 1210, 1320, 1190, 1410, 1280, 1510, 1440, 1580,
  1360, 1640, 1720, 1550, 1810, 1680, 1890, 1760, 2010, 1940, 2160, 2050, 2240,
  2110, 2380, 2310,
];
const menus = {
  admin: [
    ["Visão geral", LayoutDashboard],
    ["Estabelecimentos", Store],
    ["Telas", Monitor],
    ["Inventário", Grid2X2],
    ["Campanhas", Megaphone],
    ["Criativos", ImageIcon],
    ["Programação", CalendarDays],
    ["Parceiros", Users],
    ["Financeiro", CircleDollarSign],
    ["Relatórios", FileBarChart],
    ["Incidentes", AlertTriangle],
    ["Configurações", Settings],
  ],
  ads: [
    ["Visão geral", LayoutDashboard],
    ["Campanhas", Megaphone],
    ["Locais", MapPin],
    ["Criativos", ImageIcon],
    ["Relatórios", FileBarChart],
    ["Faturamento", CreditCard],
    ["Ajuda", Headphones],
    ["Configurações", Settings],
  ],
  parceiro: [
    ["Início", LayoutDashboard],
    ["Minha tela", Monitor],
    ["Meu conteúdo", ImageIcon],
    ["Campanhas", Megaphone],
    ["Financeiro", CircleDollarSign],
    ["Extratos", FileBarChart],
    ["Estabelecimento", Store],
    ["Suporte", Headphones],
    ["Configurações", Settings],
  ],
} as const;

export default function Vyoo({
  initialArea = "admin",
}: {
  initialArea?: string;
}) {
  const area: Area = ["admin", "ads", "parceiro"].includes(initialArea)
    ? (initialArea as Area)
    : "admin";
  const [data, setData] = useState<State>(seed),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState<Modal>(null),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false);
  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/state");
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setData(j.state);
      setVersion(j.version);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  const act = async (action: string, payload: any = {}) => {
    setError("");
    const r = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, action, payload }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || "Não foi possível salvar");
      return false;
    }
    setData(j.state);
    setVersion(j.version);
    setNotice(j.message);
    setModal(null);
    setTimeout(() => setNotice(""), 3500);
    return true;
  };
  useEffect(() => {
    const mc = document.modelContext;
    if (!mc?.registerTool) return;
    const ctl = new AbortController();
    const register = (tool: any) =>
      Promise.resolve(mc.registerTool(tool, { signal: ctl.signal })).catch(
        () => {},
      );
    register({
      name: "vyoo_read_overview",
      title: "Consultar visão geral VYOO",
      description:
        "Retorna os indicadores atuais do painel selecionado sem alterar dados.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({
        area,
        telas: data.screens.length,
        campanhasAtivas: data.campaigns.filter((c) => c.status === "Ativa")
          .length,
        exibicoes: data.campaigns.reduce((n, c) => n + c.plays, 0),
        incidentes: data.tickets.filter((t) => t.status === "Aberto").length,
      }),
    });
    register({
      name: "vyoo_start_campaign_creation",
      title: "Iniciar criação de campanha",
      description: "Abre o fluxo visível de criação de campanha no VYOO Ads.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => {
        if (area !== "ads")
          return {
            opened: false,
            reason: "Disponível somente para uma conta anunciante.",
          };
        setModal({ type: "campaign" });
        return { opened: true, area: "ads" };
      },
    });
    return () => ctl.abort();
  }, [area, data]);
  const areaLogo =
    area === "admin"
      ? "/vyoo-wordmark.svg"
      : area === "ads"
        ? "/vyoo-ads.svg"
        : "/vyoo-parceiros.svg";
  const areaLogoAlt =
    area === "admin"
      ? "VYOO Central"
      : area === "ads"
        ? "VYOO Ads"
        : "VYOO Parceiros";
  if (loading)
    return (
      <div className="loading">
        <span className="logo">
          VY<span>OO</span>
        </span>
        <p>Carregando a rede...</p>
      </div>
    );
  return (
    <div className={`app-shell area-${area}`}>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src={areaLogo} alt={areaLogoAlt} />
          {area === "admin" && (
            <small className="brand-context">CENTRAL DE OPERAÇÕES</small>
          )}
          <button className="close-mobile" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <nav>
          {menus[area].map(([label, Icon], i) => (
            <button key={label} className={i === 0 ? "active" : ""}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-note">
          <i></i>
          <div>
            <b>
              {area === "admin"
                ? "Rede operando"
                : area === "ads"
                  ? "Mídia em veiculação"
                  : "Player conectado"}
            </b>
            <small>Mateus Leme · MG</small>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <button className="account">
            <Building2 />
            <b>{data.settings.name || "Conta VYOO"}</b>
            <ChevronDown />
          </button>
          <span className="location">
            <MapPin />
            Mateus Leme / MG
          </span>
          <div className="top-spacer" />
          <button className="icon-btn" aria-label="Notificações">
            <Bell />
            <i />
          </button>
          <div className="profile">
            <span>{area === "admin" ? "MA" : "CM"}</span>
            <div>
              <b>{area === "admin" ? "Mariana Alves" : "Carlos Mendes"}</b>
              <small>
                {area === "admin"
                  ? "Administradora"
                  : area === "ads"
                    ? "Anunciante"
                    : "Proprietário"}
              </small>
            </div>
          </div>
        </header>
        <main className="content">
          {error && (
            <div className="alert error">
              {error}
              <button onClick={() => setError("")}>
                <X />
              </button>
            </div>
          )}
          {notice && <div className="toast">{notice}</div>}
          {area === "admin" ? (
            <Admin
              data={data}
              query={query}
              setQuery={setQuery}
              setModal={setModal}
            />
          ) : area === "ads" ? (
            <Ads
              data={data}
              query={query}
              setQuery={setQuery}
              setModal={setModal}
              act={act}
            />
          ) : (
            <Partner data={data} setModal={setModal} />
          )}
        </main>
      </div>
      <ModalView
        modal={modal}
        close={() => setModal(null)}
        data={data}
        act={act}
      />
    </div>
  );
}

function Header({
  title,
  sub,
  action,
  onAction,
}: {
  title: string;
  sub: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      <div className="head-actions">
        <button className="date">
          <CalendarDays />
          01–30 set 2026
          <ChevronDown />
        </button>
        <Button onClick={onAction}>
          <Plus />
          {action}
        </Button>
      </div>
    </div>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="stat panel">
      <span>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={`status ${value.toLowerCase().replaceAll(" ", "-").replace("ç", "c")}`}
    >
      <i />
      {value}
    </span>
  );
}
function Chart({ partner = false }: { partner?: boolean }) {
  const max = Math.max(...series),
    pts = series
      .map((v, i) => `${(i / 29) * 800},${150 - (v / max) * 125}`)
      .join(" ");
  return (
    <div className="chart">
      <div className="y-labels">
        <span>2.500</span>
        <span>1.250</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 800 160" preserveAspectRatio="none">
        <defs>
          <linearGradient
            id={partner ? "g2" : "g1"}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#00b96b" stopOpacity=".16" />
            <stop offset="1" stopColor="#00b96b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${pts.replaceAll(" ", " L ")} L 800 155 L 0 155 Z`}
          fill={`url(#${partner ? "g2" : "g1"})`}
        />
        <polyline points={pts} fill="none" stroke="#08ad68" strokeWidth="3" />
        <g>
          {series
            .filter((_, i) => i % 5 === 0)
            .map((v, i) => (
              <circle
                key={i}
                cx={((i * 5) / 29) * 800}
                cy={150 - (v / max) * 125}
                r="3.5"
                fill="#08ad68"
              />
            ))}
        </g>
      </svg>
      <div className="x-labels">
        <span>01/09</span>
        <span>05/09</span>
        <span>10/09</span>
        <span>15/09</span>
        <span>20/09</span>
        <span>25/09</span>
        <span>30/09</span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function Admin({
  data,
  query,
  setQuery,
  setModal,
}: {
  data: State;
  query: string;
  setQuery: (v: string) => void;
  setModal: (m: Modal) => void;
}) {
  const active = data.campaigns.filter((c) => c.status === "Ativa");
  const online = data.screens.filter((s) => s.status === "Online").length;
  const pending = data.creatives.filter((c) => c.status === "Em análise");
  const pendingPartners = data.screens.filter((s) => !s.approved);
  const tickets = data.tickets.filter((t) => t.status === "Aberto");
  const avgOccupancy = data.screens.length
    ? Math.round(
        data.screens.reduce((n, s) => n + s.occupancy, 0) / data.screens.length,
      )
    : 0;
  const filtered = data.screens.filter((s) =>
    (s.name + s.id + s.category).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Header
        title="Central da rede"
        sub="Operação, capacidade e entrega da mídia local."
        action="Cadastrar tela"
        onAction={() => setModal({ type: "screen" })}
      />
      <section className="ops-band">
        <div className="ops-title">
          <span className="live-dot" />
          <div>
            <small>STATUS AGORA</small>
            <h2>Rede em operação</h2>
            <p>
              {data.screens.length
                ? `${online} de ${data.screens.length} telas respondendo normalmente`
                : "Nenhuma tela cadastrada"}
            </p>
          </div>
        </div>
        <Metric
          value={`${online}/${data.screens.length}`}
          label="telas online"
        />
        <Metric
          value={data.screens.length ? "99,2%" : "—"}
          label="disponibilidade"
        />
        <Metric value={tickets.length} label="incidentes" />
        <Metric
          value={`${Math.max(0, 100 - avgOccupancy)}%`}
          label="inventário livre"
        />
        <button onClick={() => setModal({ type: "inventory" })}>
          Ver capacidade <ArrowRight />
        </button>
        <div className="uptime">
          <span>00h</span>
          <i>
            {Array.from({ length: 48 }).map((_, i) => (
              <b
                key={i}
                className={i === 18 ? "down" : i === 39 ? "warn" : ""}
              />
            ))}
          </i>
          <span>24h</span>
        </div>
      </section>
      <div className="admin-workspace">
        <section className="admin-main">
          <div className="panel table-panel network-table" id="network">
            <div className="panel-head">
              <div>
                <h3>Monitoramento da rede</h3>
                <span>{data.screens.length} telas conectadas</span>
              </div>
              <div className="search">
                <Search />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar tela, local ou categoria"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da tela</TableHead>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última sincronização</TableHead>
                  <TableHead>Ocupação</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 8).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="mono">{s.id}</TableCell>
                    <TableCell>
                      <b>{s.name}</b>
                      <small>Mateus Leme · MG</small>
                    </TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>
                      <Status value={s.status} />
                    </TableCell>
                    <TableCell>{formatSync(s.sync)}</TableCell>
                    <TableCell>
                      <div className="occupancy">
                        <span>{s.occupancy}%</span>
                        <i>
                          <b style={{ width: `${s.occupancy}%` }} />
                        </i>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="row-action"
                        aria-label={`Detalhes de ${s.name}`}
                        onClick={() =>
                          setModal({ type: "screen-detail", data: s })
                        }
                      >
                        <MoreHorizontal />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filtered.length && <Empty text="Nenhuma tela encontrada." />}
          </div>
          <div className="admin-analytics">
            <div className="panel chart-panel">
              <div className="panel-head">
                <div>
                  <h3>Entrega de mídia</h3>
                  <span>Realizadas x programadas</span>
                </div>
                <div className="legend">
                  <i />
                  Realizadas <i className="gray" />
                  Programadas
                </div>
              </div>
              <Chart />
            </div>
            <div className="panel capacity-panel">
              <div className="panel-head">
                <div>
                  <h3>Capacidade por horário</h3>
                  <span>Ocupação média da rede</span>
                </div>
              </div>
              <div className="capacity-hours">
                <span>06h</span>
                <span>09h</span>
                <span>12h</span>
                <span>15h</span>
                <span>18h</span>
                <span>21h</span>
              </div>
              <div className="capacity-grid">
                {Array.from({ length: 42 }).map((_, i) => (
                  <i key={i} style={{ opacity: 0.16 + ((i * 7) % 10) / 13 }} />
                ))}
              </div>
              <div className="capacity-key">
                <span>
                  <i />
                  Livre
                </span>
                <span>
                  <i />
                  Moderado
                </span>
                <span>
                  <i />
                  Ocupado
                </span>
              </div>
            </div>
          </div>
        </section>
        <aside className="attention-rail panel">
          <div className="rail-title">
            <div>
              <span>FILA OPERACIONAL</span>
              <h3>Requer atenção</h3>
            </div>
            <b>{pending.length + pendingPartners.length + tickets.length}</b>
          </div>
          {pending.map((c) => (
            <button
              className="attention-item"
              key={c.id}
              onClick={() => setModal({ type: "creative", data: c })}
            >
              <ImageIcon />
              <span>
                <b>Revisar criativo</b>
                <small>{c.name}</small>
              </span>
              <ArrowRight />
            </button>
          ))}
          {pendingPartners.map((s) => (
            <button
              className="attention-item"
              key={s.id}
              onClick={() => setModal({ type: "partner-approve", data: s })}
            >
              <Store />
              <span>
                <b>Novo parceiro</b>
                <small>{s.name}</small>
              </span>
              <ArrowRight />
            </button>
          ))}
          {tickets.map((t) => (
            <button
              className="attention-item urgent"
              key={t.id}
              onClick={() => setModal({ type: "ticket", data: t })}
            >
              <AlertTriangle />
              <span>
                <b>{t.title}</b>
                <small>
                  {data.screens.find((s) => s.id === t.screenId)?.name ||
                    t.screenId}
                </small>
              </span>
              <ArrowRight />
            </button>
          ))}
          {!pending.length && !pendingPartners.length && !tickets.length && (
            <div className="all-clear">
              <span>✓</span>
              <b>Fila em dia</b>
              <p>Nenhuma ação pendente agora.</p>
            </div>
          )}
          <div className="rail-summary">
            <span>
              Campanhas ativas <b>{active.length}</b>
            </span>
            <span>
              Exibições entregues{" "}
              <b>{num(active.reduce((n, c) => n + c.plays, 0))}</b>
            </span>
            <span>
              Receita contratada{" "}
              <b>
                {money(
                  data.campaigns
                    .filter((c) => c.paid)
                    .reduce((n, c) => n + c.budget, 0),
                )}
              </b>
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}

function Ads({
  data,
  query,
  setQuery,
  setModal,
  act,
}: {
  data: State;
  query: string;
  setQuery: (v: string) => void;
  setModal: (m: Modal) => void;
  act: (a: string, p?: any) => Promise<boolean>;
}) {
  const mine = data.campaigns;
  const active = mine.filter((c) => c.status === "Ativa");
  const locations = new Set(active.flatMap((c) => c.screenIds));
  const filtered = mine.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );
  const featured = active[0] || mine[0];
  const creative =
    data.creatives.find((c) => c.id === featured?.creativeId) ||
    data.creatives[0];
  const contracted =
    featured?.contractedPlays || Math.max(featured?.plays || 0, 24000);
  const progress = contracted
    ? Math.min(100, Math.round(((featured?.plays || 0) / contracted) * 100))
    : 0;
  const selectedScreens = data.screens.filter((s) => locations.has(s.id));
  const mix = Object.entries(groupScreens(selectedScreens));
  return (
    <>
      <Header
        title="Visão geral"
        sub="Planeje sua presença e acompanhe a entrega da mídia."
        action="Criar campanha"
        onAction={() => setModal({ type: "campaign" })}
      />
      <div className="ads-intro">
        <div>
          <small>VYOO ADS</small>
          <h2>Sua marca presente em Mateus Leme.</h2>
          <p>
            Acompanhe campanhas veiculadas em estabelecimentos reais da cidade.
          </p>
        </div>
        <div className="editorial-note">
          <i />
          <span>
            NEGÓCIOS LOCAIS
            <br />
            PESSOAS REAIS
            <br />
            MAIS MOVIMENTO
          </span>
        </div>
      </div>
      <div className="media-flight-grid">
        <section className="panel media-flight">
          <div className="flight-head">
            <div>
              <small>CAMPANHA EM DESTAQUE</small>
              <h3>{featured?.name || "Sua primeira campanha"}</h3>
            </div>
            {featured && <Status value={featured.status} />}
          </div>
          {featured ? (
            <>
              <div className="flight-dates">
                <b>{date(featured.start)}</b>
                <span>Veiculação contratada</span>
                <b>{date(featured.end)}</b>
              </div>
              <div className="flight-track">
                <i style={{ width: `${progress}%` }} />
                <b style={{ left: `${Math.max(2, Math.min(98, progress))}%` }}>
                  Hoje
                </b>
              </div>
              <div className="flight-metrics">
                <Metric
                  value={num(featured.plays)}
                  label={`de ${num(contracted)} exibições`}
                />
                <Metric value={`${progress}%`} label="da entrega" />
                <Metric value={featured.screenIds.length} label="locais" />
                <Metric value={`${featured.frequency}/h`} label="frequência" />
                <Metric
                  value={
                    featured.reach
                      ? num(featured.reach)
                      : num(
                          featured.screenIds.reduce(
                            (n, id) =>
                              n +
                              (data.screens.find((s) => s.id === id)?.flow ||
                                0),
                            0,
                          ) * 30,
                        )
                  }
                  label="alcance estimado"
                />
              </div>
              <button
                className="text-action"
                onClick={() =>
                  setModal({ type: "campaign-detail", data: featured })
                }
              >
                Abrir campanha <ArrowRight />
              </button>
            </>
          ) : (
            <Empty text="Crie uma campanha para começar sua presença na cidade." />
          )}
        </section>
        <aside className="panel city-presence">
          <div className="panel-head">
            <div>
              <h3>Presença na cidade</h3>
              <span>{locations.size} locais em veiculação</span>
            </div>
            <MapPin />
          </div>
          <div className="city-board">
            <span className="district d1">Centro</span>
            <span className="district d2">Azurita</span>
            <span className="district d3">Sítio Novo</span>
            {selectedScreens.slice(0, 8).map((s, i) => (
              <button
                key={s.id}
                className={`venue-dot p${i + 1}`}
                title={s.name}
                onClick={() => setModal({ type: "screen-detail", data: s })}
              >
                <i />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
          <button
            className="text-action"
            onClick={() =>
              setModal({ type: "locations", data: [...locations] })
            }
          >
            Ver todos os locais <ArrowRight />
          </button>
        </aside>
      </div>
      <div className="ads-lower">
        <section className="panel table-panel campaign-ledger">
          <div className="panel-head">
            <div>
              <h3>Campanhas</h3>
              <span>
                Todas ({mine.length}) · Ativas ({active.length}) · Em análise (
                {mine.filter((c) => c.status === "Em análise").length})
              </span>
            </div>
            <div className="search">
              <Search />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar campanha"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Região</TableHead>
                <TableHead>Locais</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Exibições</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Período</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <b>{c.name}</b>
                    <small>{c.objective}</small>
                  </TableCell>
                  <TableCell>
                    <Status value={c.status} />
                  </TableCell>
                  <TableCell>Mateus Leme</TableCell>
                  <TableCell>{c.screenIds.length}</TableCell>
                  <TableCell>{c.frequency}/h</TableCell>
                  <TableCell>{num(c.plays)}</TableCell>
                  <TableCell>{money(c.budget)}</TableCell>
                  <TableCell>
                    {shortDate(c.start)}–{shortDate(c.end)}
                  </TableCell>
                  <TableCell>
                    <button
                      className="row-action"
                      onClick={() =>
                        setModal({ type: "campaign-detail", data: c })
                      }
                    >
                      <MoreHorizontal />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!filtered.length && <Empty text="Nenhuma campanha encontrada." />}
        </section>
        <aside className="panel creative-sheet">
          <div className="panel-head">
            <div>
              <h3>Criativo em exibição</h3>
              <span>Prévia 16:9</span>
            </div>
          </div>
          <div className="bakery-creative">
            <small>{data.settings.name}</small>
            <b>
              SEU CAFÉ
              <br />
              COMEÇA AQUI.
            </b>
            <span>Mateus Leme · MG</span>
          </div>
          <div className="creative-file">
            <Play />
            <span>
              <b>{creative?.name || "Nenhum criativo"}</b>
              <small>
                {creative?.type === "video"
                  ? "Vídeo · 15 segundos"
                  : "Imagem · 1920 × 1080"}
              </small>
            </span>
            {creative && <Status value={creative.status} />}
          </div>
          <button
            className="text-action"
            onClick={() =>
              setModal({ type: "creative-detail", data: creative })
            }
          >
            Ver criativo <ArrowRight />
          </button>
        </aside>
      </div>
      <section className="placement-mix">
        <div>
          <small>MIX DE LOCAIS</small>
          <h3>Onde sua mídia está presente</h3>
        </div>
        {mix.length ? (
          mix.map(([name, total]) => (
            <div className="mix-item" key={name}>
              <span>{name}</span>
              <b>{total}</b>
              <i>
                <em
                  style={{
                    width: `${Math.max(18, (total / Math.max(1, locations.size)) * 100)}%`,
                  }}
                />
              </i>
            </div>
          ))
        ) : (
          <span className="empty-inline">
            Os locais aparecerão quando a campanha entrar em veiculação.
          </span>
        )}
      </section>
    </>
  );
}

function Partner({
  data,
  setModal,
}: {
  data: State;
  setModal: (m: Modal) => void;
}) {
  const screen = data.screens[0];
  const campaigns = screen
    ? data.campaigns.filter(
        (c) =>
          c.screenIds.includes(screen.id) &&
          ["Ativa", "Agendada"].includes(c.status),
      )
    : [];
  const plays = campaigns.reduce((n, c) => n + c.plays, 0);
  const share =
    data.financial?.available ??
    Math.round(
      campaigns
        .filter((c) => c.status === "Ativa")
        .reduce((n, c) => n + c.budget / Math.max(1, c.screenIds.length), 0) *
        0.3,
    );
  return (
    <>
      <Header
        title="Olá, Carlos."
        sub="Sua unidade está conectada à rede VYOO."
        action="Enviar conteúdo"
        onAction={() => setModal({ type: "upload-own" })}
      />
      <div className="partner-lead">
        <section className="screen-stage">
          <div className="screen-copy">
            <span>
              <Wifi /> MINHA TELA
            </span>
            <h2>{screen?.id || "Aguardando instalação"}</h2>
            {screen && <Status value={screen.status} />}
            <dl>
              <div>
                <dt>Última sincronização</dt>
                <dd>{screen ? formatSync(screen.sync) : "—"}</dd>
              </div>
              <div>
                <dt>Programação de hoje</dt>
                <dd>06:00 – 23:00</dd>
              </div>
            </dl>
            <button
              onClick={() =>
                screen && setModal({ type: "screen-detail", data: screen })
              }
            >
              Ver programação <ArrowRight />
            </button>
          </div>
          <div className="tv-frame">
            <div>
              <img src="/vyoo-parceiros-reverse.svg" alt="VYOO Parceiros" />
              <b>
                DISCIPLINA HOJE.
                <br />
                <em>RESULTADOS SEMPRE.</em>
              </b>
              <small>Conteúdo em exibição</small>
            </div>
          </div>
        </section>
        <section className="partner-statement panel">
          <div className="statement-head">
            <div>
              <small>SEU REPASSE</small>
              <h3>
                {money(share)} <span>disponível</span>
              </h3>
            </div>
            <CalendarDays />
          </div>
          <p>
            Próximo pagamento <b>10 out 2026</b>
          </p>
          <div className="statement-lines">
            <span>
              Publicidade exibida{" "}
              <b>{money(data.financial?.gross || Math.round(share / 0.4))}</b>
            </span>
            <span>
              Sua participação{" "}
              <b>{money(data.financial?.share || Math.round(share * 1.775))}</b>
            </span>
            <span>
              Já pago{" "}
              <b>{money(data.financial?.paid || Math.round(share * 0.775))}</b>
            </span>
            <span className="statement-total">
              A receber neste ciclo <b>{money(share)}</b>
            </span>
          </div>
          <button onClick={() => setModal({ type: "statement" })}>
            Ver extrato <ArrowRight />
          </button>
        </section>
      </div>
      <div className="partner-middle">
        <section className="panel partner-activity">
          <div className="panel-head">
            <div>
              <h3>Atividade da sua tela</h3>
              <span>Últimos 30 dias</span>
            </div>
          </div>
          <div className="activity-metrics">
            <Metric value={num(plays)} label="exibições" />
            <Metric
              value={screen?.status === "Online" ? "99,6%" : "—"}
              label="online"
            />
            <Metric value={campaigns.length} label="campanhas" />
          </div>
          <Chart partner />
        </section>
        <section className="panel own-content">
          <div className="panel-head">
            <div>
              <h3>Comunicação de {data.settings.name}</h3>
              <span>Seu conteúdo na tela</span>
            </div>
          </div>
          {data.contents.map((c, i) => (
            <div className="content-row" key={c.id}>
              <div className={`own-thumb own-${i % 2}`}>
                <ImageIcon />
              </div>
              <div>
                <b>{c.name}</b>
                <small>
                  {c.type === "video" ? "Vídeo" : "Imagem"} · conteúdo próprio
                </small>
              </div>
              <Status value={c.status} />
              <button
                className="row-action"
                onClick={() => setModal({ type: "creative-detail", data: c })}
              >
                <MoreHorizontal />
              </button>
            </div>
          ))}
          {!data.contents.length && (
            <Empty text="Envie a comunicação do seu estabelecimento." />
          )}
          <button
            className="outline-action"
            onClick={() => setModal({ type: "upload-own" })}
          >
            Gerenciar conteúdos <ArrowRight />
          </button>
        </section>
      </div>
      <section className="panel table-panel partner-campaigns">
        <div className="panel-head">
          <div>
            <h3>Campanhas na sua tela</h3>
            <span>Anunciantes exibidos na sua unidade</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Exibições entregues</TableHead>
              <TableHead>Sua participação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <b>{c.name}</b>
                </TableCell>
                <TableCell>{c.advertiser}</TableCell>
                <TableCell>
                  {shortDate(c.start)}–{shortDate(c.end)}
                </TableCell>
                <TableCell>
                  {num(Math.round(c.plays / Math.max(1, c.screenIds.length)))}
                </TableCell>
                <TableCell>
                  {money(
                    Math.round(
                      (c.budget / Math.max(1, c.screenIds.length)) * 0.3,
                    ),
                  )}
                </TableCell>
                <TableCell>
                  <Status value={c.status} />
                </TableCell>
                <TableCell>
                  <button
                    className="row-action"
                    onClick={() =>
                      setModal({ type: "campaign-detail", data: c })
                    }
                  >
                    <MoreHorizontal />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!campaigns.length && (
          <Empty text="As campanhas aparecerão quando sua tela entrar na programação." />
        )}
      </section>
      <div className="support-line">
        <Headphones />
        <span>Precisa de ajuda com sua tela?</span>
        <button onClick={() => setModal({ type: "new-ticket" })}>
          Abrir chamado <ArrowRight />
        </button>
      </div>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span>—</span>
      <p>{text}</p>
    </div>
  );
}
function formatSync(value: string) {
  if (!value || value === "Nunca") return "Nunca";
  if (value.startsWith("há") || value.startsWith("agora")) return value;
  const d = new Date(value);
  return Number.isNaN(d.valueOf())
    ? value
    : d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}
function shortDate(value: string) {
  if (!value) return "—";
  const [, m, d] = value.split("-");
  return `${d}/${m}`;
}

function ModalView({
  modal,
  close,
  data,
  act,
}: {
  modal: Modal;
  close: () => void;
  data: State;
  act: (a: string, p?: any) => Promise<boolean>;
}) {
  if (!modal) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="modal">
        <DialogHeader>
          <DialogTitle>{modalTitle(modal.type)}</DialogTitle>
          <DialogDescription>{modalDesc(modal.type)}</DialogDescription>
        </DialogHeader>
        {modal.type === "campaign" ? (
          <CampaignForm data={data} act={act} />
        ) : modal.type === "screen" ? (
          <ScreenForm act={act} />
        ) : modal.type === "creative" ? (
          <CreativeReview c={modal.data} act={act} />
        ) : modal.type === "upload-own" ? (
          <UploadForm act={act} />
        ) : modal.type === "partner-approve" ? (
          <PartnerApprove s={modal.data} act={act} />
        ) : modal.type === "ticket" ? (
          <TicketView t={modal.data} data={data} act={act} />
        ) : modal.type === "new-ticket" ? (
          <TicketForm data={data} act={act} />
        ) : modal.type === "inventory" ? (
          <Inventory data={data} />
        ) : modal.type === "locations" ? (
          <Locations ids={modal.data} data={data} />
        ) : modal.type === "statement" ? (
          <Statement data={data} />
        ) : modal.type === "screen-detail" ? (
          <ScreenDetail s={modal.data} />
        ) : modal.type === "campaign-detail" ? (
          <CampaignDetail c={modal.data} data={data} act={act} />
        ) : modal.type === "creative-detail" ? (
          <CreativeDetail c={modal.data} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
function CampaignForm({ data, act }: { data: State; act: any }) {
  const [step, setStep] = useState(1),
    [form, setForm] = useState({
      name: "",
      objective: "Reconhecimento de marca",
      start: "2026-10-01",
      end: "2026-10-31",
      frequency: "2",
      creativeId: data.creatives.find((c) => c.status === "Aprovado")?.id || "",
      screenIds: [] as string[],
    });
  const ok =
    step === 1
      ? form.name.trim() && form.objective
      : step === 2
        ? form.start && form.end && form.end >= form.start
        : step === 3
          ? form.screenIds.length
          : step === 4
            ? form.creativeId
            : true;
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  return (
    <>
      <div className="steps">
        {[
          "Objetivo",
          "Período",
          "Locais",
          "Criativo",
          "Frequência",
          "Orçamento",
          "Revisão",
        ].map((x, i) => (
          <span className={i + 1 <= step ? "on" : ""} key={x}>
            <b>{i + 1}</b>
            {x}
          </span>
        ))}
      </div>
      <div className="form-body">
        {step === 1 && (
          <>
            <Field label="Nome da campanha">
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex.: Outubro em Mateus Leme"
                maxLength={100}
              />
            </Field>
            <Field label="Objetivo">
              <Select
                value={form.objective}
                onValueChange={(v) => set("objective", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Reconhecimento de marca",
                    "Lançamento",
                    "Divulgação institucional",
                    "Promoção / oferta",
                    "Evento",
                    "Outro",
                  ].map((x) => (
                    <SelectItem value={x} key={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </>
        )}
        {step === 2 && (
          <div className="two">
            <Field label="Início">
              <Input
                type="date"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
              />
            </Field>
            <Field label="Término">
              <Input
                type="date"
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
              />
            </Field>
          </div>
        )}
        {step === 3 && (
          <div className="place-list">
            {data.screens
              .filter((s) => s.approved)
              .map((s) => {
                const cap = available(data, s.id, form.start, form.end);
                return (
                  <label key={s.id}>
                    <Checkbox
                      checked={form.screenIds.includes(s.id)}
                      onCheckedChange={(v) =>
                        set(
                          "screenIds",
                          v
                            ? [...form.screenIds, s.id]
                            : form.screenIds.filter((x) => x !== s.id),
                        )
                      }
                    />
                    <span>
                      <b>{s.name}</b>
                      <small>
                        {s.category} · capacidade disponível {cap}/h
                      </small>
                    </span>
                    <Status
                      value={
                        cap < 2
                          ? "Indisponível"
                          : cap < 6
                            ? "Pouca disponibilidade"
                            : "Disponível"
                      }
                    />
                  </label>
                );
              })}
          </div>
        )}
        {step === 4 && (
          <div className="choice-grid">
            {data.creatives.map((c) => (
              <button
                className={form.creativeId === c.id ? "selected" : ""}
                disabled={c.status !== "Aprovado"}
                onClick={() => set("creativeId", c.id)}
                key={c.id}
              >
                <ImageIcon />
                <b>{c.name}</b>
                <Status value={c.status} />
              </button>
            ))}
          </div>
        )}
        {step === 5 && (
          <div className="choice-grid frequency">
            {[
              ["2", "Presença"],
              ["4", "Destaque"],
              ["6", "Alta frequência"],
            ].map(([v, n]) => (
              <button
                className={form.frequency === v ? "selected" : ""}
                onClick={() => set("frequency", v)}
                key={v}
              >
                <strong>{v}/h</strong>
                <b>{n}</b>
                <small>por tela selecionada</small>
              </button>
            ))}
          </div>
        )}
        {step === 6 && (
          <div className="summary">
            <p>{form.screenIds.length} locais</p>
            <p>{form.frequency} exibições/hora</p>
            <p>
              {form.start} a {form.end}
            </p>
            <strong>
              {money(
                cost(
                  form.screenIds,
                  Number(form.frequency),
                  form.start,
                  form.end,
                ),
              )}
            </strong>
            <small>
              Preço demonstrativo calculado conforme locais, frequência e
              período.
            </small>
          </div>
        )}
        {step === 7 && (
          <div className="review">
            <h3>{form.name}</h3>
            <div>
              <span>Objetivo</span>
              <b>{form.objective}</b>
            </div>
            <div>
              <span>Locais</span>
              <b>{form.screenIds.length}</b>
            </div>
            <div>
              <span>Frequência</span>
              <b>{form.frequency}/h por tela</b>
            </div>
            <div>
              <span>Período</span>
              <b>
                {date(form.start)}–{date(form.end)}
              </b>
            </div>
            <div>
              <span>Investimento</span>
              <b>
                {money(
                  cost(
                    form.screenIds,
                    Number(form.frequency),
                    form.start,
                    form.end,
                  ),
                )}
              </b>
            </div>
            <p>Pagamento e programação serão simulados nesta demonstração.</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => step > 1 && setStep(step - 1)}>
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>
        {step < 7 ? (
          <Button disabled={!ok} onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        ) : (
          <Button onClick={() => act("campaign.create", form)}>
            Enviar para aprovação
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
function ScreenForm({ act }: { act: any }) {
  const [name, setName] = useState(""),
    [category, setCategory] = useState("Lojas");
  return (
    <>
      <Field label="Estabelecimento">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do local"
        />
      </Field>
      <Field label="Categoria">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "Academias",
              "Padarias",
              "Mercados",
              "Clínicas",
              "Restaurantes",
              "Lojas",
            ].map((x) => (
              <SelectItem key={x} value={x}>
                {x}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <DialogFooter>
        <Button onClick={() => act("screen.create", { name, category })}>
          Cadastrar tela
        </Button>
      </DialogFooter>
    </>
  );
}
function CreativeReview({ c, act }: { c: Creative; act: any }) {
  const [reason, setReason] = useState("");
  return (
    <>
      <div className="review-preview">
        <ImageIcon />
        <h3>{c.name}</h3>
        <Status value={c.status} />
        <p>Imagem · 1920 × 1080 · validação técnica concluída</p>
      </div>
      <Field label="Motivo, se reprovar">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explique o ajuste necessário"
        />
      </Field>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => act("creative.reject", { id: c.id, reason })}
        >
          Reprovar
        </Button>
        <Button onClick={() => act("creative.approve", { id: c.id })}>
          Aprovar criativo
        </Button>
      </DialogFooter>
    </>
  );
}
function UploadForm({ act }: { act: any }) {
  const [name, setName] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false);
  const send = async () => {
    if (!file || !name.trim()) return;
    setBusy(true);
    const id = crypto.randomUUID();
    const r = await fetch(`/api/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (r.ok) {
      const upload = await r.json();
      await act("creative.create", {
        name,
        url: `/api/media/${id}`,
        type: file.type.startsWith("video") ? "video" : "image",
        mimeType: upload.contentType,
        fileSize: upload.size,
        own: true,
      });
    }
    setBusy(false);
  };
  return (
    <>
      <Field label="Nome do conteúdo">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Horários de outubro"
        />
      </Field>
      <label className="upload">
        <Upload />
        <b>Selecionar imagem ou vídeo</b>
        <small>PNG, JPG, WebP ou MP4 · até 25 MB</small>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && <span>{file.name}</span>}
      </label>
      <DialogFooter>
        <Button disabled={!file || !name || busy} onClick={send}>
          {busy ? "Enviando..." : "Enviar para análise"}
        </Button>
      </DialogFooter>
    </>
  );
}
function PartnerApprove({ s, act }: { s: any; act: any }) {
  return (
    <>
      <div className="detail-list">
        <p>
          <span>Estabelecimento</span>
          <b>{s.name}</b>
        </p>
        <p>
          <span>Categoria</span>
          <b>{s.category}</b>
        </p>
        <p>
          <span>Status operacional</span>
          <Status value={s.status} />
        </p>
        <p>
          <span>Próxima etapa</span>
          <b>Instalação e ativação do player</b>
        </p>
      </div>
      <DialogFooter>
        <Button onClick={() => act("partner.approve", { id: s.id })}>
          Aprovar cadastro
        </Button>
      </DialogFooter>
    </>
  );
}
function TicketView({ t, data, act }: { t: any; data: State; act: any }) {
  return (
    <>
      <div className="detail-list">
        <p>
          <span>Tela</span>
          <b>{t.screenId}</b>
        </p>
        <p>
          <span>Estabelecimento</span>
          <b>{data.screens.find((s) => s.id === t.screenId)?.name}</b>
        </p>
        <p>
          <span>Situação</span>
          <Status value={t.status} />
        </p>
        <p>
          <span>Descrição</span>
          <b>{t.description}</b>
        </p>
      </div>
      {t.status === "Aberto" && (
        <DialogFooter>
          <Button onClick={() => act("ticket.resolve", { id: t.id })}>
            Marcar como resolvido
          </Button>
        </DialogFooter>
      )}
    </>
  );
}
function TicketForm({ data, act }: { data: State; act: any }) {
  const [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [screenId, setScreenId] = useState("VYOO-ML-001");
  return (
    <>
      <Field label="Tela">
        <Select value={screenId} onValueChange={setScreenId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.screens.map((s) => (
              <SelectItem value={s.id} key={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Assunto">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Descrição">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button
          onClick={() => act("ticket.create", { title, description, screenId })}
        >
          Abrir chamado
        </Button>
      </DialogFooter>
    </>
  );
}
function Inventory({ data }: { data: State }) {
  return (
    <div className="place-list">
      {data.screens.map((s) => (
        <div className="inventory-row" key={s.id}>
          <span>
            <b>{s.name}</b>
            <small>{s.id}</small>
          </span>
          <div className="occupancy">
            <span>{s.occupancy}% ocupado</span>
            <i>
              <b style={{ width: `${s.occupancy}%` }} />
            </i>
          </div>
        </div>
      ))}
    </div>
  );
}
function Locations({ ids, data }: { ids: string[]; data: State }) {
  return (
    <div className="place-list">
      {data.screens
        .filter((s) => ids.includes(s.id))
        .map((s) => (
          <div className="inventory-row" key={s.id}>
            <span>
              <b>{s.name}</b>
              <small>
                {s.category} · {s.hours}h/dia
              </small>
            </span>
            <Status value={s.status} />
          </div>
        ))}
    </div>
  );
}
function Statement({ data }: { data: State }) {
  return (
    <div className="detail-list">
      {data.campaigns
        .filter(
          (c) => c.screenIds.includes("VYOO-ML-001") && c.status === "Ativa",
        )
        .map((c) => (
          <p key={c.id}>
            <span>{c.name}</span>
            <b>{money(Math.round((c.budget / c.screenIds.length) * 0.3))}</b>
          </p>
        ))}
      <p className="total">
        <span>Disponível estimado</span>
        <b>{money(640)}</b>
      </p>
      <small>Valores demonstrativos; não representam pagamento real.</small>
    </div>
  );
}
function ScreenDetail({ s }: { s: any }) {
  return (
    <div className="detail-list">
      <p>
        <span>Identificador</span>
        <b>{s.id}</b>
      </p>
      <p>
        <span>Estabelecimento</span>
        <b>{s.name}</b>
      </p>
      <p>
        <span>Conexão</span>
        <Status value={s.status} />
      </p>
      <p>
        <span>Última sincronização</span>
        <b>{s.sync}</b>
      </p>
      <p>
        <span>Ocupação</span>
        <b>{s.occupancy}%</b>
      </p>
      <p>
        <span>Horário cadastrado</span>
        <b>{s.hours} horas/dia</b>
      </p>
    </div>
  );
}
function CampaignDetail({
  c,
  data,
  act,
}: {
  c: Campaign;
  data: State;
  act: any;
}) {
  if (!c) return <p>Nenhuma campanha selecionada.</p>;
  return (
    <>
      <div className="detail-list">
        <p>
          <span>Campanha</span>
          <b>{c.name}</b>
        </p>
        <p>
          <span>Status</span>
          <Status value={c.status} />
        </p>
        <p>
          <span>Objetivo</span>
          <b>{c.objective}</b>
        </p>
        <p>
          <span>Período</span>
          <b>
            {date(c.start)}–{date(c.end)}
          </b>
        </p>
        <p>
          <span>Locais</span>
          <b>{c.screenIds.length}</b>
        </p>
        <p>
          <span>Frequência</span>
          <b>{c.frequency}/h por tela</b>
        </p>
        <p>
          <span>Contratado</span>
          <b>{money(c.budget)}</b>
        </p>
        <p>
          <span>Exibições realizadas</span>
          <b>{num(c.plays)}</b>
        </p>
      </div>
      <DialogFooter>
        {["Ativa", "Agendada"].includes(c.status) && (
          <Button
            variant="outline"
            onClick={() => act("campaign.pause", { id: c.id })}
          >
            <Pause />
            Pausar
          </Button>
        )}
        {c.status === "Pausada" && (
          <Button onClick={() => act("campaign.resume", { id: c.id })}>
            <Play />
            Reativar
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
function CreativeDetail({ c }: { c: Creative }) {
  if (!c) return null;
  return (
    <div className="detail-list">
      <div className="ad-preview">
        <small>VYOO Ads</small>
        <b>{c.name}</b>
      </div>
      <p>
        <span>Arquivo</span>
        <b>{c.name}</b>
      </p>
      <p>
        <span>Status</span>
        <Status value={c.status} />
      </p>
      <p>
        <span>Formato recomendado</span>
        <b>16:9 · 1920 × 1080</b>
      </p>
      {c.reason && (
        <p>
          <span>Motivo</span>
          <b>{c.reason}</b>
        </p>
      )}
    </div>
  );
}
function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function modalTitle(t: string) {
  return (
    (
      {
        campaign: "Criar campanha",
        screen: "Cadastrar tela",
        creative: "Revisar criativo",
        "upload-own": "Enviar conteúdo próprio",
        "partner-approve": "Analisar parceiro",
        ticket: "Detalhes do incidente",
        "new-ticket": "Abrir chamado",
        inventory: "Inventário da rede",
        locations: "Locais em veiculação",
        statement: "Extrato demonstrativo",
        "screen-detail": "Detalhes da tela",
        "campaign-detail": "Detalhes da campanha",
        "creative-detail": "Detalhes do criativo",
      } as any
    )[t] || "Detalhes"
  );
}
function modalDesc(t: string) {
  return (
    (
      {
        campaign: "Configure a compra de mídia em sete etapas.",
        screen: "O cadastro ficará aguardando instalação e ativação.",
        creative: "A decisão será refletida na campanha do anunciante.",
        inventory: "Ocupação estimada por tela no período.",
        statement: "Participação estimada por campanha.",
      } as any
    )[t] || "Dados compartilhados entre os painéis VYOO."
  );
}
function date(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function groupScreens(s: any[]): Record<string, number> {
  return s.reduce<Record<string, number>>((a, x) => {
    a[x.category] = (a[x.category] || 0) + 1;
    return a;
  }, {});
}
