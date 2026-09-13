"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Film,
  ImageIcon,
  Info,
  List,
  LockKeyhole,
  MapPin,
  Monitor,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { available, cost, money, num, type State } from "@/lib/model";

type Action = (
  action: string,
  payload?: Record<string, unknown>,
  options?: { keepModal?: boolean },
) => Promise<boolean>;

type FormState = {
  name: string;
  objective: string;
  state: string;
  city: string;
  neighborhoods: string[];
  start: string;
  end: string;
  screenIds: string[];
  creativeId: string;
  frequency: number;
  paymentMethod: "pix" | "card";
};

const objectives = [
  ["Reconhecimento de marca", "Construa presença recorrente na sua região."],
  ["Lançamento", "Apresente uma novidade ao público local."],
  ["Divulgação institucional", "Fortaleça a imagem e a confiança na sua empresa."],
  ["Promoção / oferta", "Dê visibilidade a uma condição por tempo determinado."],
  ["Evento", "Divulgue data, local e participação."],
  ["Outro", "Configure uma campanha adequada à sua necessidade."],
] as const;

const steps = [
  "Objetivo",
  "Região",
  "Locais",
  "Criativo",
  "Frequência",
  "Orçamento",
  "Revisão",
];

const initialForm: FormState = {
  name: "",
  objective: "Reconhecimento de marca",
  state: "Minas Gerais",
  city: "Mateus Leme",
  neighborhoods: ["Todos os bairros"],
  start: "2026-09-16",
  end: "2026-09-30",
  screenIds: [],
  creativeId: "",
  frequency: 4,
  paymentMethod: "pix",
};

function daysBetween(start: string, end: string) {
  const diff = Date.parse(end) - Date.parse(start);
  return Number.isFinite(diff) ? Math.max(1, Math.floor(diff / 86400000) + 1) : 0;
}

