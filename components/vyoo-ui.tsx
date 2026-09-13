"use client";

import React, {createContext, useContext} from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "default" | "outline"};
export function Button({className="", variant="default", ...props}:ButtonProps){
  return <button className={`vy-button ${variant} ${className}`.trim()} {...props}/>;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({className="",...props},ref){
  return <input ref={ref} className={`vy-input ${className}`.trim()} {...props}/>;
});

const DialogContext=createContext<{close:()=>void}>({close:()=>{}});
export function Dialog({open,onOpenChange,children}:{open:boolean;onOpenChange:(open:boolean)=>void;children:React.ReactNode}){
  if(!open)return null;
  return <DialogContext.Provider value={{close:()=>onOpenChange(false)}}>{children}</DialogContext.Provider>;
}
export function DialogContent({className="",children}:{className?:string;children:React.ReactNode}){
  const {close}=useContext(DialogContext);
  return <div className="vy-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className={`vy-dialog ${className}`} role="dialog" aria-modal="true"><button className="vy-dialog-close" onClick={close} aria-label="Fechar">×</button>{children}</section></div>;
}
export function DialogHeader({children}:{children:React.ReactNode}){return <header className="vy-dialog-header">{children}</header>}
export function DialogTitle({children}:{children:React.ReactNode}){return <h2 className="vy-dialog-title">{children}</h2>}
export function DialogDescription({children}:{children:React.ReactNode}){return <p className="vy-dialog-description">{children}</p>}
export function DialogFooter({children}:{children:React.ReactNode}){return <footer className="vy-dialog-footer">{children}</footer>}

export function Table({children,...props}:React.TableHTMLAttributes<HTMLTableElement>){return <table {...props}>{children}</table>}
export function TableHeader({children,...props}:React.HTMLAttributes<HTMLTableSectionElement>){return <thead {...props}>{children}</thead>}
export function TableBody({children,...props}:React.HTMLAttributes<HTMLTableSectionElement>){return <tbody {...props}>{children}</tbody>}
export function TableRow({children,...props}:React.HTMLAttributes<HTMLTableRowElement>){return <tr {...props}>{children}</tr>}
export function TableHead({children,...props}:React.ThHTMLAttributes<HTMLTableCellElement>){return <th {...props}>{children}</th>}
export function TableCell({children,...props}:React.TdHTMLAttributes<HTMLTableCellElement>){return <td {...props}>{children}</td>}

export function Select({value,onValueChange,children}:{value?:string;onValueChange?:(value:string)=>void;children:React.ReactNode}){
  return <select className="vy-select" value={value} onChange={e=>onValueChange?.(e.target.value)}>{children}</select>;
}
export function SelectTrigger({children}:{children?:React.ReactNode}){return <>{children}</>}
export function SelectValue(){return null}
export function SelectContent({children}:{children:React.ReactNode}){return <>{children}</>}
export function SelectItem({value,children}:{value:string;children:React.ReactNode}){return <option value={value}>{children}</option>}

export function Checkbox({checked,onCheckedChange,...props}:{checked?:boolean;onCheckedChange?:(checked:boolean)=>void}&Omit<React.InputHTMLAttributes<HTMLInputElement>,"onChange">){
  return <input className="vy-checkbox" type="checkbox" checked={checked} onChange={e=>onCheckedChange?.(e.target.checked)} {...props}/>;
}
