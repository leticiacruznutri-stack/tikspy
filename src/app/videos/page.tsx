"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trash2,
  Calendar,
  Zap,
  FileText,
  Megaphone,
  Film,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import {
  getProducts,
  getAllPieces,
  getCombos,
  addCombo,
  updateCombo,
  deleteCombo,
} from "@/lib/store";
import { ANGLES } from "@/lib/angles";
import type { ContentPiece, Product, VideoCombo } from "@/lib/types";

const COMBO_STATUS_LABELS: Record<VideoCombo["status"], string> = {
  planned: "Planejado",
  filming: "Filmado",
  editing: "Editado",
  posted: "Postado",
};

const COMBO_STATUS_COLORS: Record<VideoCombo["status"], string> = {
  planned: "bg-[#9ca3af]",
  filming: "bg-[#3b82f6]",
  editing: "bg-[#f59e0b]",
  posted: "bg-[#22c55e]",
};

const HOOK_ONLY_FORMATS = ["POV"];

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

type SlotType = "hook" | "body" | "cta";

const SLOT_CONFIG: { type: SlotType; label: string; color: string; bg: string; icon: typeof Zap }[] = [
  { type: "hook", label: "Hook", color: "#f59e0b", bg: "bg-[#fffbeb]", icon: Zap },
  { type: "body", label: "Body", color: "#3b82f6", bg: "bg-[#eff6ff]", icon: FileText },
  { type: "cta", label: "CTA", color: "#8b5cf6", bg: "bg-[#f5f3ff]", icon: Megaphone },
];

