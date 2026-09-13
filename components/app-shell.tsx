"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileBarChart,
  Grid2X2,
  Headphones,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  Monitor,
  Megaphone,
  Settings,
  Store,
  Users,
  X,
} from "lucide-react";

export type Area = "admin" | "ads" | "parceiro";

type MenuItem = readonly [label: string, href: string, icon: any];

const menus: Record<Area, MenuItem[]> = {
  admin: [
    ["Visão geral", "/admin", LayoutDashboard],
    ["Estabelecimentos", "/admin/estabelecimentos", Store],
    ["Telas", "/admin/telas", Monitor],
    ["Inventário", "/admin/inventario", Grid2X2],
    ["Campanhas", "/admin/campanhas", Megaphone],
    ["Criativos", "/admin/criativos", ImageIcon],
    ["Programação", "/admin/programacao", CalendarDays],
    ["Parceiros", "/admin/parceiros", Users],
    ["Financeiro", "/admin/financeiro", CircleDollarSign],
    ["Relatórios", "/admin/relatorios", FileBarChart],
    ["Incidentes", "/admin/incidentes", AlertTriangle],
    ["Configurações", "/admin/configuracoes", Settings],
  ],
  ads: [
    ["Visão geral", "/ads", LayoutDashboard],
    ["Campanhas", "/ads/campanhas", Megaphone],
    ["Locais", "/ads/locais", MapPin],
    ["Criativos", "/ads/criativos", ImageIcon],
    ["Relatórios", "/ads/relatorios", FileBarChart],
    ["Faturamento", "/ads/faturamento", CreditCard],
    ["Ajuda", "/ads/ajuda", Headphones],
    ["Configurações", "/ads/configuracoes", Settings],
  ],
  parceiro: [
    ["Início", "/parceiro", LayoutDashboard],
    ["Minha tela", "/parceiro/minha-tela", Monitor],
    ["Meu conteúdo", "/parceiro/meu-conteudo", ImageIcon],
    ["Campanhas", "/parceiro/campanhas", Megaphone],
    ["Financeiro", "/parceiro/financeiro", CircleDollarSign],
    ["Extratos", "/parceiro/extratos", FileBarChart],
    ["Estabelecimento", "/parceiro/estabelecimento", Store],
    ["Suporte", "/parceiro/suporte", Headphones],
    ["Configurações", "/parceiro/configuracoes", Settings],
  ],
};

const roleLabels: Record<Area, string> = {
  admin: "Administradora",
  ads: "Anunciante",
  parceiro: "Proprietário",
};

const sideNoteText: Record<Area, string> = {
  admin: "Rede operando",
  ads: "Mídia em veiculação",
  parceiro: "Player conectado",
};

export default function AppShell({
  area,
  orgName,
  roleLabel,
  initials,
  children,
}: {
  area: Area;
  orgName: string;
  roleLabel?: string;
  initials?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
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
          {menus[area].map(([label, href, Icon]) => {
            const active =
              href === `/${area}` ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={active ? "active" : ""}
                onClick={() => setMobile(false)}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="side-note">
          <i></i>
          <div>
            <b>{sideNoteText[area]}</b>
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
            <b>{orgName || "Conta VYOO"}</b>
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
            <span>{initials || (area === "admin" ? "VY" : area === "ads" ? "AD" : "PA")}</span>
            <div>
              <b>{orgName || "Conta VYOO"}</b>
              <small>{roleLabel || roleLabels[area]}</small>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
