import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reusable ERP UI Components
export function Card({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 rounded-sm shadow-sm flex flex-col", className)}>
      {title && <div className="bg-zinc-950 border-b border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-300">{title}</div>}
      <div className="p-3 flex-1">{children}</div>
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto border border-zinc-800 rounded-sm", className)}>
      <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("bg-zinc-950 border-b border-r border-zinc-800 px-2 py-1.5 font-semibold text-zinc-400 last:border-r-0", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("border-b border-r border-zinc-800 px-2 py-1 text-zinc-300 last:border-r-0 bg-zinc-900 group-hover:bg-zinc-800", className)}>
      {children}
    </td>
  );
}

export function Button({ children, className, onClick, variant = 'primary', type = 'button', disabled }: { children: React.ReactNode; className?: string; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) {
  const base = "px-3 py-1 rounded-sm text-sm font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-rose-900 text-white border-rose-950 hover:bg-rose-800",
    secondary: "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700",
    danger: "bg-red-900 text-white border-red-950 hover:bg-red-800",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(base, variants[variant], className)}>
      {children}
    </button>
  );
}