/* ── Product select with images ── */
function ProductSelect({
  products,
  value,
  onChange,
  allLabel = "Todos",
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[#e8e0d4] px-3 py-1.5 text-xs font-medium text-[#1a1a2e] bg-white hover:border-[#c8b99a] transition-colors min-w-[140px]"
      >
        {selected ? (
          <>
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.name} className="w-5 h-5 rounded object-cover" />
            ) : (
              <span>{selected.emoji}</span>
            )}
            <span className="flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left">{allLabel}</span>
        )}
        <ChevronDown size={12} className={`text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-xl border border-[#e8e0d4] bg-white shadow-lg py-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[#faf8f5] transition-colors ${value === "" ? "font-semibold text-[#1a1a2e]" : "text-[#6b7280]"}`}
          >
            {value === "" && <Check size={12} />}
            {allLabel}
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[#faf8f5] transition-colors ${value === p.id ? "font-semibold text-[#1a1a2e]" : "text-[#6b7280]"}`}
            >
              {value === p.id && <Check size={12} />}
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-5 h-5 rounded object-cover" />
              ) : (
                <span>{p.emoji}</span>
              )}
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VideosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allPieces, setAllPieces] = useState<ContentPiece[]>([]);
  const [combos, setCombos] = useState<VideoCombo[]>([]);

  // Builder state
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [builderTab, setBuilderTab] = useState<SlotType>("hook");
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [selectedCtaId, setSelectedCtaId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(formatDateISO(new Date()));

  // Agenda state
  const [agendaDate, setAgendaDate] = useState(formatDateISO(new Date()));
  const [checkedPieces, setCheckedPieces] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Combo list filter
  const [comboFilterProduct, setComboFilterProduct] = useState<string>("");

  const [usedPieceIds, setUsedPieceIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const [prods, pieces, allCombos] = await Promise.all([
      getProducts(),
      getAllPieces(),
      getCombos(),
    ]);
    setProducts(prods);
    setAllPieces(pieces);
    setCombos(allCombos);
    const used = new Set<string>();
    for (const c of allCombos) {
      used.add(c.hookId);
      if (c.bodyId) used.add(c.bodyId);
      if (c.ctaId) used.add(c.ctaId);
    }
    setUsedPieceIds(used);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const getPiece = (id: string) => allPieces.find((p) => p.id === id);
  const getProduct = (id: string) => products.find((p) => p.id === id);

  // Stable numbering per product+type
  const pieceNumberMap = (() => {
    const map = new Map<string, string>();
    const counters = new Map<string, number>();
    const prefix = (type: string) => type === "hook" ? "H" : type === "body" ? "B" : "C";
    for (const p of allPieces) {
      const key = `${p.productId}-${p.type}`;
      const n = (counters.get(key) || 0) + 1;
      counters.set(key, n);
      map.set(p.id, `${prefix(p.type)}${n}`);
    }
    return map;
  })();
  const pieceLabel = (id: string): string => pieceNumberMap.get(id) || "";

  // Filter pieces for the builder
  const builderPieces = allPieces.filter((p) => {
    if (filterProduct && p.productId !== filterProduct) return false;
    return true;
  });
  const hooks = builderPieces.filter((p) => p.type === "hook");
  const bodies = builderPieces.filter((p) => p.type === "body");
  const ctas = builderPieces.filter((p) => p.type === "cta");

  const currentList = builderTab === "hook" ? hooks : builderTab === "body" ? bodies : ctas;

  const selectedHook = selectedHookId ? getPiece(selectedHookId) : null;
  const selectedBody = selectedBodyId ? getPiece(selectedBodyId) : null;
  const selectedCta = selectedCtaId ? getPiece(selectedCtaId) : null;

  const hookIsSolo = selectedHook && HOOK_ONLY_FORMATS.includes(selectedHook.videoFormat || "");
  const canCreate = selectedHook && (hookIsSolo || (selectedBody && selectedCta));

  const handleSelect = (piece: ContentPiece) => {
    if (piece.type === "hook") setSelectedHookId(piece.id === selectedHookId ? null : piece.id);
    if (piece.type === "body") setSelectedBodyId(piece.id === selectedBodyId ? null : piece.id);
    if (piece.type === "cta") setSelectedCtaId(piece.id === selectedCtaId ? null : piece.id);
  };

  const handleCreate = async () => {
    if (!selectedHook) return;
    await addCombo({
      hookId: selectedHook.id,
      bodyId: hookIsSolo ? undefined : selectedBody?.id,
      ctaId: hookIsSolo ? undefined : selectedCta?.id,
      productId: selectedHook.productId,
      angle: selectedHook.angle,
      status: "planned",
      scheduledDate: scheduleDate || undefined,
    });
    setSelectedHookId(null);
    setSelectedBodyId(null);
    setSelectedCtaId(null);
    reload();
  };

  // Agenda
  const agendaCombos = combos.filter((c) => c.scheduledDate === agendaDate);
  const agendaByProduct = new Map<string, VideoCombo[]>();
  for (const combo of agendaCombos) {
    const list = agendaByProduct.get(combo.productId) || [];
    list.push(combo);
    agendaByProduct.set(combo.productId, list);
  }

  const togglePieceCheck = (pieceId: string) => {
    setCheckedPieces((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) next.delete(pieceId);
      else next.add(pieceId);
      return next;
    });
  };

  const handleDeleteCombo = async (id: string) => {
    await deleteCombo(id);
    reload();
  };

  const handleStatusChange = async (id: string, status: VideoCombo["status"]) => {
    await updateCombo(id, { status });
    reload();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const filteredCombos = comboFilterProduct
    ? combos.filter((c) => c.productId === comboFilterProduct)
    : combos;

  // Helper to get selected piece for a slot
  const getSlotPiece = (type: SlotType) =>
    type === "hook" ? selectedHook : type === "body" ? selectedBody : selectedCta;

  const clearSlot = (type: SlotType) => {
    if (type === "hook") setSelectedHookId(null);
    if (type === "body") setSelectedBodyId(null);
    if (type === "cta") setSelectedCtaId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Montar Videos</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Escolha hook, body e CTA pra montar seus combos
        </p>
      </div>

      {/* ══════════════ BUILDER ══════════════ */}
      <div className="space-y-4">
        {/* Montagem preview - always visible */}
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <Film size={16} className="text-[#c8b99a]" />
              Montagem
            </h2>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#c8b99a]" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="text-xs border border-[#e8e0d4] rounded-lg px-2 py-1.5 text-[#1a1a2e] bg-white focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
          </div>

          <div className="space-y-2">
            {SLOT_CONFIG.map(({ type, label, color, bg, icon: Icon }) => {
              if (hookIsSolo && (type === "body" || type === "cta")) return null;
              const piece = getSlotPiece(type);
              const product = piece ? getProduct(piece.productId) : null;
              return (
                <div
                  key={type}
                  onClick={() => setBuilderTab(type)}
                  className={`rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                    piece
                      ? `${bg} border-[${color}]/30`
                      : builderTab === type
                        ? "border-[#1a1a2e] bg-[#faf8f5]"
                        : "border-dashed border-[#e8e0d4] bg-[#faf8f5] hover:border-[#c8b99a]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    >
                      {piece ? pieceLabel(piece.id) : label[0]}
                    </span>
                    {piece ? (
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#1a1a2e] leading-snug whitespace-pre-wrap line-clamp-2">
                          {piece.text}
                        </p>
                        {product && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#9ca3af] mt-1">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-3.5 h-3.5 rounded object-cover" />
                            ) : (
                              product.emoji
                            )}
                            {product.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#9ca3af] italic">
                        Clique pra escolher {label.toLowerCase()}
                      </p>
                    )}
                    {piece && (
                      <button
                        onClick={(e) => { e.stopPropagation(); clearSlot(type); }}
                        className="shrink-0 rounded p-0.5 text-[#9ca3af] hover:text-[#fe2c55]"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hookIsSolo && (
            <p className="text-[11px] text-[#9ca3af] italic text-center mt-2">
              Formato {selectedHook?.videoFormat} — so hook
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-30 mt-3"
          >
            <Plus size={16} />
            Criar Combo
          </button>
        </div>

        {/* Pieces selector */}
        <div className="rounded-2xl bg-white border border-[#e8e0d4] shadow-sm overflow-hidden">
          {/* Tab bar + product filter */}
          <div className="border-b border-[#e8e0d4] px-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                {SLOT_CONFIG.map(({ type, label, color, icon: Icon }) => {
                  const count = type === "hook" ? hooks.length : type === "body" ? bodies.length : ctas.length;
                  const isActive = builderTab === type;
                  const hasSelection = type === "hook" ? selectedHookId : type === "body" ? selectedBodyId : selectedCtaId;
                  return (
                    <button
                      key={type}
                      onClick={() => setBuilderTab(type)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "text-white"
                          : "text-[#6b7280] hover:bg-[#f5f0ea]"
                      }`}
                      style={isActive ? { backgroundColor: color } : {}}
                    >
                      <Icon size={13} />
                      {label}
                      <span className={`text-[10px] ${isActive ? "text-white/70" : "text-[#9ca3af]"}`}>
                        {count}
                      </span>
                      {hasSelection && !isActive && (
                        <Check size={10} style={{ color }} />
                      )}
                    </button>
                  );
                })}
              </div>
              <ProductSelect products={products} value={filterProduct} onChange={setFilterProduct} />
            </div>
          </div>

          {/* Piece list */}
          <div className="max-h-[50vh] overflow-y-auto">
            {currentList.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#9ca3af] text-sm">
                  Nenhum {builderTab === "hook" ? "hook" : builderTab === "body" ? "body" : "CTA"} cadastrado
                  {filterProduct ? " pra esse produto" : ""}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0ebe3]">
                {currentList.map((piece, idx) => {
                  const product = getProduct(piece.productId);
                  const isSelected =
                    builderTab === "hook" ? selectedHookId === piece.id
                    : builderTab === "body" ? selectedBodyId === piece.id
                    : selectedCtaId === piece.id;
                  const isUsed = usedPieceIds.has(piece.id);
                  const slotColor = SLOT_CONFIG.find((s) => s.type === builderTab)?.color || "#9ca3af";

                  return (
                    <button
                      key={piece.id}
                      onClick={() => handleSelect(piece)}
                      className={`w-full text-left px-4 py-3 transition-all hover:bg-[#faf8f5] ${
                        isSelected
                          ? "bg-[#faf8f5] ring-2 ring-inset ring-[#1a1a2e]"
                          : isUsed
                            ? "bg-[#fefce8]"
                            : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Number + check */}
                        <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold text-[#c8b99a]">{pieceLabel(piece.id)}</span>
                          {isSelected && (
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: slotColor }}
                            >
                              <Check size={10} />
                            </span>
                          )}
                          {isUsed && !isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" title="Usado em combo" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#1a1a2e] leading-snug whitespace-pre-wrap">
                            {piece.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {product && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#9ca3af]">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="w-4 h-4 rounded object-cover" />
                                ) : (
                                  product.emoji
                                )}
                                {product.name}
                              </span>
                            )}
                            {piece.videoFormat && (
                              <span className="text-[9px] text-[#9ca3af] bg-[#f5f0ea] rounded-full px-1.5 py-0.5">
                                {piece.videoFormat}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ AGENDA DO DIA ══════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Agenda do dia</h2>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#c8b99a]" />
            <input
              type="date"
              value={agendaDate}
              onChange={(e) => setAgendaDate(e.target.value)}
              className="text-xs border border-[#e8e0d4] rounded-lg px-2 py-1.5 text-[#1a1a2e] bg-white focus:outline-none focus:border-[#1a1a2e]"
            />
            {agendaDate === formatDateISO(new Date()) && (
              <span className="text-[10px] bg-[#fe2c55] text-white rounded-full px-2 py-0.5 font-medium">
                Hoje
              </span>
            )}
          </div>
          {agendaCombos.length > 0 && (
            <span className="text-xs text-[#9ca3af] ml-auto">
              {agendaCombos.length} video{agendaCombos.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {agendaCombos.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-8 shadow-sm text-center">
            <Film size={32} className="mx-auto mb-2 text-[#9ca3af] opacity-40" />
            <p className="text-[#9ca3af] text-sm">
              Nenhum video agendado pra essa data
            </p>
            <p className="text-[#c8b99a] text-xs mt-1">
              Monte combos acima e agende pra esse dia
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {[...agendaByProduct.entries()].map(([productId, productCombos]) => {
              const product = getProduct(productId);
              const hookIds = [...new Set(productCombos.map((c) => c.hookId))];
              const bodyIds = [...new Set(productCombos.map((c) => c.bodyId).filter((id): id is string => !!id))];
              const ctaIds = [...new Set(productCombos.map((c) => c.ctaId).filter((id): id is string => !!id))];

              const sections = [
                { ids: hookIds, label: "Hooks", icon: Zap, color: "#f59e0b" },
                { ids: bodyIds, label: "Bodies", icon: FileText, color: "#3b82f6" },
                { ids: ctaIds, label: "CTAs", icon: Megaphone, color: "#8b5cf6" },
              ];

              const totalPieces = hookIds.length + bodyIds.length + ctaIds.length;
              const checkedCount = [...hookIds, ...bodyIds, ...ctaIds].filter((id) => checkedPieces.has(id)).length;

              return (
                <div key={productId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {product?.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <span className="text-lg">{product?.emoji}</span>
                    )}
                    <span className="text-sm font-semibold text-[#1a1a2e]">{product?.name}</span>
                    <span className="text-[11px] text-[#9ca3af]">
                      {productCombos.length} video{productCombos.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-[#9ca3af] ml-auto">
                      {checkedCount}/{totalPieces} gravados
                    </span>
                  </div>

                  {sections.map(({ ids, label, icon: Icon, color }) => ids.length === 0 ? null : (
                    <div key={label} className="rounded-2xl bg-white border border-[#e8e0d4] overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleSection(`${productId}-${label}`)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-[#faf8f5] transition-colors"
                      >
                        {expandedSections.has(`${productId}-${label}`) ? (
                          <ChevronDown size={14} className="text-[#c8b99a]" />
                        ) : (
                          <ChevronRight size={14} className="text-[#c8b99a]" />
                        )}
                        <Icon size={14} style={{ color }} />
                        <span className="text-sm font-semibold text-[#1a1a2e]">{label}</span>
                        <span className="text-[11px] text-[#9ca3af]">({ids.length})</span>
                      </button>
                      {expandedSections.has(`${productId}-${label}`) && (
                        <div className="border-t border-[#f0ebe3]">
                          {ids.map((pieceId, idx) => {
                            const piece = getPiece(pieceId);
                            const checked = checkedPieces.has(pieceId);
                            return (
                              <div
                                key={pieceId}
                                className={`flex items-start gap-3 px-4 py-2.5 hover:bg-[#faf8f5] transition-colors ${
                                  idx > 0 ? "border-t border-[#f0ebe3]" : ""
                                }`}
                              >
                                <button
                                  onClick={() => togglePieceCheck(pieceId)}
                                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 mt-0.5 ${
                                    checked
                                      ? "bg-[#22c55e] border-[#22c55e] text-white"
                                      : "border-[#d1d5db] hover:border-[#1a1a2e]"
                                  }`}
                                >
                                  {checked && <Check size={12} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] leading-snug whitespace-pre-wrap ${checked ? "text-[#9ca3af] line-through" : "text-[#1a1a2e]"}`}>
                                    <span className="text-[10px] font-bold text-[#c8b99a] mr-1">{pieceLabel(pieceId)}</span>
                                    {piece?.text || "..."}
                                  </p>
                                  {piece?.visualHook && (
                                    <p className="text-[11px] text-[#9ca3af] mt-1">
                                      {"\uD83C\uDFAC"} {piece.visualHook}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  <details className="rounded-2xl bg-white border border-[#e8e0d4] overflow-hidden shadow-sm">
                    <summary className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1a1a2e] cursor-pointer hover:bg-[#faf8f5]">
                      <Film size={14} className="text-[#c8b99a]" />
                      Combos
                      <span className="text-[11px] text-[#9ca3af] font-normal">({productCombos.length})</span>
                    </summary>
                    <div className="border-t border-[#f0ebe3]">
                      {productCombos.map((combo, idx) => {
                        const hook = getPiece(combo.hookId);
                        const body = combo.bodyId ? getPiece(combo.bodyId) : null;
                        const cta = combo.ctaId ? getPiece(combo.ctaId) : null;
                        return (
                          <div key={combo.id} className={`px-4 py-3 space-y-1.5 ${idx > 0 ? "border-t border-[#f0ebe3]" : ""}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#c8b99a]">V{idx + 1}</span>
                              <button onClick={() => handleDeleteCombo(combo.id)} className="rounded p-1 text-[#c8b99a] hover:text-[#fe2c55]">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="pl-4 space-y-1">
                              <p className="text-[12px] whitespace-pre-wrap">
                                <span className="text-[#f59e0b] font-semibold">{hook ? pieceLabel(hook.id) : "H"}:</span> {hook?.text || "..."}
                              </p>
                              {body && (
                                <p className="text-[12px] whitespace-pre-wrap">
                                  <span className="text-[#3b82f6] font-semibold">{pieceLabel(body.id)}:</span> {body.text}
                                </p>
                              )}
                              {cta && (
                                <p className="text-[12px] whitespace-pre-wrap">
                                  <span className="text-[#8b5cf6] font-semibold">{pieceLabel(cta.id)}:</span> {cta.text}
                                </p>
                              )}
                              {!body && !cta && <p className="text-[11px] text-[#9ca3af] italic">Formato solo</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════ TODOS OS COMBOS ══════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">
            Todos os Combos ({comboFilterProduct ? `${filteredCombos.length}/${combos.length}` : combos.length})
          </h2>
          <ProductSelect products={products} value={comboFilterProduct} onChange={setComboFilterProduct} />
        </div>

        {filteredCombos.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
            <p className="text-[#9ca3af] text-sm">Nenhum combo criado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCombos.map((combo) => {
              const product = products.find((p) => p.id === combo.productId);
              const hook = getPiece(combo.hookId);
              const body = combo.bodyId ? getPiece(combo.bodyId) : null;
              const cta = combo.ctaId ? getPiece(combo.ctaId) : null;

              return (
                <div
                  key={combo.id}
                  className="rounded-2xl bg-white border border-[#e8e0d4] p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF7F2] px-2 py-1 text-xs font-medium text-[#1a1a2e]">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-5 h-5 rounded object-cover" />
                        ) : (
                          product?.emoji
                        )}
                        {product?.name}
                      </span>
                      {combo.scheduledDate && (
                        <span className="text-[10px] text-[#9ca3af]">
                          {combo.scheduledDate}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#fe2c55] hover:bg-[#fe2c55]/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {hook && (
                      <div className="rounded-lg bg-[#fffbeb] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#f59e0b]">{pieceLabel(hook.id)}</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed whitespace-pre-wrap">{hook.text}</p>
                        {hook.headline && <p className="text-[11px] italic text-[#b8a88a]">{hook.headline}</p>}
                        {hook.visualHook && <p className="text-[11px] text-[#9ca3af]">{"\uD83C\uDFAC"} {hook.visualHook}</p>}
                      </div>
                    )}
                    {body && (
                      <div className="rounded-lg bg-[#eff6ff] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#3b82f6]">{pieceLabel(body.id)}</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed whitespace-pre-wrap">{body.text}</p>
                      </div>
                    )}
                    {cta && (
                      <div className="rounded-lg bg-[#f5f3ff] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#8b5cf6]">{pieceLabel(cta.id)}</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed whitespace-pre-wrap">{cta.text}</p>
                      </div>
                    )}
                    {!body && !cta && (
                      <p className="text-[11px] text-[#9ca3af] italic px-1">Formato solo — so hook com takes visuais</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e8e0d4]">
                    <select
                      value={combo.status}
                      onChange={(e) => handleStatusChange(combo.id, e.target.value as VideoCombo["status"])}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium text-white border-0 appearance-none cursor-pointer ${COMBO_STATUS_COLORS[combo.status]}`}
                    >
                      <option value="planned">Planejado</option>
                      <option value="filming">Filmado</option>
                      <option value="editing">Editado</option>
                      <option value="posted">Postado</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#9ca3af]" />
                      <input
                        type="date"
                        value={combo.scheduledDate || ""}
                        onChange={(e) => updateCombo(combo.id, { scheduledDate: e.target.value }).then(reload)}
                        className="text-xs border border-[#e8e0d4] rounded-lg px-2 py-1 text-[#1a1a2e] bg-white focus:outline-none focus:border-[#1a1a2e]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
