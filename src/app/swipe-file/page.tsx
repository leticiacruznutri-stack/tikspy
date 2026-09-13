"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderOpen,
  FolderClosed,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Tag,
  Zap,
  FileText,
  Megaphone,
  Search,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SwipeRef = {
  id: string;
  creator_name: string;
  video_number: number;
  product: string;
  drive_url: string | null;
  drive_file_id: string | null;
  duration_seconds: number | null;
  hook_type: string | null;
  hook_text: string | null;
  hook_headline: string | null;
  hook_visual: string | null;
  body_text: string | null;
  cta_text: string | null;
  transcription: string | null;
  why_it_works: string | null;
  visual_pattern: string | null;
  como_modelar: string | null;
  tags: string[];
  created_at: string;
};

const HOOK_TYPE_LABELS: Record<string, string> = {
  comparacao: "Comparacao de preco",
  unboxing: "Unboxing",
  prova_social: "Prova social",
  demonstracao: "Demonstracao",
  contagem: "Contagem de features",
  prova_fisica: "Prova fisica",
  incredulidade: "Incredulidade",
  feature_unica: "Feature unica",
  teste: "Teste ao vivo",
  objecao: "Objecao invertida",
  educacao: "Educacao + produto",
  declaracao_ousada: "Declaracao ousada",
  melhores_compras: "Melhores compras",
  review: "Review",
  review_rapido: "Review rapido",
};

