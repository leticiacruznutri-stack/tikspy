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
  DollarSign,
  Truck,
  ShoppingBag,
  Palette,
  FolderOpen,
  Video,
  ChevronRight,
  Ruler,
  MessageCircle,
} from "lucide-react";
import { getProductById, getAnalysis } from "@/lib/store";
import type { Product } from "@/lib/types";
import type { ProductAnalysis, ProductFeature } from "@/lib/types";

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
  { key: "desire", label: "Desejo", icon: "❤️", color: "#fe2c55", bg: "#fe2c55" },
  { key: "justification", label: "Justificativa", icon: "💡", color: "#f59e0b", bg: "#f59e0b" },
  { key: "rationalization", label: "Racionalização", icon: "🧠", color: "#3b82f6", bg: "#3b82f6" },
  { key: "conversion", label: "Conversão", icon: "✅", color: "#22c55e", bg: "#22c55e" },
];

function FeatureCard({ feature }: { feature: ProductFeature }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[feature.category] || "#6b7280";
  const catLabel = CATEGORY_LABELS[feature.category] || feature.category;

  return (
    <div className="rounded-xl border border-[#e8e0d4] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#faf8f5] transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
          <span className="text-[13px] font-medium text-[#1a1a2e] truncate">
            {feature.feature}
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: catColor + "15", color: catColor }}
          >
            {catLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="flex items-center gap-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < feature.ranking
                    ? "text-[#f59e0b] fill-[#f59e0b]"
                    : "text-[#e8e0d4]"
                }
              />
            ))}
          </div>
          {expanded ? (
            <ChevronUp size={14} className="text-[#c8b99a]" />
          ) : (
            <ChevronDown size={14} className="text-[#c8b99a]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#f0ebe3] pt-2.5">
          <DetailRow label="Por quê" value={feature.why} />
          <DetailRow label="O que faz" value={feature.whatItDoes} />
          <DetailRow label="Benefício dimensionado" value={feature.dimensioned} />
          <DetailRow
            label="Emoção positiva"
            value={feature.emotionPositive}
            valueClass="text-[#16a34a]"
          />
          <DetailRow
            label="Emoção negativa"
            value={feature.emotionNegative}
            valueClass="text-[#dc2626]"
          />
        </div>
      )}
    </div>
  );
}

