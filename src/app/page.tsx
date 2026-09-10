"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  FileText,
  Megaphone,
  Shuffle,
  Calendar,
  ArrowRight,
  Film,
  Plus,
} from "lucide-react";
import {
  getHooks,
  getBodies,
  getCTAs,
  getCombos,
  getProducts,
  getSchedule,
} from "@/lib/store";
import { seedDatabase } from "@/lib/seed";
import { ANGLES } from "@/lib/angles";
import type { ContentPiece, Product, VideoCombo } from "@/lib/types";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hooks, setHooks] = useState<ContentPiece[]>([]);
  const [bodies, setBodies] = useState<ContentPiece[]>([]);
  const [ctas, setCtas] = useState<ContentPiece[]>([]);
  const [combos, setCombos] = useState<VideoCombo[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<VideoCombo[]>([]);

  useEffect(() => {
    seedDatabase().then(async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      setHooks(await getHooks());
      setBodies(await getBodies());
      setCtas(await getCTAs());
      setCombos(await getCombos());

      const today = new Date().toISOString().split("T")[0];
      setTodaySchedule(await getSchedule(today));
    });
  }, []);

  const productHookCount = (pid: string) =>
    hooks.filter((h) => h.productId === pid).length;
  const productBodyCount = (pid: string) =>
    bodies.filter((b) => b.productId === pid).length;
  const productCtaCount = (pid: string) =>
    ctas.filter((c) => c.productId === pid).length;
  const productComboCount = (pid: string) =>
    combos.filter((c) => c.productId === pid).length;

  // Group today's schedule by product
  const todayByProduct = products
    .map((p) => ({
      product: p,
      combos: todaySchedule.filter((c) => c.productId === p.id),
    }))
    .filter((g) => g.combos.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Painel</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Visão geral de todo o seu conteúdo TikTok Shop
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Hooks"
          value={hooks.length}
          color="text-[#3b82f6]"
          bgColor="bg-[#3b82f6]/10"
        />
        <StatCard
          icon={FileText}
          label="Bodies"
          value={bodies.length}
          color="text-[#8b5cf6]"
          bgColor="bg-[#8b5cf6]/10"
        />
        <StatCard
          icon={Megaphone}
          label="CTAs"
          value={ctas.length}
          color="text-[#f59e0b]"
          bgColor="bg-[#f59e0b]/10"
        />
        <StatCard
          icon={Shuffle}
          label="Combos"
          value={combos.length}
          color="text-[#fe2c55]"
          bgColor="bg-[#fe2c55]/10"
        />
      </div>

      {/* Product Cards */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Produtos</h2>
        {products.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-8 shadow-sm text-center">
            <p className="text-[#9ca3af] text-sm mb-3">Nenhum produto cadastrado</p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
            >
              <Plus size={16} />
              Adicionar Produto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/conteudo?produto=${product.id}`}
                className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm hover:bg-[#f5f0ea] transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{product.emoji}</span>
                  <h3 className="text-base font-semibold text-[#1a1a2e] group-hover:text-[#1a1a2e]">
                    {product.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-[#3b82f6]" />
                    {productHookCount(product.id)} hooks
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} className="text-[#8b5cf6]" />
                    {productBodyCount(product.id)} bodies
                  </span>
                  <span className="flex items-center gap-1">
                    <Megaphone size={12} className="text-[#f59e0b]" />
                    {productCtaCount(product.id)} CTAs
                  </span>
                  <span className="flex items-center gap-1">
                    <Shuffle size={12} className="text-[#fe2c55]" />
                    {productComboCount(product.id)} combos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Gravar Hoje + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gravar Hoje */}
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Film size={20} className="text-[#fe2c55]" />
            <h2 className="text-lg font-semibold text-[#1a1a2e]">
              Gravar Hoje
            </h2>
          </div>
          {todayByProduct.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#9ca3af]">
              <Calendar size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Nenhum vídeo agendado para hoje</p>
              <Link
                href="/videos"
                className="mt-3 text-sm text-[#1a1a2e] font-medium hover:underline"
              >
                Montar combos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayByProduct.map(({ product, combos: pCombos }) => (
                <div key={product.id}>
                  <p className="text-sm font-medium text-[#1a1a2e] mb-2 flex items-center gap-1.5">
                    <span>{product.emoji}</span>
                    {product.name}
                    <span className="text-[#9ca3af] font-normal">
                      ({pCombos.length} videos)
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {pCombos.map((combo) => {
                      const angle = ANGLES.find((a) => a.id === combo.angle);
                      return (
                        <div
                          key={combo.id}
                          className="rounded-xl border border-[#e8e0d4] p-2.5 flex items-center gap-2"
                        >
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: angle?.color }}
                          >
                            {angle?.emoji} {angle?.label}
                          </span>
                          <span className="text-xs text-[#9ca3af] capitalize">
                            {combo.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">
            Ações Rápidas
          </h2>
          <div className="space-y-3">
            <Link
              href="/conteudo"
              className="flex items-center justify-between rounded-xl border border-[#e8e0d4] p-4 hover:bg-[#f5f0ea] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/10">
                  <Plus size={20} className="text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    Adicionar Conteúdo
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Crie novos hooks, bodies e CTAs
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-[#9ca3af] group-hover:text-[#1a1a2e] transition-colors"
              />
            </Link>
            <Link
              href="/videos"
              className="flex items-center justify-between rounded-xl border border-[#e8e0d4] p-4 hover:bg-[#f5f0ea] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fe2c55]/10">
                  <Film size={20} className="text-[#fe2c55]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    Montar Vídeos
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Gere combinações de conteúdo
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-[#9ca3af] group-hover:text-[#1a1a2e] transition-colors"
              />
            </Link>
            <Link
              href="/agenda"
              className="flex items-center justify-between rounded-xl border border-[#e8e0d4] p-4 hover:bg-[#f5f0ea] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
                  <Calendar size={20} className="text-[#1a1a2e]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    Ver Agenda
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Visualize sua agenda de gravação
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-[#9ca3af] group-hover:text-[#1a1a2e] transition-colors"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 hover:bg-[#f5f0ea] transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
        >
          <Icon size={20} className={color} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
          <p className="text-xs text-[#9ca3af]">{label}</p>
        </div>
      </div>
    </div>
  );
}