const HOOK_TYPE_COLORS: Record<string, string> = {
  comparacao: "#f59e0b",
  unboxing: "#8b5cf6",
  prova_social: "#ec4899",
  demonstracao: "#3b82f6",
  contagem: "#06b6d4",
  prova_fisica: "#22c55e",
  incredulidade: "#f97316",
  feature_unica: "#e11d48",
  teste: "#ef4444",
  objecao: "#6366f1",
  educacao: "#14b8a6",
  declaracao_ousada: "#a855f7",
  melhores_compras: "#84cc16",
  review: "#64748b",
  review_rapido: "#78716c",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getThumbnailUrl(fileId: string | null): string {
  if (!fileId) return "";
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export default function SwipeFilePage() {
  const [refs, setRefs] = useState<SwipeRef[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterHookType, setFilterHookType] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("swipe_references")
      .select("*")
      .order("video_number", { ascending: true });
    if (!error && data) setRefs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Group by creator
  const groupedByCreator = new Map<string, SwipeRef[]>();
  for (const r of refs) {
    const list = groupedByCreator.get(r.creator_name) || [];
    list.push(r);
    groupedByCreator.set(r.creator_name, list);
  }

  // Get the current folder's refs
  const folderRefs = openFolder ? groupedByCreator.get(openFolder) || [] : [];

  // Unique values for filters (scoped to open folder)
  const products = [...new Set(folderRefs.map((r) => r.product))].sort();
  const hookTypes = [...new Set(folderRefs.map((r) => r.hook_type).filter(Boolean))].sort() as string[];

  // Filter (inside folder)
  const filtered = folderRefs.filter((r) => {
    if (filterProduct && r.product !== filterProduct) return false;
    if (filterHookType && r.hook_type !== filterHookType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.product.toLowerCase().includes(q) ||
        r.hook_text?.toLowerCase().includes(q) ||
        r.hook_headline?.toLowerCase().includes(q) ||
        r.transcription?.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#9ca3af] text-sm">Carregando swipe file...</p>
      </div>
    );
  }

  // ── Folder index view ──
  if (!openFolder) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] flex items-center gap-2">
            <FolderOpen size={24} />
            Swipe File
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            {refs.length} videos de referencia analisados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...groupedByCreator.entries()].map(([creator, creatorRefs]) => {
            // Get first ref with a thumbnail for the folder cover
            const cover = creatorRefs.find((r) => r.drive_file_id);
            const uniqueProducts = [...new Set(creatorRefs.map((r) => r.product))];
            return (
              <button
                key={creator}
                onClick={() => {
                  setOpenFolder(creator);
                  setSearchQuery("");
                  setFilterProduct("");
                  setFilterHookType("");
                  setExpandedId(null);
                }}
                className="group rounded-2xl border border-[#e8e0d4] bg-white shadow-sm hover:shadow-md hover:border-[#c8b99a] transition-all overflow-hidden text-left"
              >
                {/* Folder info */}
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FolderClosed size={18} className="text-[#c8b99a]" />
                      <h3 className="font-semibold text-sm text-[#1a1a2e] truncate">{creator}</h3>
                    </div>
                    <span className="text-[11px] text-[#9ca3af] font-medium">{creatorRefs.length} videos</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueProducts.slice(0, 3).map((p) => (
                      <span key={p} className="text-[10px] bg-[#f5f0ea] text-[#6b7280] rounded-full px-2 py-0.5">
                        {p}
                      </span>
                    ))}
                    {uniqueProducts.length > 3 && (
                      <span className="text-[10px] text-[#9ca3af]">
                        +{uniqueProducts.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Inside a folder ──
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div>
        <button
          onClick={() => {
            setOpenFolder(null);
            setExpandedId(null);
          }}
          className="flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#1a1a2e] transition-colors mb-2"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-[#1a1a2e] flex items-center gap-2">
          <FolderOpen size={24} className="text-[#f59e0b]" />
          {openFolder}
        </h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          {folderRefs.length} videos de referencia
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8b99a]"
          />
          <input
            type="text"
            placeholder="Buscar por produto, hook, texto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#e8e0d4] pl-9 pr-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#6b7280] focus:outline-none focus:border-[#1a1a2e]"
        >
          <option value="">Todos os produtos</option>
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filterHookType}
          onChange={(e) => setFilterHookType(e.target.value)}
          className="rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#6b7280] focus:outline-none focus:border-[#1a1a2e]"
        >
          <option value="">Todos os tipos de hook</option>
          {hookTypes.map((t) => (
            <option key={t} value={t}>
              {HOOK_TYPE_LABELS[t] || t}
            </option>
          ))}
        </select>

        {(filterProduct || filterHookType || searchQuery) && (
          <button
            onClick={() => {
              setFilterProduct("");
              setFilterHookType("");
              setSearchQuery("");
            }}
            className="text-xs text-[#9ca3af] hover:text-[#1a1a2e]"
          >
            Limpar filtros
          </button>
        )}

        <span className="text-xs text-[#9ca3af] ml-auto">
          {filtered.length} videos
        </span>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((ref) => {
              const isExpanded = expandedId === ref.id;
              const hookColor =
                HOOK_TYPE_COLORS[ref.hook_type || ""] || "#9ca3af";

              return (
                <div
                  key={ref.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isExpanded
                      ? "border-[#1a1a2e] shadow-md col-span-full"
                      : "border-[#e8e0d4] shadow-sm hover:shadow-md hover:border-[#c8b99a]"
                  } bg-white`}
                >
                  {/* Card header - thumbnail + info */}
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : ref.id)
                    }
                  >
                    <div className="flex gap-3 p-3">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 rounded-xl bg-[#f5f0ea] overflow-hidden shrink-0">
                        {ref.drive_file_id ? (
                          <img
                            src={getThumbnailUrl(ref.drive_file_id)}
                            alt={`THAISFAVERO-${String(ref.video_number).padStart(2, "0")}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play size={20} className="text-white" fill="white" />
                        </div>
                        {ref.duration_seconds && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] rounded px-1 py-0.5">
                            {formatDuration(ref.duration_seconds)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#c8b99a]">
                            #{String(ref.video_number).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-semibold text-[#1a1a2e] truncate">
                            {ref.product}
                          </span>
                        </div>

                        {ref.hook_type && (
                          <span
                            className="inline-block mt-1 text-[10px] font-semibold rounded-full px-2 py-0.5 text-white"
                            style={{ backgroundColor: hookColor }}
                          >
                            {HOOK_TYPE_LABELS[ref.hook_type] || ref.hook_type}
                          </span>
                        )}

                        {ref.hook_headline && (
                          <p className="text-[12px] text-[#6b7280] mt-1 leading-snug line-clamp-2 italic">
                            {ref.hook_headline}
                          </p>
                        )}

                        {ref.hook_text && !isExpanded && (
                          <p className="text-[11px] text-[#9ca3af] mt-1 line-clamp-2">
                            {ref.hook_text}
                          </p>
                        )}
                      </div>

                      {/* Expand icon */}
                      <div className="shrink-0 self-center">
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-[#9ca3af]" />
                        ) : (
                          <ChevronRight size={16} className="text-[#9ca3af]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-[#f0ebe3] p-4 space-y-4">
                      {/* Drive link */}
                      {ref.drive_url && (
                        <a
                          href={ref.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
                        >
                          <Play size={14} fill="white" />
                          Assistir no Drive
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {/* Hook */}
                      {ref.hook_text && (
                        <div className="rounded-xl bg-[#faf8f5] p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#f59e0b]">
                              HOOK
                            </span>
                            {ref.hook_headline && (
                              <span className="text-[11px] italic text-[#b8a88a]">
                                Texto na tela: &quot;{ref.hook_headline}&quot;
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-[#1a1a2e] leading-relaxed">
                            {ref.hook_text}
                          </p>
                        </div>
                      )}

                      {/* Visual pattern */}
                      {ref.visual_pattern && (
                        <div className="rounded-xl bg-[#f0f9ff] p-3 space-y-1">
                          <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#3b82f6]">
                            VISUAL (0-5s)
                          </span>
                          <p className="text-[12px] text-[#1e40af] leading-relaxed">
                            {ref.visual_pattern}
                          </p>
                        </div>
                      )}

                      {/* Body */}
                      {ref.body_text && (
                        <div className="rounded-xl bg-[#faf8f5] p-3 space-y-1">
                          <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#3b82f6]">
                            BODY
                          </span>
                          <p className="text-[13px] text-[#1a1a2e] leading-relaxed">
                            {ref.body_text}
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      {ref.cta_text && (
                        <div className="rounded-xl bg-[#faf8f5] p-3 space-y-1">
                          <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#8b5cf6]">
                            CTA
                          </span>
                          <p className="text-[13px] text-[#1a1a2e] leading-relaxed">
                            {ref.cta_text}
                          </p>
                        </div>
                      )}

                      {/* Why it works */}
                      {ref.why_it_works && (
                        <div className="rounded-xl bg-[#fefce8] p-3 space-y-1">
                          <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-[#854d0e] bg-[#fde68a]">
                            POR QUE FUNCIONOU
                          </span>
                          <p className="text-[12px] text-[#854d0e] leading-relaxed">
                            {ref.why_it_works}
                          </p>
                        </div>
                      )}

                      {/* Como Modelar */}
                      {ref.como_modelar && (
                        <details className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] overflow-hidden">
                          <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-[#dcfce7] transition-colors">
                            <span className="flex items-center gap-2">
                              <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#22c55e]">
                                COMO MODELAR
                              </span>
                              <span className="text-[11px] text-[#166534]">
                                Clique pra expandir e copiar
                              </span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                navigator.clipboard.writeText(ref.como_modelar || "");
                                const btn = e.currentTarget;
                                btn.textContent = "Copiado!";
                                setTimeout(() => { btn.textContent = "Copiar tudo"; }, 2000);
                              }}
                              className="text-[11px] text-white bg-[#22c55e] hover:bg-[#16a34a] font-medium px-3 py-1 rounded-lg transition-colors"
                            >
                              Copiar tudo
                            </button>
                          </summary>
                          <div className="px-3 pb-3 max-h-[400px] overflow-y-auto border-t border-[#bbf7d0]">
                            <pre className="text-[12px] text-[#166534] leading-relaxed whitespace-pre-wrap font-sans pt-2">
                              {ref.como_modelar}
                            </pre>
                          </div>
                        </details>
                      )}

                      {/* Transcription */}
                      {ref.transcription && (
                        <details className="rounded-xl bg-[#faf8f5] overflow-hidden">
                          <summary className="px-3 py-2 text-[11px] font-semibold text-[#9ca3af] cursor-pointer hover:bg-[#f0ebe3]">
                            Transcricao completa
                          </summary>
                          <div className="px-3 pb-3">
                            <p className="text-[12px] text-[#6b7280] leading-relaxed whitespace-pre-wrap">
                              {ref.transcription}
                            </p>
                          </div>
                        </details>
                      )}

                      {/* Tags */}
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {ref.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-[#f5f0ea] text-[#6b7280] rounded-full px-2 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 text-center">
          <FolderOpen size={32} className="mx-auto mb-2 text-[#9ca3af] opacity-40" />
          <p className="text-[#9ca3af] text-sm">
            Nenhum video encontrado com os filtros atuais
          </p>
        </div>
      )}
    </div>
  );
}
