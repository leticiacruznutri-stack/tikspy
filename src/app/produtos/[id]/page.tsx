"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  Target,
  TrendingUp,
  Package,
  ExternalLink,
} from "lucide-react";
import { getProductById, getAnalysis } from "@/lib/store";
import type { Product } from "@/lib/types";
import type { ProductAnalysis, ProductFeature } from "@/lib/types";

// ── Category helpers ──
const CATEGORY_COLORS: Record<string, string> = {
  structural: "#3b82f6",
  functional: "#22c55e",
  aesthetic: "#ec4899",
  commercial: "#f59e0b",
};

const CATEGORY_LABELS: Record<string, string> = {
  structural: "Estrutural",
  functional: "Funcional",
  aesthetic: "Estético",
  commercial: "Comercial",
};

const PYRAMID_LEVELS = [
  { key: "desire", label: "DESEJO", width: "100%", color: "#fe2c55" },
  { key: "justification", label: "JUSTIFICATIVA", width: "75%", color: "#f59e0b" },
  { key: "rationalization", label: "RACIONALIZAÇÃO", width: "50%", color: "#3b82f6" },
  { key: "conversion", label: "CONVERSÃO", width: "35%", color: "#22c55e" },
];

// ── Feature Card ──
function FeatureCard({ feature }: { feature: ProductFeature }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[feature.category] || "#6b7280";
  const catLabel = CATEGORY_LABELS[feature.category] || feature.category;

  return (
    <div className="rounded-xl border border-[#e8e0d4] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FAF7F2]/60 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#1a1a2e] truncate">
            {feature.feature}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
            style={{ backgroundColor: catColor }}
          >
            {catLabel}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < feature.ranking
                    ? "text-[#f59e0b] fill-[#f59e0b]"
                    : "text-[#e8e0d4]"
                }
              />
            ))}
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-[#9ca3af] shrink-0 ml-2" />
        ) : (
          <ChevronDown size={16} className="text-[#9ca3af] shrink-0 ml-2" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#e8e0d4] pt-3">
          <DetailRow label="Por que" value={feature.why} />
          <DetailRow label="O que faz" value={feature.whatItDoes} />
          <DetailRow label="Benefício dimensionado" value={feature.dimensioned} />
          <DetailRow
            label="Emoção positiva"
            value={feature.emotionPositive}
            valueClass="text-green-700"
          />
          <DetailRow
            label="Emoção negativa"
            value={feature.emotionNegative}
            valueClass="text-red-600"
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <span className="text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider">
        {label}
      </span>
      <p className={`text-sm text-[#1a1a2e] mt-0.5 ${valueClass ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

// ── Info Cell for summary grid ──
function InfoCell({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider">
        {label}
      </span>
      <p className="text-sm font-medium text-[#1a1a2e]">{value ?? "—"}</p>
    </div>
  );
}

// ── Main detail component ──
function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [analysis, setAnalysis] = useState<ProductAnalysis | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setProduct(await getProductById(productId));
      setAnalysis(await getAnalysis(productId));
      setLoaded(true);
    })();
  }, [productId]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64 text-[#9ca3af] text-sm">
        Carregando...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
          <Package size={40} className="mx-auto mb-3 text-[#9ca3af] opacity-50" />
          <p className="text-[#9ca3af] text-sm">Produto não encontrado</p>
        </div>
      </div>
    );
  }

  const filteredFeatures =
    analysis?.features?.filter((f) =>
      activeTab === "all" ? true : f.category === activeTab
    ) ?? [];

  const tabs = [
    { key: "all", label: "Todos" },
    { key: "structural", label: "Estruturais" },
    { key: "functional", label: "Funcionais" },
    { key: "aesthetic", label: "Estéticos" },
    { key: "commercial", label: "Comerciais" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="flex items-start gap-4">
          <span className="text-4xl">{product.emoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#1a1a2e]">{product.name}</h1>
            {product.description && (
              <p className="text-sm text-[#9ca3af] mt-1">{product.description}</p>
            )}
            {product.shopUrl && (
              <a
                href={product.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:underline mt-2"
              >
                <ExternalLink size={12} />
                {product.shopUrl}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── No analysis state ── */}
      {!analysis && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
          <Package size={40} className="mx-auto mb-3 text-[#9ca3af] opacity-50" />
          <p className="text-[#9ca3af] text-sm mb-4">Nenhuma análise cadastrada</p>
          <Link
            href={`/produtos/${productId}/analise`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
          >
            Criar Análise
          </Link>
        </div>
      )}

      {analysis && (
        <>
          {/* ── Ficha do Produto ── */}
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2">
              <Package size={18} />
              Ficha do Produto
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <InfoCell label="Preço" value={analysis.price} />
              <InfoCell label="Preço Original" value={analysis.originalPrice} />
              <InfoCell label="Desconto" value={analysis.discount} />
              <InfoCell label="Frete" value={analysis.shipping} />
              <InfoCell label="Nota" value={analysis.rating} />
              <InfoCell label="Avaliações" value={analysis.reviewCount} />
              <InfoCell label="Vendidos" value={analysis.soldCount} />
              <InfoCell label="Vendedor" value={analysis.seller} />
              <InfoCell label="Material" value={analysis.material} />
            </div>

            {/* Sizes */}
            {analysis.sizes && analysis.sizes.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider block mb-2">
                  Tamanhos
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.sizes.map((size, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#e8e0d4] text-[#1a1a2e]"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {analysis.colors && analysis.colors.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider block mb-2">
                  Cores ({analysis.colors.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.colors.map((color, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#1a1a2e] text-white"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Recursos e Benefícios ── */}
          {analysis.features && analysis.features.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2">
                <Star size={18} />
                Recursos e Benefícios
              </h2>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const tabColor =
                    tab.key === "all"
                      ? "#1a1a2e"
                      : CATEGORY_COLORS[tab.key] || "#1a1a2e";
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                      style={
                        isActive
                          ? { backgroundColor: tabColor, color: "#fff" }
                          : {
                              backgroundColor: "transparent",
                              color: "#9ca3af",
                              border: "1px solid #e8e0d4",
                            }
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Feature cards */}
              <div className="space-y-2">
                {filteredFeatures.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
                {filteredFeatures.length === 0 && (
                  <p className="text-sm text-[#9ca3af] text-center py-6">
                    Nenhum recurso nesta categoria
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Benefício Principal ── */}
          {analysis.mainBenefit && (
            <div className="rounded-2xl bg-white border-2 border-[#fe2c55]/30 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2 mb-3">
                <Target size={18} className="text-[#fe2c55]" />
                Benefício Principal
              </h2>
              <div className="rounded-xl bg-gradient-to-r from-[#fe2c55]/5 to-[#fe2c55]/10 border border-[#fe2c55]/20 p-5">
                <p className="text-base font-medium text-[#1a1a2e] leading-relaxed">
                  {analysis.mainBenefit}
                </p>
              </div>
            </div>
          )}

          {/* ── Pirâmide de Decisão ── */}
          {analysis.decisionPyramid && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2 mb-6">
                <TrendingUp size={18} />
                Pirâmide de Decisão
              </h2>

              <div className="flex flex-col items-center gap-3">
                {PYRAMID_LEVELS.map((level) => {
                  const pyramid = analysis.decisionPyramid;
                  const value = pyramid
                    ? pyramid[level.key as keyof typeof pyramid]
                    : undefined;
                  return (
                    <div
                      key={level.key}
                      className="rounded-xl p-4 text-white text-center transition-all"
                      style={{
                        width: level.width,
                        backgroundColor: level.color,
                        maxWidth: "100%",
                      }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block mb-1">
                        {level.label}
                      </span>
                      <p className="text-sm font-medium leading-snug">
                        {value || "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Objeções ── */}
          {analysis.objections && analysis.objections.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-[#f59e0b]" />
                Objeções
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e0d4]">
                      <th className="text-left py-3 px-3 text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider">
                        Objeção
                      </th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider">
                        Origem
                      </th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold uppercase text-[#9ca3af] tracking-wider">
                        Tratamento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.objections.map((obj, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#e8e0d4] last:border-b-0 hover:bg-[#FAF7F2]/60"
                      >
                        <td className="py-3 px-3 font-medium text-[#1a1a2e]">
                          {obj.objection}
                        </td>
                        <td className="py-3 px-3 text-[#6b7280]">
                          {obj.source}
                        </td>
                        <td className="py-3 px-3 text-[#6b7280]">
                          {obj.treatment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Insights Estratégicos ── */}
          {analysis.strategicInsights && analysis.strategicInsights.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-[#f59e0b]" />
                Insights Estratégicos
              </h2>

              <div className="space-y-3">
                {analysis.strategicInsights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[#e8e0d4] p-4 bg-[#FAF7F2]/40"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#1a1a2e] leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Default export with Suspense wrapper ──
export default function ProductDetailWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-[#9ca3af] text-sm">
          Carregando...
        </div>
      }
    >
      <ProductDetail />
    </Suspense>
  );
}
