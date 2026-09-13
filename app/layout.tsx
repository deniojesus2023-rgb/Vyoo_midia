import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";
import "./ui.css";
import "./dashboard.css";
import "./auth.css";
export const metadata: Metadata = {
  title: "VYOO · Rede de mídia local",
  description: "Gestão de campanhas em telas físicas locais.",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
