"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Film,
  Calendar,
  Package,
  X,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/conteudo", label: "Conteudo", icon: FileText },
  { href: "/videos", label: "Montar Videos", icon: Film },
  { href: "/agenda", label: "Agenda", icon: Calendar },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r border-[#e8e0d4] transition-transform duration-200 lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8e0d4]">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="text-xl">{"\uD83C\uDFAC"}</span>
            <span className="text-lg font-bold text-[#1a1a2e] tracking-tight">
              TikSpy
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a1a2e] text-white"
                    : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="my-3 border-t border-[#e8e0d4]" />

          {/* Produtos link */}
          <Link
            href="/produtos"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === "/produtos"
                ? "bg-[#1a1a2e] text-white"
                : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
            }`}
          >
            <Package size={18} />
            Produtos
          </Link>
        </nav>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#e8e0d4] text-[#1a1a2e] shadow-sm lg:hidden"
    >
      <Menu size={20} />
    </button>
  );
}
