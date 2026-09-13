"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  FileText,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  X,
  Video,
  ChevronDown,
  Filter,
  Check,
  CheckSquare,
  Square,
  Minus,
  Scissors,
} from "lucide-react";
import {
  getHooks,
  getBodies,
  getCTAs,
  getAllPieces,
  getProducts,
  getCombos,
  addPiece,
  updatePiece,
  deletePiece,
} from "@/lib/store";
import type { Angle, ContentPiece, Product } from "@/lib/types";

type TabType = "hook" | "body" | "cta";
type StatusType = ContentPiece["status"];

const STATUS_LABELS: Record<StatusType, string> = {
  draft: "Rascunho",
  ready: "Pronto",
  filmed: "Gravado",
  posted: "Usado",
};

const STATUS_COLORS: Record<StatusType, string> = {
  draft: "bg-[#d1d5db] text-[#4b5563]",
  ready: "bg-[#dbeafe] text-[#2563eb]",
  filmed: "bg-[#dcfce7] text-[#16a34a]",
  posted: "bg-[#ede9fe] text-[#7c3aed]",
};

const STATUS_DOT: Record<StatusType, string> = {
  draft: "bg-[#9ca3af]",
  ready: "bg-[#2563eb]",
  filmed: "bg-[#16a34a]",
  posted: "bg-[#7c3aed]",
};

const STATUS_CYCLE: StatusType[] = ["draft", "ready", "filmed", "posted"];

const TAB_CONFIG: { type: TabType; label: string; icon: typeof Zap }[] = [
  { type: "hook", label: "Hooks", icon: Zap },
  { type: "body", label: "Bodies", icon: FileText },
  { type: "cta", label: "CTAs", icon: Megaphone },
];

const VIDEO_FORMATS = [
  "Review falado",
  "POV",
  "B-roll",
  "Teste ao vivo",
  "Unboxing",
  "Comparacao",
  "Demonstracao",
];

