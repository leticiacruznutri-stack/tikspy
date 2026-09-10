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
  draft: "bg-[#9ca3af]",
  ready: "bg-[#3b82f6]",
  filmed: "bg-[#22c55e]",
  posted: "bg-[#8b5cf6]",
};

const STATUS_CYCLE: StatusType[] = ["draft", "ready", "filmed", "posted"];

const TAB_CONFIG: { type: TabType; label: string; icon: typeof Zap }[] = [
  { type: "hook", label: "Hooks", icon: Zap },
  { type: "body", label: "Bodies", icon: FileText },
  { type: "cta", label: "CTAs", icon: Megaphone },
];

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formProduct, setFormProduct] = useState("");
  const [formAngle, setFormAngle] = useState<Angle>("nao-vaza");
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
    return true;
  });

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

  const cycleStatus = async (piece: ContentPiece) => {
    const currentIdx = STATUS_CYCLE.indexOf(piece.status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await updatePiece(piece.id, { status: nextStatus });
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
    setFormAngle("nao-vaza");
    setFormText("");
    setFormVisualHook("");
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Conteudo</h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Gerencie hooks, bodies e CTAs de todos os produtos
          </p>
        </div>
        <button
          onClick={() => {
            setFormProduct(products[0]?.id || "");
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-[#e8e0d4] p-1 shadow-sm">
        {TAB_CONFIG.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === type
                ? "bg-[#1a1a2e] text-white"
                : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Product filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
            Produto:
          </span>
          <button
            onClick={() => setSelectedProducts([])}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedProducts.length === 0
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
            }`}
          >
            Todos
          </button>
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedProducts.includes(product.id)
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
              }`}
            >
              {product.emoji} {product.name}
            </button>
          ))}
        </div>

        {/* Angle filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
            Angulo:
          </span>
          <button
            onClick={() => setSelectedAngles([])}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedAngles.length === 0
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
            }`}
          >
            Todos
          </button>
          {ANGLES.map((angle) => (
            <button
              key={angle.id}
              onClick={() => toggleAngle(angle.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                selectedAngles.includes(angle.id)
                  ? "text-white"
                  : "bg-white text-[#6b7280] hover:bg-[#f5f0ea]"
              }`}
              style={
                selectedAngles.includes(angle.id)
                  ? { backgroundColor: angle.color, borderColor: angle.color }
                  : { borderColor: "#e8e0d4" }
              }
            >
              {angle.emoji} {angle.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
            Status:
          </span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedStatus === "all"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
            }`}
          >
            Todos
          </button>
          {STATUS_CYCLE.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatus === s
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-[#9ca3af]">{filtered.length} itens</p>

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
                Angulo
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
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
          <p className="text-[#9ca3af] text-sm">
            Nenhum conteudo encontrado com os filtros atuais
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((piece) => {
            const product = getProduct(piece.productId);
            const angle = ANGLES.find((a) => a.id === piece.angle);

            return (
              <div
                key={piece.id}
                className="rounded-2xl bg-white border border-[#e8e0d4] p-4 shadow-sm hover:bg-[#f5f0ea]/50 transition-colors group"
              >
                {/* Top row: product + angle badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#FAF7F2] px-2 py-1 text-xs font-medium text-[#1a1a2e]">
                    {product?.emoji} {product?.name}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: angle?.color }}
                  >
                    {angle?.emoji} {angle?.label}
                  </span>
                </div>

                {/* Text */}
                <p className="text-sm text-[#1a1a2e] leading-relaxed mb-2">
                  {piece.text}
                </p>

                {/* Visual hook */}
                {piece.visualHook && (
                  <p className="text-xs text-[#9ca3af] italic mb-2">
                    {piece.visualHook}
                  </p>
                )}

                {/* Bottom row: status + actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8e0d4]">
                  <button
                    onClick={() => cycleStatus(piece)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white ${STATUS_COLORS[piece.status]}`}
                    title="Clique para mudar status"
                  >
                    {STATUS_LABELS[piece.status]}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(piece)}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#1a1a2e] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(piece.id)}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#fe2c55] hover:bg-[#fe2c55]/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