function dateLabel(value: string) {
  if (!value) return "A definir";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default function CampaignBuilder({
  data,
  act,
  onClose,
}: {
  data: State;
  act: Action;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    creativeId: data.creatives.find((item) => item.status === "Aprovado")?.id ?? "",
  }));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [terms, setTerms] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("vyoo-campaign-draft");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as Partial<FormState>;
      setForm((current) => ({ ...current, ...draft }));
    } catch {
      window.localStorage.removeItem("vyoo-campaign-draft");
    }
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const duration = daysBetween(form.start, form.end);
  const selectedScreens = data.screens.filter((screen) => form.screenIds.includes(screen.id));
  const totalBudget = cost(form.screenIds, form.frequency, form.start, form.end);
  const contractedPlays = selectedScreens.reduce(
    (total, screen) => total + screen.hours * form.frequency * duration,
    0,
  );
  const potentialAudience = selectedScreens.reduce((total, screen) => total + screen.flow, 0) * duration;
  const chosenCreative = data.creatives.find((item) => item.id === form.creativeId);
  const capacityOk = selectedScreens.every(
    (screen) => available(data, screen.id, form.start, form.end) >= form.frequency,
  );
  const valid = [
    Boolean(form.name.trim() && form.objective),
    Boolean(form.state && form.city && form.start && form.end && duration > 0),
    form.screenIds.length > 0,
    Boolean(chosenCreative?.status === "Aprovado"),
    capacityOk,
    Boolean(form.paymentMethod),
    terms,
  ];

  const filteredScreens = useMemo(
    () =>
      data.screens.filter((screen) => {
        const matchesQuery = `${screen.name} ${screen.category} ${screen.neighborhood ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory = category === "Todos" || screen.category === category;
        return screen.approved && matchesQuery && matchesCategory;
      }),
    [data.screens, query, category],
  );

  const saveDraft = () => {
    window.localStorage.setItem("vyoo-campaign-draft", JSON.stringify(form));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const uploadCreative = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const id = crypto.randomUUID();
    const response = await fetch(`/api/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (response.ok) {
      const upload = await response.json();
      await act(
        "creative.create",
        {
          name: file.name.replace(/\.[^.]+$/, ""),
          url: `/api/media/${id}`,
          type: file.type.startsWith("video") ? "video" : "image",
          mimeType: upload.contentType,
          fileSize: upload.size,
        },
        { keepModal: true },
      );
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!valid.every(Boolean)) return;
    const ok = await act("campaign.create", form);
    if (ok) window.localStorage.removeItem("vyoo-campaign-draft");
  };

  return (
    <section className="campaign-builder">
      <div className="campaign-progress" aria-label="Etapas da campanha">
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = number < step;
          return (
            <button
              type="button"
              key={label}
              className={`${number === step ? "current" : ""} ${complete ? "complete" : ""}`}
              onClick={() => number <= step && setStep(number)}
              disabled={number > step}
            >
              <span>{complete ? <Check /> : number}</span>
              <b>{label}</b>
            </button>
          );
        })}
      </div>

      <div className="campaign-layout">
        <div className="campaign-stage">
          <header className="campaign-title">
            <div>
              <small>CRIAR CAMPANHA · ETAPA {step} DE 7</small>
              <h1>{stepTitle(step)}</h1>
              <p>{stepSubtitle(step)}</p>
            </div>
            <button type="button" className="campaign-close" onClick={onClose} aria-label="Fechar criação">
              <X />
            </button>
          </header>

          {step === 1 && (
            <div className="campaign-section objective-step">
              <label className="campaign-field">
                <span>Nome da campanha</span>
                <input
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="Ex.: Café da manhã no Centro"
                  maxLength={100}
                />
              </label>
              <div className="objective-list">
                {objectives.map(([name, description]) => (
                  <button
                    type="button"
                    key={name}
                    className={form.objective === name ? "selected" : ""}
                    onClick={() => set("objective", name)}
                  >
                    <span className="radio-dot" />
                    <span><b>{name}</b><small>{description}</small></span>
                    {form.objective === name && <Check />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="campaign-section region-step">
              <div className="region-grid">
                <div className="region-controls">
                  <label className="campaign-field"><span>Estado</span><select value={form.state} onChange={(e) => set("state", e.target.value)}><option>Minas Gerais</option></select></label>
                  <label className="campaign-field"><span>Cidade</span><select value={form.city} onChange={(e) => set("city", e.target.value)}><option>Mateus Leme</option></select></label>
                  <div className="campaign-field">
                    <span>Região / bairro</span>
                    <div className="chip-row">
                      {["Todos os bairros", "Centro", "Azurita", "Sítio Novo"].map((item) => (
                        <button
                          type="button"
                          key={item}
                          className={form.neighborhoods.includes(item) ? "selected" : ""}
                          onClick={() => set("neighborhoods", [item])}
                        >{item}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="coverage-map" aria-label="Cobertura demonstrativa em Mateus Leme">
                  <span className="district district-a">Sítio Novo</span>
                  <span className="district district-b">Centro</span>
                  <span className="district district-c">Azurita</span>
                  {Array.from({ length: Math.min(12, data.screens.length) }).map((_, index) => (
                    <i key={index} style={{ left: `${16 + ((index * 29) % 72)}%`, top: `${17 + ((index * 37) % 67)}%` }} />
                  ))}
                  <strong>Mateus Leme</strong>
                  <small><i /> Telas disponíveis</small>
                </div>
              </div>
              <div className="network-facts">
                <span><Monitor /><b>{data.screens.filter((screen) => screen.approved).length}</b><small>telas disponíveis</small></span>
                <span><Users /><b>42,8 mil</b><small>audiência potencial</small></span>
                <span><Clock3 /><b>06:00 às 23:00</b><small>horário da rede</small></span>
              </div>
              <div className="period-panel">
                <h3>Período da campanha</h3>
                <label className="campaign-field"><span>Início</span><input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} /></label>
                <label className="campaign-field"><span>Término</span><input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} /></label>
                <span className="duration"><b>{duration}</b> dias</span>
              </div>
              <div className="availability-note"><CheckCircle2 /> Boa disponibilidade para este período.</div>
            </div>
          )}

          {step === 3 && (
            <div className="campaign-section locations-step">
              <div className="location-toolbar">
                <label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar estabelecimento ou bairro" /></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {["Todos", ...Array.from(new Set(data.screens.map((screen) => screen.category)))].map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="button" className="view-selected"><List /> Lista</button>
              </div>
              <div className="selection-facts">
                <span><b>{filteredScreens.length}</b> locais disponíveis</span>
                <span className="green"><b>{form.screenIds.length}</b> selecionados</span>
                <button type="button" onClick={() => set("screenIds", filteredScreens.filter((screen) => available(data, screen.id, form.start, form.end) >= form.frequency).map((screen) => screen.id))}>Selecionar disponíveis</button>
                <span className="selection-audience"><Users /><b>{num(potentialAudience)}</b><small>pessoas no período</small></span>
              </div>
              <div className="location-table-wrap">
                <table className="location-table">
                  <thead><tr><th></th><th>Estabelecimento</th><th>Categoria</th><th>Bairro</th><th>Horário</th><th>Fluxo estimado</th><th>Disponibilidade</th></tr></thead>
                  <tbody>
                    {filteredScreens.map((screen) => {
                      const capacity = available(data, screen.id, form.start, form.end);
                      const unavailable = capacity < form.frequency;
                      const selected = form.screenIds.includes(screen.id);
                      return (
                        <tr key={screen.id} className={selected ? "selected" : ""}>
                          <td><input type="checkbox" checked={selected} disabled={unavailable} onChange={(event) => set("screenIds", event.target.checked ? [...form.screenIds, screen.id] : form.screenIds.filter((id) => id !== screen.id))} /></td>
                          <td><span className="venue-name"><span><Monitor /></span><b>{screen.name}<small>{screen.id}</small></b></span></td>
                          <td>{screen.category}</td><td>{screen.neighborhood || "Centro"}</td><td>06:00–{screen.hours >= 14 ? "22:00" : "20:00"}</td><td>{num(screen.flow)} pessoas/dia</td>
                          <td><span className={`capacity-status ${unavailable ? "unavailable" : capacity < 6 ? "low" : "available"}`}><i />{unavailable ? "Indisponível" : capacity < 6 ? "Pouca disponibilidade" : "Disponível"}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="campaign-section creative-step">
              <div className="creative-columns">
                <div>
                  <div className="section-tabs"><button className="active">Biblioteca</button><label>{uploading ? "Enviando..." : "Enviar novo"}<input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" disabled={uploading} onChange={(e) => uploadCreative(e.target.files?.[0])} /></label></div>
                  <div className="creative-library">
                    {data.creatives.map((creative) => (
                      <button type="button" key={creative.id} disabled={creative.status !== "Aprovado"} className={form.creativeId === creative.id ? "selected" : ""} onClick={() => set("creativeId", creative.id)}>
                        <span className="creative-thumb">{creative.type === "video" ? <Film /> : <ImageIcon />}</span>
                        <span><b>{creative.name}</b><small>{creative.type === "video" ? "Vídeo · 16:9" : "Imagem · 16:9"}</small></span>
                        <span className={`mini-status ${creative.status === "Aprovado" ? "approved" : "pending"}`}>{creative.status}</span>
                      </button>
                    ))}
                  </div>
                  <div className="creative-specs"><h3>Especificações recomendadas</h3><span>Formato <b>16:9</b></span><span>Resolução <b>1920 × 1080</b></span><span>Duração <b>15 segundos</b></span><span>Áudio <b>Não obrigatório</b></span></div>
                </div>
                <div className="creative-preview-stage">
                  <div className="preview-heading"><h3>Prévia na tela</h3><span>Área segura 16:9</span></div>
                  <div className="tv-preview"><div><small>PADARIA CENTRAL</small><b>SEU CAFÉ<br /><em>COMEÇA AQUI.</em></b><span>Café fresco. Todos os dias.</span></div></div>
                  <div className="preview-controls"><span>▶</span><i /><small>00:00 / 00:15</small></div>
                  <div className="moderation-note"><Info /><span><b>{chosenCreative ? "Criativo pronto" : "Selecione um criativo aprovado"}</b><small>Novos arquivos passam por moderação antes da veiculação.</small></span></div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="campaign-section frequency-step">
              <div className="frequency-list">
                {[
                  [2, "Presença", "Para manter sua marca presente de forma contínua."],
                  [4, "Destaque", "Mais repetição para aumentar a lembrança da marca."],
                  [6, "Alta frequência", "Presença intensa em períodos estratégicos."],
                ].map(([value, name, description]) => (
                  <button type="button" key={String(value)} className={form.frequency === value ? "selected" : ""} onClick={() => set("frequency", Number(value))}>
                    <span className="radio-dot" /><span><b>{name}</b><small>{value} exibições por hora</small></span>{value === 4 && <em>Recomendado</em>}<p>{description}</p><strong>{num(selectedScreens.reduce((total, screen) => total + screen.hours * Number(value) * duration, 0))}<small>exibições estimadas</small></strong>
                  </button>
                ))}
              </div>
              <div className="distribution-panel">
                <header><h3>Como sua campanha será distribuída</h3><span>Exemplo de uma hora · Destaque</span></header>
                <div className="timeline"><span>08:00</span>{["08:05", "08:20", "08:35", "08:50"].map((time) => <i key={time}><b>{time}</b><small>15 seg</small></i>)}<span>09:00</span></div>
                <p>Cada exibição dura 15 segundos. O motor VYOO ajusta automaticamente a grade de cada tela.</p>
              </div>
              <div className="forecast-row"><span><b>{form.frequency}/h</b><small>frequência escolhida</small></span><span><b>{num(contractedPlays)}</b><small>exibições estimadas</small></span><span><b>{num(potentialAudience)}</b><small>pessoas no período</small></span><span><b>{(form.frequency * 0.8).toFixed(1).replace(".", ",")}×</b><small>frequência média</small></span></div>
              {!capacityOk && <div className="capacity-warning"><Info /> Um local não possui inventário para esta frequência. Volte e ajuste a seleção.</div>}
            </div>
          )}

          {step === 6 && (
            <div className="campaign-section budget-step">
              <div className="media-order">
                <header><h3>Resumo da compra de mídia</h3><span><MapPin /> Mateus Leme / MG</span><span><CalendarDays /> {dateLabel(form.start)}–{dateLabel(form.end)}</span><span><Clock3 /> {duration} dias</span></header>
                <table><thead><tr><th>Item</th><th>Configuração</th><th>Valor</th></tr></thead><tbody><tr><td>Inventário local</td><td>{form.screenIds.length} estabelecimentos</td><td>{money(Math.round(totalBudget * 0.5))}</td></tr><tr><td>Frequência</td><td>{frequencyName(form.frequency)} · {form.frequency} exibições/hora</td><td>{money(Math.round(totalBudget * 0.37))}</td></tr><tr><td>Período</td><td>{duration} dias de veiculação</td><td>{money(totalBudget - Math.round(totalBudget * 0.5) - Math.round(totalBudget * 0.37))}</td></tr><tr className="total"><td colSpan={2}>Total</td><td>{money(totalBudget)}</td></tr></tbody></table>
              </div>
              <div className="delivery-forecast"><span><b>{num(contractedPlays)}</b><small>exibições contratadas</small></span><span><b>{num(potentialAudience)}</b><small>pessoas estimadas</small></span><span><b>{(form.frequency * 0.8).toFixed(1).replace(".", ",")}×</b><small>frequência média</small></span></div>
              <div className="purchase-note"><Info /> Você está contratando uma campanha de mídia pelo período e frequência escolhidos. O valor não é cobrado por vídeo enviado.</div>
              <div className="payment-panel"><h3>Forma de pagamento</h3><button type="button" className={form.paymentMethod === "pix" ? "selected" : ""} onClick={() => set("paymentMethod", "pix")}><span className="radio-dot" /><span><b>Pix</b><small>Pagamento à vista</small></span></button><button type="button" className={form.paymentMethod === "card" ? "selected" : ""} onClick={() => set("paymentMethod", "card")}><span className="radio-dot" /><span><b>Cartão de crédito</b><small>Em até 12×</small></span></button><span className="secure"><LockKeyhole /> Ambiente seguro</span></div>
              <div className="mvp-payment"><Info /> Nesta versão MVP, a forma de pagamento é registrada para demonstração; nenhuma cobrança real é realizada.</div>
            </div>
          )}

          {step === 7 && (
            <div className="campaign-section review-step">
              <ReviewRow icon={<Film />} title="Campanha"><span><small>Nome</small><b>{form.name}</b></span><span><small>Objetivo</small><b>{form.objective}</b></span><button onClick={() => setStep(1)}>Editar</button></ReviewRow>
              <ReviewRow icon={<MapPin />} title="Região e período"><span><b>Mateus Leme / MG</b><small>Todos os bairros</small></span><span><b>{dateLabel(form.start)}–{dateLabel(form.end)}</b><small>{duration} dias</small></span><button onClick={() => setStep(2)}>Editar</button></ReviewRow>
              <ReviewRow icon={<Monitor />} title="Locais selecionados"><span><b>{form.screenIds.length} estabelecimentos</b><small>{selectedScreens.map((screen) => screen.name).join(" · ")}</small></span><span><b>{num(potentialAudience)}</b><small>audiência potencial</small></span><button onClick={() => setStep(3)}>Editar</button></ReviewRow>
              <ReviewRow icon={<ImageIcon />} title="Criativo"><div className="review-creative"><div><small>PADARIA CENTRAL</small><b>SEU CAFÉ <em>COMEÇA AQUI.</em></b></div><span><b>{chosenCreative?.name}</b><small>16:9 · Pronto para análise</small></span></div><button onClick={() => setStep(4)}>Editar</button></ReviewRow>
              <ReviewRow icon={<Clock3 />} title="Frequência e entrega"><span><b>{frequencyName(form.frequency)} · {form.frequency} por hora</b><small>{num(contractedPlays)} exibições contratadas</small></span><span><b>{(form.frequency * 0.8).toFixed(1).replace(".", ",")}×</b><small>frequência média estimada</small></span><button onClick={() => setStep(5)}>Editar</button></ReviewRow>
              <ReviewRow icon={<ShieldCheck />} title="Pagamento"><span><b>{form.paymentMethod === "pix" ? "Pix" : "Cartão de crédito"}</b><small>Demonstração do MVP</small></span><span><b>{money(totalBudget)}</b><small>investimento total</small></span><button onClick={() => setStep(6)}>Editar</button></ReviewRow>
              <label className="terms"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> Li e concordo com os termos de veiculação e com a política de conteúdo da VYOO.</label>
              <div className="next-status"><CheckCircle2 /><span><b>Depois do envio: Em análise</b><small>A equipe VYOO verificará campanha, criativo e disponibilidade antes de agendar.</small></span><ArrowRight /><span><b>Agendada ou ativa</b><small>Os locais parceiros recebem a programação automaticamente.</small></span></div>
            </div>
          )}

          <footer className="campaign-actions">
            <button type="button" className="back" onClick={() => step === 1 ? onClose() : setStep(step - 1)}><ArrowLeft /> {step === 1 ? "Cancelar" : "Voltar"}</button>
            <div><button type="button" className="draft" onClick={saveDraft}>{saved ? "Rascunho salvo" : "Salvar rascunho"}</button>{step < 7 ? <button type="button" className="continue" disabled={!valid[step - 1]} onClick={() => setStep(step + 1)}>Continuar <ArrowRight /></button> : <button type="button" className="continue submit" disabled={!valid[6]} onClick={submit}><LockKeyhole /> Enviar campanha para aprovação</button>}</div>
          </footer>
        </div>

        <aside className="campaign-summary">
          <h2>{step === 7 ? "Resumo final" : "Resumo da campanha"}</h2>
          <SummaryItem label="Nome da campanha" value={form.name || "A definir"} strong />
          <SummaryItem label="Objetivo" value={form.objective} />
          <SummaryItem label="Cidade" value="Mateus Leme / MG" />
          <SummaryItem label="Locais" value={form.screenIds.length ? `${form.screenIds.length} locais` : "A selecionar"} />
          {form.screenIds.length > 0 && <SummaryItem label="Audiência potencial" value={`${num(potentialAudience)} pessoas no período`} />}
          <SummaryItem label="Período" value={`${dateLabel(form.start)}–${dateLabel(form.end)} · ${duration} dias`} />
          <SummaryItem label="Criativo" value={chosenCreative?.name || "A definir"} />
          <SummaryItem label="Frequência" value={`${frequencyName(form.frequency)} · ${form.frequency} por hora`} />
          <div className="summary-investment"><span>Investimento</span><b>{form.screenIds.length ? money(totalBudget) : "Calculado após os locais"}</b><small>estimativa atual</small></div>
        </aside>
      </div>
    </section>
  );
}

function SummaryItem({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="summary-item"><span>{label}</span><b className={strong ? "strong" : ""}>{value}</b></div>;
}

function ReviewRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="review-row"><span className="review-icon">{icon}</span><h3>{title}</h3><div className="review-values">{children}</div></div>;
}

function frequencyName(value: number) {
  return value === 2 ? "Presença" : value === 4 ? "Destaque" : "Alta frequência";
}

function stepTitle(step: number) {
  return [
    "Qual é o objetivo da campanha?",
    "Onde sua marca deve aparecer?",
    "Escolha onde sua marca será exibida",
    "Envie o anúncio que será exibido nas telas",
    "Com que frequência você quer ser visto?",
    "Confira o investimento da campanha",
    "Revise sua campanha",
  ][step - 1];
}

function stepSubtitle(step: number) {
  return [
    "A VYOO ajusta a distribuição conforme o resultado de mídia que você deseja alcançar.",
    "A disponibilidade e a audiência são calculadas para a área e o período selecionados.",
    "Selecione os estabelecimentos ou distribua a campanha entre os pontos disponíveis.",
    "Todo criativo passa por validação técnica e moderação antes de entrar na rede.",
    "A VYOO organiza automaticamente as exibições ao longo do dia.",
    "O valor considera os locais, a frequência e o período selecionados.",
    "Confira as informações antes de enviar para aprovação.",
  ][step - 1];
}
