"use client";

import { useState, useEffect, useCallback, DragEvent } from "react";
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
  GripVertical,
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

const HOOK_ONLY_FORMATS = ["POV", "B-roll"];

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

type SlotType = "hook" | "body" | "cta";

const SLOT_CONFIG: { type: SlotType; label: string; color: string; icon: typeof Zap }[] = [
  { type: "hook", label: "Hook", color: "#f59e0b", icon: Zap },
  { type: "body", label: "Body", color: "#3b82f6", icon: FileText },
  { type: "cta", label: "CTA", color: "#8b5cf6", icon: Megaphone },
];

/* ── Draggable piece card ── */
function PieceCard({
  piece,
  product,
  isSelected,
  isUsed,
  onSelect,
}: {
  piece: ContentPiece;
  product?: Product;
  isSelected: boolean;
  isUsed?: boolean;
  onSelect: () => void;
}) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("piece-id", piece.id);
    e.dataTransfer.setData("piece-type", piece.type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onSelect}
      className={`rounded-xl border px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm ${
        isSelected
          ? "border-[#1a1a2e] bg-[#1a1a2e]/5 ring-1 ring-[#1a1a2e]"
          : isUsed
            ? "border-[#fbbf24] bg-[#fefce8] hover:border-[#f59e0b]"
            : "border-[#e8e0d4] bg-white hover:border-[#c8b99a]"
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className={`shrink-0 mt-0.5 ${isUsed ? "text-[#f59e0b]" : "text-[#c8b99a]"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#1a1a2e] leading-snug">
            {isUsed && <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mr-1.5 -mt-0.5 align-middle" title="Usado em combo" />}
            {piece.text}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {product && (
              <span className="text-[10px] text-[#9ca3af]">
                {product.emoji} {product.name}
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
    </div>
  );
}

/* ── Drop slot ── */
function DropSlot({
  type,
  label,
  color,
  icon: Icon,
  piece,
  product,
  onDrop,
  onClear,
}: {
  type: SlotType;
  label: string;
  color: string;
  icon: typeof Zap;
  piece?: ContentPiece | null;
  product?: Product;
  onDrop: (pieceId: string) => void;
  onClear: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    const dragType = e.dataTransfer.types.includes("piece-type") ? "ok" : "";
    if (dragType) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const pieceType = e.dataTransfer.getData("piece-type");
    const pieceId = e.dataTransfer.getData("piece-id");
    if (pieceType === type && pieceId) {
      onDrop(pieceId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-3 min-h-[80px] transition-all ${
        piece
          ? "border-solid border-[#e8e0d4] bg-white"
          : isDragOver
            ? "border-[#1a1a2e] bg-[#1a1a2e]/5"
            : "border-[#e8e0d4] bg-[#faf8f5]"
      }`}
    >
      {piece ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
            <button onClick={onClear} className="text-[#9ca3af] hover:text-[#fe2c55]">
              <X size={12} />
            </button>
          </div>
          <p className="text-[12px] text-[#1a1a2e] leading-relaxed">{piece.text}</p>
          {piece.headline && (
            <p className="text-[11px] italic text-[#b8a88a]">{piece.headline}</p>
          )}
          {piece.visualHook && (
            <p className="text-[11px] text-[#9ca3af]">{"\uD83C\uDFAC"} {piece.visualHook}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-2">
          <Icon size={16} style={{ color }} className="mb-1 opacity-50" />
          <p className="text-[11px] text-[#9ca3af]">
            {isDragOver ? `Soltar ${label} aqui` : `Arraste um ${label}`}
          </p>
          <p className="text-[10px] text-[#c8b99a]">ou clique na lista</p>
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
    // Track used pieces
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

  // Filter pieces for the builder columns
  const builderPieces = allPieces.filter((p) => {
    if (filterProduct && p.productId !== filterProduct) return false;
    return true;
  });
  const hooks = builderPieces.filter((p) => p.type === "hook");
  const bodies = builderPieces.filter((p) => p.type === "body");
  const ctas = builderPieces.filter((p) => p.type === "cta");

  // Selected pieces for the builder
  const selectedHook = selectedHookId ? getPiece(selectedHookId) : null;
  const selectedBody = selectedBodyId ? getPiece(selectedBodyId) : null;
  const selectedCta = selectedCtaId ? getPiece(selectedCtaId) : null;

  const hookIsSolo = selectedHook && HOOK_ONLY_FORMATS.includes(selectedHook.videoFormat || "");
  const canCreate = selectedHook && (hookIsSolo || (selectedBody && selectedCta));

  const handleCreate = async () => {
    if (!selectedHook) return;
    const productId = selectedHook.productId;
    await addCombo({
      productId,
      hookId: selectedHook.id,
      bodyId: hookIsSolo ? undefined : selectedBodyId!,
      ctaId: hookIsSolo ? undefined : selectedCtaId!,
      angle: selectedHook.angle,
      status: "planned",
      scheduledDate: scheduleDate || undefined,
    });
    setSelectedHookId(null);
    setSelectedBodyId(null);
    setSelectedCtaId(null);
    reload();
  };

  const handleSelect = (piece: ContentPiece) => {
    if (piece.type === "hook") setSelectedHookId(piece.id === selectedHookId ? null : piece.id);
    if (piece.type === "body") setSelectedBodyId(piece.id === selectedBodyId ? null : piece.id);
    if (piece.type === "cta") setSelectedCtaId(piece.id === selectedCtaId ? null : piece.id);
  };

  const handleSlotDrop = (type: SlotType, pieceId: string) => {
    if (type === "hook") setSelectedHookId(pieceId);
    if (type === "body") setSelectedBodyId(pieceId);
    if (type === "cta") setSelectedCtaId(pieceId);
  };

  // Agenda logic
  const agendaCombos = combos.filter((c) => c.scheduledDate === agendaDate);

  // Group agenda combos by product
  const agendaByProduct = new Map<string, VideoCombo[]>();
  for (const combo of agendaCombos) {
    const list = agendaByProduct.get(combo.productId) || [];
    list.push(combo);
    agendaByProduct.set(combo.productId, list);
  }

  // Independent piece checkboxes (local state, not tied to combo status)
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

  // All combos (for the full list section)
  const filteredCombos = comboFilterProduct
    ? combos.filter((c) => c.productId === comboFilterProduct)
    : combos;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Montar Videos</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Arraste ou clique pra montar seus combos de video
        </p>
      </div>

      {/* ══════════════ BUILDER ══════════════ */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm space-y-4">
        {/* Product filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9ca3af]">Produto:</span>
          <button
            onClick={() => setFilterProduct("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterProduct === ""
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
            }`}
          >
            Todos
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterProduct(p.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterProduct === p.id
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
              }`}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-4">
          {/* 3 columns: hooks, bodies, ctas */}
          {[
            { items: hooks, type: "hook" as SlotType, label: "Hooks", color: "#f59e0b", icon: Zap, selectedId: selectedHookId },
            { items: bodies, type: "body" as SlotType, label: "Bodies", color: "#3b82f6", icon: FileText, selectedId: selectedBodyId },
            { items: ctas, type: "cta" as SlotType, label: "CTAs", color: "#8b5cf6", icon: Megaphone, selectedId: selectedCtaId },
          ].map(({ items, type, label, color, icon: Icon, selectedId }) => (
            <div key={type} className="space-y-2">
              <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
                <Icon size={13} style={{ color }} />
                {label} ({items.length})
              </h3>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {items.map((piece) => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    product={getProduct(piece.productId)}
                    isSelected={selectedId === piece.id}
                    isUsed={usedPieceIds.has(piece.id)}
                    onSelect={() => handleSelect(piece)}
                  />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-[#9ca3af] py-6 text-center">
                    Nenhum {label.toLowerCase().slice(0, -1)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Assembly zone */}
          <div className="lg:w-[260px] space-y-3">
            <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
              <Film size={13} className="text-[#c8b99a]" />
              Montagem
            </h3>

            <div className="space-y-2">
              {SLOT_CONFIG.map(({ type, label, color, icon }) => {
                const isHookSolo = hookIsSolo && (type === "body" || type === "cta");
                if (isHookSolo) return null;
                return (
                  <DropSlot
                    key={type}
                    type={type}
                    label={label}
                    color={color}
                    icon={icon}
                    piece={type === "hook" ? selectedHook : type === "body" ? selectedBody : selectedCta}
                    product={
                      type === "hook" && selectedHook
                        ? getProduct(selectedHook.productId)
                        : undefined
                    }
                    onDrop={(id) => handleSlotDrop(type, id)}
                    onClear={() => {
                      if (type === "hook") setSelectedHookId(null);
                      if (type === "body") setSelectedBodyId(null);
                      if (type === "cta") setSelectedCtaId(null);
                    }}
                  />
                );
              })}
            </div>

            {hookIsSolo && (
              <p className="text-[11px] text-[#9ca3af] italic text-center">
                Formato {selectedHook?.videoFormat} — so hook
              </p>
            )}

            {/* Schedule date */}
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#c8b99a]" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 text-xs border border-[#e8e0d4] rounded-lg px-2 py-1.5 text-[#1a1a2e] bg-white focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-30"
            >
              <Plus size={16} />
              Criar Combo
            </button>
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
                  {/* Product header */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{product?.emoji}</span>
                    <span className="text-sm font-semibold text-[#1a1a2e]">{product?.name}</span>
                    <span className="text-[11px] text-[#9ca3af]">
                      {productCombos.length} video{productCombos.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-[#9ca3af] ml-auto">
                      {checkedCount}/{totalPieces} gravados
                    </span>
                  </div>

                  {/* Checklist sections per type */}
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
                                  <p className={`text-[13px] leading-snug ${checked ? "text-[#9ca3af] line-through" : "text-[#1a1a2e]"}`}>
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

                  {/* Combos detail */}
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
                              <p className="text-[12px]">
                                <span className="text-[#f59e0b] font-semibold">H:</span> {hook?.text || "..."}
                              </p>
                              {body && (
                                <p className="text-[12px]">
                                  <span className="text-[#3b82f6] font-semibold">B:</span> {body.text}
                                </p>
                              )}
                              {cta && (
                                <p className="text-[12px]">
                                  <span className="text-[#8b5cf6] font-semibold">C:</span> {cta.text}
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
        <h2 className="text-lg font-semibold text-[#1a1a2e]">
          Todos os Combos ({combos.length})
        </h2>

        {/* Product filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setComboFilterProduct("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              comboFilterProduct === ""
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
            }`}
          >
            Todos
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setComboFilterProduct(p.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                comboFilterProduct === p.id
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
              }`}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        {filteredCombos.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
            <p className="text-[#9ca3af] text-sm">Nenhum combo criado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCombos.map((combo) => {
              const product = products.find((p) => p.id === combo.productId);
              const angle = ANGLES.find((a) => a.id === combo.angle);
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
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#FAF7F2] px-2 py-1 text-xs font-medium text-[#1a1a2e]">
                        {product?.emoji} {product?.name}
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
                      <div className="rounded-lg bg-[#faf8f5] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#f59e0b]">H</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed">{hook.text}</p>
                        {hook.headline && <p className="text-[11px] italic text-[#b8a88a]">{hook.headline}</p>}
                        {hook.visualHook && <p className="text-[11px] text-[#9ca3af]">{"\uD83C\uDFAC"} {hook.visualHook}</p>}
                      </div>
                    )}
                    {body && (
                      <div className="rounded-lg bg-[#faf8f5] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#3b82f6]">B</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed">{body.text}</p>
                      </div>
                    )}
                    {cta && (
                      <div className="rounded-lg bg-[#faf8f5] px-3 py-2 space-y-1">
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#8b5cf6]">C</span>
                        <p className="text-[12px] text-[#1a1a2e] leading-relaxed">{cta.text}</p>
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