/* ── Product select with images ── */
function ProductSelectForm({
  products,
  value,
  onChange,
  placeholder = "Selecionar...",
  className = "",
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-left hover:border-[#c8b99a] transition-colors"
      >
        {selected ? (
          <>
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.name} className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <span>{selected.emoji}</span>
            )}
            <span className="flex-1 text-[#1a1a2e]">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-[#9ca3af]">{placeholder}</span>
        )}
        <ChevronDown size={14} className={`text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#e8e0d4] bg-white shadow-lg py-1 max-h-60 overflow-y-auto">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#faf8f5] transition-colors ${value === p.id ? "font-semibold text-[#1a1a2e] bg-[#faf8f5]" : "text-[#6b7280]"}`}
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                <span>{p.emoji}</span>
              )}
              {p.name}
              {value === p.id && <Check size={14} className="ml-auto text-[#1a1a2e]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Dropdown filter component ── */
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  renderOption,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  renderOption?: (value: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const count = selected.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
          count > 0
            ? "bg-[#f5f0ea] border-[#c8b99a] text-[#1a1a2e]"
            : "border-[#e8e0d4] text-[#9ca3af] hover:text-[#6b7280] hover:border-[#c8b99a]"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="rounded-full bg-[#1a1a2e] text-white text-[10px] w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 min-w-[180px] rounded-xl bg-white border border-[#e8e0d4] shadow-lg py-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#faf8f5] transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#1a1a2e] border-[#1a1a2e]"
                      : "border-[#d1d5db]"
                  }`}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </span>
                <span className={`flex-1 ${isSelected ? "text-[#1a1a2e] font-medium" : "text-[#6b7280]"}`}>
                  {renderOption ? renderOption(opt) : opt}
                </span>
              </button>
            );
          })}
          {count > 0 && (
            <>
              <div className="border-t border-[#f0ebe3] my-1" />
              <button
                onClick={() => {
                  selected.forEach((s) => onToggle(s));
                }}
                className="w-full px-3 py-1.5 text-[11px] text-[#9ca3af] hover:text-[#1a1a2e] text-left"
              >
                Limpar filtro
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConteudoPageWrapper() {
  return (
    <Suspense
      fallback={<div className="p-8 text-[#9ca3af]">Carregando...</div>}
    >
      <ConteudoPage />
    </Suspense>
  );
}

function ConteudoPage() {
  const searchParams = useSearchParams();
  const initialProduct = searchParams.get("produto");

  const [activeTab, setActiveTab] = useState<TabType>("hook");
  const [products, setProducts] = useState<Product[]>([]);
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialProduct ? [initialProduct] : []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<StatusType[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formProduct, setFormProduct] = useState("");
  const [formAngle, setFormAngle] = useState<Angle>("estetica");
  const [formText, setFormText] = useState("");
  const [formVisualHook, setFormVisualHook] = useState("");
  const [formHeadline, setFormHeadline] = useState("");
  const [formVideoFormat, setFormVideoFormat] = useState("");

  const [usedPieceIds, setUsedPieceIds] = useState<Set<string>>(new Set());

  // Full copy paste mode
  const [showFullCopy, setShowFullCopy] = useState(false);
  const [fullCopyRaw, setFullCopyRaw] = useState("");
  const [splitHook, setSplitHook] = useState("");
  const [splitBody, setSplitBody] = useState("");
  const [splitCta, setSplitCta] = useState("");
  const [fullCopyProduct, setFullCopyProduct] = useState("");
  const [fullCopyFormat, setFullCopyFormat] = useState("");

  const autoSplitCopy = (text: string) => {
    setFullCopyRaw(text);
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) {
      setSplitHook("");
      setSplitBody("");
      setSplitCta("");
    } else if (paragraphs.length === 1) {
      setSplitHook(paragraphs[0]);
      setSplitBody("");
      setSplitCta("");
    } else if (paragraphs.length === 2) {
      setSplitHook(paragraphs[0]);
      setSplitBody("");
      setSplitCta(paragraphs[1]);
    } else {
      setSplitHook(paragraphs[0]);
      setSplitBody(paragraphs.slice(1, -1).join("\n\n"));
      setSplitCta(paragraphs[paragraphs.length - 1]);
    }
  };

  const handleFullCopySubmit = async () => {
    if (!fullCopyProduct) return;
    const promises: Promise<unknown>[] = [];
    if (splitHook.trim()) {
      promises.push(addPiece({
        productId: fullCopyProduct,
        type: "hook",
        angle: "estetica" as Angle,
        text: splitHook.trim(),
        videoFormat: fullCopyFormat || undefined,
        status: "draft",
      }));
    }
    if (splitBody.trim()) {
      promises.push(addPiece({
        productId: fullCopyProduct,
        type: "body",
        angle: "estetica" as Angle,
        text: splitBody.trim(),
        videoFormat: fullCopyFormat || undefined,
        status: "draft",
      }));
    }
    if (splitCta.trim()) {
      promises.push(addPiece({
        productId: fullCopyProduct,
        type: "cta",
        angle: "estetica" as Angle,
        text: splitCta.trim(),
        videoFormat: fullCopyFormat || undefined,
        status: "draft",
      }));
    }
    await Promise.all(promises);
    setShowFullCopy(false);
    setFullCopyRaw("");
    setSplitHook("");
    setSplitBody("");
    setSplitCta("");
    reload();
  };

  const reload = useCallback(async () => {
    const [prods, allP, combos] = await Promise.all([
      getProducts(),
      getAllPieces(),
      getCombos(),
    ]);
    setProducts(prods);
    setPieces(allP);
    // Track which pieces are used in combos
    const used = new Set<string>();
    for (const c of combos) {
      used.add(c.hookId);
      if (c.bodyId) used.add(c.bodyId);
      if (c.ctaId) used.add(c.ctaId);
    }
    setUsedPieceIds(used);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Filter pieces
  const filtered = pieces.filter((p) => {
    if (p.type !== activeTab) return false;
    if (selectedProducts.length > 0 && !selectedProducts.includes(p.productId))
      return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(p.status))
      return false;
    if (selectedFormats.length > 0 && (!p.videoFormat || !selectedFormats.includes(p.videoFormat)))
      return false;
    return true;
  });

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleStatus = (s: StatusType) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleFormat = (f: string) => {
    setSelectedFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const changeStatus = async (piece: ContentPiece, newStatus: StatusType) => {
    if (newStatus === piece.status) return;
    await updatePiece(piece.id, { status: newStatus });
    reload();
  };

  const changeProduct = async (piece: ContentPiece, newProductId: string) => {
    if (newProductId === piece.productId) return;
    await updatePiece(piece.id, { productId: newProductId });
    reload();
  };

  const changeFormat = async (piece: ContentPiece, newFormat: string) => {
    if (newFormat === (piece.videoFormat || "")) return;
    await updatePiece(piece.id, { videoFormat: newFormat || undefined });
    reload();
  };

  // Bulk selection
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredChecked =
    filtered.length > 0 && filtered.every((p) => checkedIds.has(p.id));
  const someFilteredChecked =
    filtered.some((p) => checkedIds.has(p.id)) && !allFilteredChecked;

  const toggleAll = () => {
    if (allFilteredChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const getCheckedIds = () =>
    filtered.filter((p) => checkedIds.has(p.id)).map((p) => p.id);

  const bulkChangeStatus = async (newStatus: StatusType) => {
    await Promise.all(getCheckedIds().map((id) => updatePiece(id, { status: newStatus })));
    setCheckedIds(new Set());
    reload();
  };

  const bulkChangeProduct = async (newProductId: string) => {
    await Promise.all(getCheckedIds().map((id) => updatePiece(id, { productId: newProductId })));
    setCheckedIds(new Set());
    reload();
  };

  const bulkChangeFormat = async (newFormat: string) => {
    await Promise.all(
      getCheckedIds().map((id) =>
        updatePiece(id, { videoFormat: newFormat || undefined })
      )
    );
    setCheckedIds(new Set());
    reload();
  };

  const checkedCount = filtered.filter((p) => checkedIds.has(p.id)).length;

  const handleSubmit = async () => {
    if (!formProduct || !formText.trim()) return;

    if (editingId) {
      await updatePiece(editingId, {
        productId: formProduct,
        angle: formAngle,
        text: formText.trim(),
        visualHook:
          activeTab === "hook" ? formVisualHook.trim() || undefined : undefined,
        headline:
          activeTab === "hook" ? formHeadline.trim() || undefined : undefined,
        videoFormat: formVideoFormat || undefined,
      });
    } else {
      await addPiece({
        productId: formProduct,
        type: activeTab,
        angle: formAngle,
        text: formText.trim(),
        visualHook:
          activeTab === "hook" ? formVisualHook.trim() || undefined : undefined,
        headline:
          activeTab === "hook" ? formHeadline.trim() || undefined : undefined,
        videoFormat: formVideoFormat || undefined,
        status: "draft",
      });
    }

    resetForm();
    reload();
  };

  const startEdit = (piece: ContentPiece) => {
    setEditingId(piece.id);
    setFormProduct(piece.productId);
    setFormAngle(piece.angle);
    setFormText(piece.text);
    setFormVisualHook(piece.visualHook || "");
    setFormHeadline(piece.headline || "");
    setFormVideoFormat(piece.videoFormat || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deletePiece(id);
    reload();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormProduct(products[0]?.id || "");
    setFormAngle("estetica");
    setFormText("");
    setFormVisualHook("");
    setFormHeadline("");
    setFormVideoFormat("");
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  // Stable numbering per product+type (not affected by filters)
  const pieceNumberMap = (() => {
    const map = new Map<string, string>();
    const counters = new Map<string, number>(); // key: "productId-type"
    const prefix = (type: string) => type === "hook" ? "H" : type === "body" ? "B" : "C";
    for (const p of pieces) {
      const key = `${p.productId}-${p.type}`;
      const n = (counters.get(key) || 0) + 1;
      counters.set(key, n);
      map.set(p.id, `${prefix(p.type)}${n}`);
    }
    return map;
  })();
  const pieceLabel = (id: string) => pieceNumberMap.get(id) || "";

  const hasActiveFilters =
    selectedProducts.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedFormats.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Conteudo</h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Gerencie hooks, bodies e CTAs de todos os produtos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFullCopyProduct(products[0]?.id || "");
              setFullCopyFormat("");
              setShowFullCopy(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#e8e0d4] text-[#1a1a2e] px-4 py-2.5 text-sm font-medium hover:bg-[#f5f0ea] transition-colors"
          >
            <Scissors size={16} />
            Colar copy completa
          </button>
          <button
            onClick={() => {
              setFormProduct(products[0]?.id || "");
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Novo{" "}
            {activeTab === "hook" ? "Hook" : activeTab === "body" ? "Body" : "CTA"}
          </button>
        </div>
      </div>

      {/* Full copy paste panel */}
      {showFullCopy && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <Scissors size={16} className="text-[#c8b99a]" />
              Colar copy completa
            </h3>
            <button onClick={() => setShowFullCopy(false)} className="text-[#9ca3af] hover:text-[#1a1a2e]">
              <X size={18} />
            </button>
          </div>

          <p className="text-[11px] text-[#9ca3af]">
            Cole o texto completo do video. Separe hook, body e CTA com uma linha em branco entre eles.
          </p>

          {/* Product + Format */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">Produto</label>
              <ProductSelectForm products={products} value={fullCopyProduct} onChange={setFullCopyProduct} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">Formato</label>
              <select
                value={fullCopyFormat}
                onChange={(e) => setFullCopyFormat(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              >
                <option value="">Selecionar...</option>
                {VIDEO_FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Raw paste area */}
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">Texto completo</label>
            <textarea
              value={fullCopyRaw}
              onChange={(e) => autoSplitCopy(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] resize-y"
              placeholder={"Cole aqui o texto completo...\n\nPrimeiro paragrafo vira o Hook\n\nParagrafos do meio viram o Body\n\nUltimo paragrafo vira o CTA"}
            />
          </div>

          {/* Split preview */}
          {(splitHook || splitBody || splitCta) && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Preview da separacao</p>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1">
                  <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#f59e0b]">H</span>
                  <span className="text-[#9ca3af]">Hook</span>
                </label>
                <textarea
                  value={splitHook}
                  onChange={(e) => setSplitHook(e.target.value)}
                  rows={Math.max(2, splitHook.split("\n").length)}
                  className="w-full rounded-lg border border-[#f59e0b]/30 bg-[#fffbeb] px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#f59e0b] resize-y"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1">
                  <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#3b82f6]">B</span>
                  <span className="text-[#9ca3af]">Body</span>
                </label>
                <textarea
                  value={splitBody}
                  onChange={(e) => setSplitBody(e.target.value)}
                  rows={Math.max(3, splitBody.split("\n").length)}
                  className="w-full rounded-lg border border-[#3b82f6]/30 bg-[#eff6ff] px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#3b82f6] resize-y"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1">
                  <span className="text-[10px] font-bold rounded px-1.5 py-0.5 text-white bg-[#8b5cf6]">C</span>
                  <span className="text-[#9ca3af]">CTA</span>
                </label>
                <textarea
                  value={splitCta}
                  onChange={(e) => setSplitCta(e.target.value)}
                  rows={Math.max(2, splitCta.split("\n").length)}
                  className="w-full rounded-lg border border-[#8b5cf6]/30 bg-[#f5f3ff] px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#8b5cf6] resize-y"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleFullCopySubmit}
            disabled={!fullCopyProduct || (!splitHook.trim() && !splitBody.trim() && !splitCta.trim())}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-30"
          >
            <Plus size={16} />
            Criar {[splitHook, splitBody, splitCta].filter((s) => s.trim()).length} peca{[splitHook, splitBody, splitCta].filter((s) => s.trim()).length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[#f5f0ea]/60 border border-[#e8e0d4] p-1">
        {TAB_CONFIG.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === type
                ? "bg-white text-[#1a1a2e] shadow-sm"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-[#c8b99a]" />

        <FilterDropdown
          label="Produto"
          options={products.map((p) => p.id)}
          selected={selectedProducts}
          onToggle={toggleProduct}
          renderOption={(id) => {
            const p = getProduct(id);
            if (!p) return id;
            return (
              <span className="inline-flex items-center gap-1.5">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-5 h-5 rounded object-cover" />
                ) : (
                  p.emoji
                )}
                {p.name}
              </span>
            );
          }}
        />

        <FilterDropdown
          label="Status"
          options={STATUS_CYCLE as unknown as string[]}
          selected={selectedStatuses as string[]}
          onToggle={(s) => toggleStatus(s as StatusType)}
          renderOption={(s) => (
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s as StatusType]}`} />
              {STATUS_LABELS[s as StatusType]}
            </span>
          )}
        />

        <FilterDropdown
          label="Formato"
          options={VIDEO_FORMATS}
          selected={selectedFormats}
          onToggle={toggleFormat}
        />

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedProducts([]);
              setSelectedStatuses([]);
              setSelectedFormats([]);
            }}
            className="text-[11px] text-[#9ca3af] hover:text-[#1a1a2e] ml-1"
          >
            Limpar tudo
          </button>
        )}

        <span className="text-xs text-[#9ca3af] ml-auto">
          {filtered.length} itens
        </span>
      </div>

      {/* Add Form (only for new, not edit) */}
      {showForm && !editingId && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a1a2e]">
              {editingId ? "Editar" : "Adicionar"}{" "}
              {activeTab === "hook"
                ? "Hook"
                : activeTab === "body"
                  ? "Body"
                  : "CTA"}
            </h3>
            <button
              onClick={resetForm}
              className="text-[#9ca3af] hover:text-[#1a1a2e]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Produto
              </label>
              <ProductSelectForm products={products} value={formProduct} onChange={setFormProduct} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Formato do video
              </label>
              <select
                value={formVideoFormat}
                onChange={(e) => setFormVideoFormat(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              >
                <option value="">Selecionar...</option>
                {VIDEO_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              Texto
            </label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              rows={Math.max(activeTab === "body" ? 6 : 3, formText.split("\n").length + 1)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] resize-y"
              placeholder={
                activeTab === "hook"
                  ? "Digite o texto do hook..."
                  : activeTab === "body"
                    ? "Digite o texto do body..."
                    : "Digite o texto do CTA..."
              }
            />
          </div>

          {activeTab === "hook" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Headline (texto na tela)
                </label>
                <input
                  value={formHeadline}
                  onChange={(e) => setFormHeadline(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                  placeholder="Frase curta pra tela do video"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Take visual (opcional)
                </label>
                <input
                  value={formVisualHook}
                  onChange={(e) => setFormVisualHook(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                  placeholder="Como gravar esse video..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6b7280] hover:bg-[#f5f0ea] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formProduct || !formText.trim()}
              className="rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-40"
            >
              {editingId ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {checkedCount > 0 && (
        <div className="rounded-xl bg-[#1a1a2e] text-white px-4 py-3 shadow-lg space-y-2.5">
          <div className="flex items-center gap-3">
            <CheckSquare size={16} />
            <span className="text-sm font-medium">
              {checkedCount} {checkedCount === 1 ? "selecionado" : "selecionados"}
            </span>
            <button
              onClick={() => setCheckedIds(new Set())}
              className="ml-auto text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk status */}
            <span className="text-[11px] text-white/50 mr-1">Status:</span>
            {STATUS_CYCLE.map((s) => (
              <button
                key={s}
                onClick={() => bulkChangeStatus(s)}
                className="rounded-full px-3 py-1 text-[11px] font-semibold transition-all hover:scale-105 bg-white/10 hover:bg-white/20"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                  {STATUS_LABELS[s]}
                </span>
              </button>
            ))}

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* Bulk product */}
            <span className="text-[11px] text-white/50 mr-1">Produto:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) bulkChangeProduct(e.target.value);
                e.target.value = "";
              }}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-3 py-1 appearance-none cursor-pointer pr-5"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 6px center",
              }}
            >
              <option value="" disabled>Escolher...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="text-[#1a1a2e]">
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* Bulk format */}
            <span className="text-[11px] text-white/50 mr-1">Formato:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) bulkChangeFormat(e.target.value === "__none__" ? "" : e.target.value);
                e.target.value = "";
              }}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-3 py-1 appearance-none cursor-pointer pr-5"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 6px center",
              }}
            >
              <option value="" disabled>Escolher...</option>
              <option value="__none__" className="text-[#1a1a2e]">Sem formato</option>
              {VIDEO_FORMATS.map((f) => (
                <option key={f} value={f} className="text-[#1a1a2e]">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 text-center">
          <p className="text-[#9ca3af] text-sm">
            Nenhum conteudo encontrado com os filtros atuais
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAll}
              className="text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
            >
              {allFilteredChecked ? (
                <CheckSquare size={15} />
              ) : someFilteredChecked ? (
                <Minus size={15} className="border border-current rounded-[3px]" />
              ) : (
                <Square size={15} />
              )}
            </button>
            <span className="text-[11px] text-[#9ca3af] font-medium">
              {allFilteredChecked
                ? "Desmarcar todos"
                : `Selecionar todos (${filtered.length})`}
            </span>
          </div>

          {/* List */}
          <div className="rounded-2xl bg-white border border-[#e8e0d4] overflow-hidden">
            {filtered.map((piece, idx) => {
              const product = getProduct(piece.productId);
              const isChecked = checkedIds.has(piece.id);
              const isExpanded = expandedId === piece.id;
              const isUsed = usedPieceIds.has(piece.id);

              return (
                <div key={piece.id} className="group">
                  {/* Row — só texto */}
                  <div
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#faf8f5] ${
                      idx > 0 ? "border-t border-[#f0ebe3]" : ""
                    } ${isChecked ? "bg-[#f5f0ea]/50" : ""} ${isUsed && !isChecked ? "bg-[#fefce8]/60" : ""}`}
                    onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(piece.id);
                      }}
                      className="shrink-0 mt-0.5 text-[#c8b99a] hover:text-[#1a1a2e] transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare size={14} className="text-[#1a1a2e]" />
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                    <span className="text-[11px] font-bold text-[#c8b99a] shrink-0 mt-0.5 w-8 text-right">
                      {pieceLabel(piece.id)}
                    </span>
                    <p className="text-[13px] text-[#1a1a2e] leading-snug flex-1 whitespace-pre-wrap">
                      {isUsed && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mr-1.5 -mt-0.5 align-middle" title="Usado em combo" />
                      )}
                      {piece.text}
                    </p>
                    <select
                      value={piece.videoFormat || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        changeFormat(piece, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full bg-[#f5f0ea] px-2 py-0.5 text-[10px] text-[#6b7280] appearance-none cursor-pointer pr-4 shrink-0"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 4px center",
                      }}
                    >
                      <option value="">Formato</option>
                      {VIDEO_FORMATS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {piece.referenceUrl && (
                      <a
                        href={piece.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded p-1 text-[#3b82f6] hover:bg-[#eff6ff] shrink-0"
                        title="Ver referência no Drive"
                      >
                        <Video size={12} />
                      </a>
                    )}
                    <select
                      value={piece.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        changeStatus(piece, e.target.value as StatusType);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold appearance-none cursor-pointer pr-4 shrink-0 ${STATUS_COLORS[piece.status]}`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 4px center",
                      }}
                    >
                      {STATUS_CYCLE.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(piece);
                      }}
                      className="rounded p-1 text-[#c8b99a] hover:text-[#1a1a2e] hover:bg-[#f5f0ea] shrink-0"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(piece.id);
                      }}
                      className="rounded p-1 text-[#c8b99a] hover:text-[#fe2c55] hover:bg-[#fff5f5] shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Expanded — detalhes */}
                  {isExpanded && editingId !== piece.id && (
                    <div className="px-4 pb-3 bg-[#faf8f5] border-t border-[#f0ebe3] space-y-2" style={{ paddingLeft: "calc(1rem + 26px)" }}>
                      {(piece.headline || piece.visualHook) && (
                        <div className="space-y-1.5 pt-2">
                          {piece.headline && (
                            <p className="text-[12px] italic text-[#b8a88a]">
                              <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mr-2">Headline</span>
                              {piece.headline}
                            </p>
                          )}
                          {piece.visualHook && (
                            <p className="text-[12px] text-[#6b7280] leading-snug">
                              <Video size={10} className="inline mr-1 text-[#9ca3af]" />
                              {piece.visualHook}
                            </p>
                          )}
                        </div>
                      )}
                      {product && (
                        <p className="inline-flex items-center gap-1 text-[11px] text-[#9ca3af] pt-1">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-4 h-4 rounded object-cover" />
                          ) : (
                            product.emoji
                          )}
                          {product.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Inline edit form */}
                  {editingId === piece.id && (
                    <div className="px-4 py-3 bg-[#faf8f5] border-t border-[#f0ebe3] space-y-3" style={{ paddingLeft: "calc(1rem + 26px)" }}>
                      <textarea
                        value={formText}
                        onChange={(e) => setFormText(e.target.value)}
                        rows={Math.max(5, formText.split("\n").length + 2)}
                        className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] resize-y"
                      />
                      {activeTab === "hook" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={formHeadline}
                            onChange={(e) => setFormHeadline(e.target.value)}
                            className="rounded-xl border border-[#e8e0d4] px-3 py-2 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                            placeholder="Headline (texto na tela)"
                          />
                          <input
                            value={formVisualHook}
                            onChange={(e) => setFormVisualHook(e.target.value)}
                            className="rounded-xl border border-[#e8e0d4] px-3 py-2 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                            placeholder="Take visual"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <ProductSelectForm
                          products={products}
                          value={formProduct}
                          onChange={setFormProduct}
                          className="min-w-[140px]"
                        />
                        <select
                          value={formVideoFormat}
                          onChange={(e) => setFormVideoFormat(e.target.value)}
                          className="rounded-full bg-white border border-[#e8e0d4] px-2.5 py-1 text-[11px] text-[#6b7280]"
                        >
                          <option value="">Formato</option>
                          {VIDEO_FORMATS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={resetForm}
                            className="rounded-lg px-3 py-1.5 text-xs text-[#6b7280] hover:bg-white transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={!formProduct || !formText.trim()}
                            className="rounded-lg bg-[#1a1a2e] text-white px-3 py-1.5 text-xs font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-40"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