function VideoAnalysisSection({ content }: { content: string }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Parse sections by ALL-CAPS titles
  const sections: { title: string; lines: string[] }[] = [];
  const rawLines = content.split("\n");
  let current: { title: string; lines: string[] } | null = null;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Detect section headers: all uppercase, at least 10 chars
    if (trimmed === trimmed.toUpperCase() && trimmed.length >= 10 && /[A-Z]/.test(trimmed)) {
      if (current) sections.push(current);
      current = { title: trimmed, lines: [] };
    } else if (current) {
      current.lines.push(trimmed);
    }
  }
  if (current && current.lines.length > 0) sections.push(current);

  const sectionConfig: { icon: typeof Video; color: string; label: string }[] = [
    { icon: TrendingUp, color: "#3b82f6", label: "Formatos que mais vendem" },
    { icon: Target, color: "#8b5cf6", label: "Padrões de hook visual" },
    { icon: Lightbulb, color: "#f59e0b", label: "Headlines que mais vendem" },
    { icon: Star, color: "#22c55e", label: "Ideias de vídeo pra Letícia" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8b5cf6]/10 shrink-0">
          <Video size={12} className="text-[#8b5cf6]" />
        </div>
        <p className="text-[13px] font-medium text-[#1a1a2e]">Análise dos vídeos top sellers</p>
      </div>
      {sections.map((section, i) => {
        const isExpanded = expandedSection === section.title;
        const config = sectionConfig[i] || { icon: ChevronRight, color: "#9ca3af", label: section.title };
        const Icon = config.icon;

        return (
          <div key={i} className="rounded-xl border border-[#f0ebe3] overflow-hidden">
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.title)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#faf8f5] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded shrink-0" style={{ backgroundColor: config.color + "15" }}>
                  <Icon size={11} style={{ color: config.color }} />
                </div>
                <span className="text-[12px] font-semibold text-[#1a1a2e]">{config.label}</span>
              </div>
              {isExpanded ? (
                <ChevronUp size={13} className="text-[#c8b99a]" />
              ) : (
                <ChevronDown size={13} className="text-[#c8b99a]" />
              )}
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-[#f0ebe3]">
                <div className="pt-2 space-y-1.5">
                  {section.lines.map((line, j) => {
                    const isNumbered = /^\d+\./.test(line);
                    const isBullet = line.startsWith("-");
                    const lineContent = isBullet ? line.slice(1).trim() : line;

                    if (isNumbered) {
                      const num = line.match(/^(\d+)\./)?.[1];
                      const rest = line.replace(/^\d+\.\s*/, "");
                      const dashIdx = rest.indexOf(" - ");
                      const title = dashIdx > -1 ? rest.slice(0, dashIdx) : rest;
                      const desc = dashIdx > -1 ? rest.slice(dashIdx + 3) : "";
                      return (
                        <div key={j} className="flex items-start gap-2 rounded-lg bg-[#faf8f5] px-2.5 py-2">
                          <span className="shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ backgroundColor: config.color }}>
                            {num}
                          </span>
                          <div className="flex-1">
                            <span className="text-[12px] font-medium text-[#1a1a2e]">{title}</span>
                            {desc && <p className="text-[11px] text-[#6b7280] mt-0.5 leading-relaxed">{desc}</p>}
                          </div>
                        </div>
                      );
                    }

                    if (isBullet) {
                      return (
                        <div key={j} className="flex items-start gap-2 pl-1 py-0.5">
                          <span className="text-[#c8b99a] mt-1 shrink-0 text-[8px]">●</span>
                          <p className="text-[12px] text-[#6b7280] leading-relaxed">{lineContent}</p>
                        </div>
                      );
                    }

                    return (
                      <p key={j} className="text-[12px] text-[#1a1a2e] leading-relaxed">{line}</p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
      <span className="text-[10px] font-semibold uppercase text-[#b8a88a] tracking-wider">
        {label}
      </span>
      <p className={`text-[13px] text-[#1a1a2e] mt-0.5 leading-relaxed ${valueClass ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof DollarSign; label: string; value: string | number | undefined; accent?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-[#faf8f5] px-3 py-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: (accent || "#e8e0d4") + "20" }}>
        <Icon size={13} style={{ color: accent || "#b8a88a" }} />
      </div>
      <div>
        <p className="text-[11px] text-[#9ca3af]">{label}</p>
        <p className="text-[13px] font-semibold text-[#1a1a2e]">{value}</p>
      </div>
    </div>
  );
}

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
      <div className="space-y-4">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 text-center">
          <Package size={32} className="mx-auto mb-3 text-[#c8b99a]" />
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
    <div className="space-y-4">
      {/* Header compacto */}
      <div>
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#e8e0d4]"
            />
          ) : (
            <span className="text-3xl">{product.emoji}</span>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#1a1a2e]">{product.name}</h1>
            {product.description && (
              <p className="text-[13px] text-[#9ca3af] mt-0.5">{product.description}</p>
            )}
          </div>
          {product.shopUrl && (
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#f5f0ea] px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#1a1a2e] transition-colors shrink-0"
            >
              <ExternalLink size={12} />
              Ver na loja
            </a>
          )}
        </div>
      </div>

      {/* Sem análise */}
      {!analysis && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-10 text-center">
          <Package size={28} className="mx-auto mb-2 text-[#c8b99a]" />
          <p className="text-[#9ca3af] text-sm mb-3">Nenhuma análise cadastrada</p>
          <Link
            href={`/produtos/${productId}/analise`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
          >
            Criar análise
          </Link>
        </div>
      )}

      {analysis && (
        <>
          {/* Ficha do produto - grid compacto */}
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <Package size={14} className="text-[#b8a88a]" />
              Ficha do produto
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <StatCard icon={DollarSign} label="Preço" value={analysis.price} accent="#22c55e" />
              <StatCard icon={DollarSign} label="Original" value={analysis.originalPrice} accent="#9ca3af" />
              <StatCard icon={DollarSign} label="Desconto" value={analysis.discount} accent="#fe2c55" />
              <StatCard icon={Truck} label="Frete" value={analysis.shipping} accent="#3b82f6" />
              <StatCard icon={Star} label="Nota" value={analysis.rating} accent="#f59e0b" />
              <StatCard icon={MessageCircle} label="Avaliações" value={analysis.reviewCount} accent="#f59e0b" />
              <StatCard icon={ShoppingBag} label="Vendidos" value={analysis.soldCount} accent="#8b5cf6" />
              <StatCard icon={Package} label="Vendedor" value={analysis.seller} accent="#6b7280" />
            </div>

            {/* Material, Tamanhos, Cores - inline */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
              {analysis.material && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#b8a88a] uppercase">Material</span>
                  <span className="text-[12px] text-[#1a1a2e]">{analysis.material}</span>
                </div>
              )}
              {analysis.sizes && analysis.sizes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Ruler size={11} className="text-[#b8a88a]" />
                  <div className="flex gap-1">
                    {analysis.sizes.map((size, i) => (
                      <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-[#f5f0ea] text-[#6b7280]">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.colors && analysis.colors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Palette size={11} className="text-[#b8a88a]" />
                  <span className="text-[12px] text-[#6b7280]">
                    {analysis.colors.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Benefício principal - destaque */}
          {analysis.mainBenefit && (
            <div className="rounded-2xl bg-gradient-to-br from-[#fe2c55]/5 to-[#fe2c55]/10 border border-[#fe2c55]/15 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fe2c55]/10 shrink-0">
                  <Target size={15} className="text-[#fe2c55]" />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold text-[#fe2c55] uppercase tracking-wider mb-1">
                    Benefício principal
                  </h2>
                  <p className="text-[14px] text-[#1a1a2e] leading-relaxed">
                    {analysis.mainBenefit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recursos e benefícios */}
          {analysis.features && analysis.features.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <Star size={14} className="text-[#b8a88a]" />
                Recursos e benefícios
              </h2>

              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const tabColor = tab.key === "all" ? "#1a1a2e" : CATEGORY_COLORS[tab.key] || "#1a1a2e";
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-all"
                      style={
                        isActive
                          ? { backgroundColor: tabColor + "15", color: tabColor }
                          : { color: "#9ca3af" }
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                {filteredFeatures.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
                {filteredFeatures.length === 0 && (
                  <p className="text-[13px] text-[#9ca3af] text-center py-4">
                    Nenhum recurso nesta categoria
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pirâmide de decisão */}
          {analysis.decisionPyramid && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <TrendingUp size={14} className="text-[#b8a88a]" />
                Pirâmide de decisão
              </h2>

              <div className="flex flex-col items-center gap-1.5 py-2">
                {PYRAMID_LEVELS.map((level, idx) => {
                  const pyramid = analysis.decisionPyramid;
                  const value = pyramid
                    ? pyramid[level.key as keyof typeof pyramid]
                    : undefined;
                  const widths = ["40%", "60%", "80%", "100%"];
                  return (
                    <div
                      key={level.key}
                      className="rounded-xl px-4 py-2.5 text-center"
                      style={{
                        width: widths[idx],
                        minWidth: "200px",
                        maxWidth: "100%",
                        backgroundColor: level.color + "12",
                        borderLeft: `3px solid ${level.color}`,
                      }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: level.color }}>
                        {level.icon} {level.label}
                      </span>
                      <p className="text-[12px] text-[#1a1a2e] leading-relaxed mt-0.5">
                        {value || "-"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objeções - cards ao invés de tabela */}
          {analysis.objections && analysis.objections.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <AlertTriangle size={14} className="text-[#f59e0b]" />
                Objeções
              </h2>

              <div className="space-y-2">
                {analysis.objections.map((obj, i) => (
                  <div key={i} className="rounded-xl border border-[#f0ebe3] px-3 py-2.5">
                    <p className="text-[13px] font-medium text-[#1a1a2e]">
                      &ldquo;{obj.objection}&rdquo;
                    </p>
                    <div className="flex gap-4 mt-1.5">
                      <div>
                        <span className="text-[9px] font-semibold text-[#b8a88a] uppercase tracking-wider">Origem</span>
                        <p className="text-[12px] text-[#6b7280]">{obj.source}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-semibold text-[#22c55e] uppercase tracking-wider">Tratamento</span>
                        <p className="text-[12px] text-[#6b7280]">{obj.treatment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights estratégicos */}
          {analysis.strategicInsights && analysis.strategicInsights.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <Lightbulb size={14} className="text-[#f59e0b]" />
                Insights estratégicos
              </h2>

              <div className="space-y-1.5">
                {analysis.strategicInsights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl bg-[#faf8f5] px-3 py-2.5"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[13px] text-[#1a1a2e] leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referências */}
          {(analysis.swipeFileUrl || analysis.videoAnalysis) && (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <FolderOpen size={14} className="text-[#b8a88a]" />
                Referências
              </h2>

              {analysis.swipeFileUrl && (
                <a
                  href={analysis.swipeFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-[#faf8f5] px-4 py-3 hover:bg-[#f5f0ea] transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6]/10 shrink-0">
                    <Video size={14} className="text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#1a1a2e]">Swipe File de vídeos</p>
                    <p className="text-[11px] text-[#9ca3af]">Vídeos de referência dos top sellers</p>
                  </div>
                  <ChevronRight size={14} className="text-[#c8b99a] group-hover:text-[#1a1a2e] transition-colors" />
                </a>
              )}

              {analysis.videoAnalysis && (
                <VideoAnalysisSection content={analysis.videoAnalysis} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
