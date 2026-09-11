"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
  Film,
} from "lucide-react";
import {
  getHooks,
  getBodies,
  getCTAs,
  getAllPieces,
  getProducts,
  addPiece,
  updatePiece,
  deletePiece,
} from "@/lib/store";
import { ANGLES } from "@/lib/angles";
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

const STATUS_CYCLE: StatusType[] = ["draft", "ready", "filmed", "posted"];

const TAB_CONFIG: { type: TabType; label: string; icon: typeof Zap }[] = [
  { type: "hook", label: "Hooks", icon: Zap },
  { type: "body", label: "Bodies", icon: FileText },
  { type: "cta", label: "CTAs", icon: Megaphone },
];

function VisualHookPreview({ visualHook }: { visualHook: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = visualHook.length > 80;
  const summary = isLong ? visualHook.split(/\.\s/)[0] + "." : visualHook;

  return (
    <div
      className={`px-3 py-2 bg-[#faf8f5] border-t border-[#f0ebe3] ${isLong ? "cursor-pointer" : ""}`}
      onClick={() => isLong && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-1.5">
        <Video size={11} className="text-[#b8a88a] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#9ca3af] leading-snug flex-1">
          {expanded ? visualHook : summary}
        </p>
        {isLong && (
          <span className="text-[10px] text-[#c8b99a] shrink-0 mt-0.5">
            {expanded ? "−" : "+"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ConteudoPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-[#9ca3af]">Carregando...</div>}>
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
  const [selectedAngles, setSelectedAngles] = useState<Angle[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | "all">("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formProduct, setFormProduct] = useState("");
  const [formAngle, setFormAngle] = useState<Angle>("estetica");
  const [formText, setFormText] = useState("");
  const [formVisualHook, setFormVisualHook] = useState("");

  const reload = useCallback(async () => {
    setProducts(await getProducts());
    setPieces(await getAllPieces());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Filter pieces
  const filtered = pieces.filter((p) => {
    if (p.type !== activeTab) return false;
    if (selectedProducts.length > 0 && !selectedProducts.includes(p.productId))
      return false;
    if (selectedAngles.length > 0 && !selectedAngles.includes(p.angle))
      return false;
    if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
    if (selectedFormat !== "all" && p.videoFormat !== selectedFormat) return false;
    return true;
  });

  const VIDEO_FORMATS = ["Review falado", "POV", "B-roll", "Teste ao vivo", "Unboxing", "Comparação", "Demonstração"];

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleAngle = (angle: Angle) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const changeStatus = async (piece: ContentPiece, newStatus: StatusType) => {
    if (newStatus === piece.status) return;
    await updatePiece(piece.id, { status: newStatus });
    reload();
  };

  const handleSubmit = async () => {
    if (!formProduct || !formText.trim()) return;

    if (editingId) {
      await updatePiece(editingId, {
        productId: formProduct,
        angle: formAngle,
        text: formText.trim(),
        visualHook: activeTab === "hook" ? formVisualHook.trim() || undefined : undefined,
      });
    } else {
      await addPiece({
        productId: formProduct,
        type: activeTab,
        angle: formAngle,
        text: formText.trim(),
        visualHook: activeTab === "hook" ? formVisualHook.trim() || undefined : undefined,
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
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Conteúdo</h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Gerencie hooks, bodies e CTAs de todos os produtos
          </p>
        </div>
        <button
          onClick={() => {
            setFormProduct(products[0]?.id || "");
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo {activeTab === "hook" ? "Hook" : activeTab === "body" ? "Body" : "CTA"}
        </button>
      </div>

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
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 space-y-3">
        {/* Product filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider w-16 shrink-0">
            Produto
          </span>
          <button
            onClick={() => setSelectedProducts([])}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedProducts.length === 0
                ? "bg-[#1a1a2e] text-white"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            Todos
          </button>
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                selectedProducts.includes(product.id)
                  ? "bg-[#f5f0ea] border-[#c8b99a] text-[#1a1a2e]"
                  : "border-transparent text-[#9ca3af] hover:text-[#6b7280]"
              }`}
            >
              {product.emoji} {product.name}
            </button>
          ))}
        </div>

        <div className="border-t border-[#f0ebe3]" />

        {/* Angle filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider w-16 shrink-0">
            Ângulo
          </span>
          <button
            onClick={() => setSelectedAngles([])}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedAngles.length === 0
                ? "bg-[#1a1a2e] text-white"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            Todos
          </button>
          {ANGLES.map((angle) => (
            <button
              key={angle.id}
              onClick={() => toggleAngle(angle.id)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-all border"
              style={
                selectedAngles.includes(angle.id)
                  ? { backgroundColor: angle.color + "18", borderColor: angle.color + "50", color: angle.color }
                  : { borderColor: "transparent", color: "#9ca3af" }
              }
            >
              {angle.emoji} {angle.label}
            </button>
          ))}
        </div>

        <div className="border-t border-[#f0ebe3]" />

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider w-16 shrink-0">
            Status
          </span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedStatus === "all"
                ? "bg-[#1a1a2e] text-white"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            Todos
          </button>
          {STATUS_CYCLE.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedStatus === s
                  ? STATUS_COLORS[s]
                  : "text-[#9ca3af] hover:text-[#6b7280]"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {activeTab === "hook" && (
          <>
            <div className="border-t border-[#f0ebe3]" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider w-16 shrink-0">
                Formato
              </span>
              <button
                onClick={() => setSelectedFormat("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedFormat === "all"
                    ? "bg-[#1a1a2e] text-white"
                    : "text-[#9ca3af] hover:text-[#6b7280]"
                }`}
              >
                Todos
              </button>
              {VIDEO_FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedFormat === f
                      ? "bg-[#f5f0ea] text-[#1a1a2e] border border-[#c8b99a]"
                      : "text-[#9ca3af] hover:text-[#6b7280]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9ca3af]">{filtered.length} itens</p>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a1a2e]">
              {editingId ? "Editar" : "Adicionar"}{" "}
              {activeTab === "hook" ? "Hook" : activeTab === "body" ? "Body" : "CTA"}
            </h3>
            <button onClick={resetForm} className="text-[#9ca3af] hover:text-[#1a1a2e]">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Produto
              </label>
              <select
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              >
                <option value="">Selecionar...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Ângulo
              </label>
              <select
                value={formAngle}
                onChange={(e) => setFormAngle(e.target.value as Angle)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              >
                {ANGLES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.label}
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
              rows={3}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] resize-none"
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
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Visual Hook (opcional)
              </label>
              <input
                value={formVisualHook}
                onChange={(e) => setFormVisualHook(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                placeholder="Descreva o visual hook..."
              />
            </div>
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

      {/* Content Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 text-center">
          <p className="text-[#9ca3af] text-sm">
            Nenhum conteúdo encontrado com os filtros atuais
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((piece) => {
            const angle = ANGLES.find((a) => a.id === piece.angle);
            const product = getProduct(piece.productId);

            return (
              <div
                key={piece.id}
                className="rounded-xl bg-white border border-[#e8e0d4] hover:border-[#c8b99a] transition-all group overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0ebe3]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                      style={{ backgroundColor: angle?.color + "15", color: angle?.color }}
                    >
                      {angle?.emoji} {angle?.label}
                    </span>
                    {piece.videoFormat && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f0ea] px-2 py-0.5 text-[10px] text-[#9ca3af] shrink-0">
                        <Film size={9} />
                        {piece.videoFormat}
                      </span>
                    )}
                    <select
                      value={piece.status}
                      onChange={(e) => changeStatus(piece, e.target.value as StatusType)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 appearance-none cursor-pointer pr-4 ${STATUS_COLORS[piece.status]}`}
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center" }}
                    >
                      {STATUS_CYCLE.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(piece)}
                      className="rounded p-1 text-[#c8b99a] hover:text-[#1a1a2e]"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(piece.id)}
                      className="rounded p-1 text-[#c8b99a] hover:text-[#fe2c55]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Headline (texto na tela) */}
                {piece.headline && (
                  <div className="px-3 pt-2.5 pb-0.5">
                    <p className="text-[12px] font-semibold text-[#b8a88a] italic">
                      {piece.headline}
                    </p>
                  </div>
                )}

                {/* Fala */}
                <div className="px-3 py-2 flex-1">
                  <p className="text-[13px] text-[#1a1a2e] leading-snug">
                    &ldquo;{piece.text}&rdquo;
                  </p>
                </div>

                {/* Take Visual */}
                {piece.visualHook && (
                  <VisualHookPreview visualHook={piece.visualHook} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
