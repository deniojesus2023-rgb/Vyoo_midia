import type { ReactNode } from "react";

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children && <div className="head-actions">{children}</div>}
    </div>
  );
}
