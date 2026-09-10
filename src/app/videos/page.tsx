"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shuffle,
  Trash2,
  Calendar,
  Check,
  Zap,
  FileText,
  Megaphone,
} from "lucide-react";
import {
  getProducts,
  getProductById,
  getHooks,
  getBodies,
  getCTAs,
  getCombos,
  generateCombos,
  addCombo,
  updateCombo,
  deleteCombo,
  getPiecesByAngle,
} from "@/lib/store";
import { ANGLES } from "@/lib/angles";
import type { Angle, ContentPiece, Product, VideoCombo } from "@/lib/types";

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

export default function VideosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<VideoCombo[]>([]);

  // Generator state
  const [genProduct, setGenProduct] = useState("");
  const [genAngle, setGenAngle] = useState<Angle>("nao-vaza");
  const [genCount, setGenCount] = useState(5);

  // Manual builder state
  const [manProduct, setManProduct] = useState("");
  const [manAngle, setManAngle] = useState<Angle>("nao-vaza");
  const [manHooks, setManHooks] = useState<ContentPiece[]>([]);
  const [manBodies, setManBodies] = useState<ContentPiece[]>([]);
  const [manCtas, setManCtas] = useState<ContentPiece[]>([]);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [selectedCta, setSelectedCta] = useState<string | null>(null);

  // Combo filter
  const [filterProduct, setFilterProduct] = useState<string>("");

  const reload = useCallback(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
    setCombos(getCombos());
    if (!genProduct && allProducts.length > 0) setGenProduct(allProducts[0].id);
    if (!manProduct && allProducts.length > 0) setManProduct(allProducts[0].id);
  }, [genProduct, manProduct]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Update manual columns when product/angle change
  useEffect(() => {
    if (!manProduct) return;
    setManHooks(getPiecesByAngle(manAngle, "hook", manProduct));
    setManBodies(getPiecesByAngle(manAngle, "body", manProduct));
    setManCtas(getPiecesByAngle(manAngle, "cta", manProduct));
    setSelectedHook(null);
    setSelectedBody(null);
    setSelectedCta(null);
  }, [manProduct, manAngle]);

  // Available counts for generator
  const genHookCount = genProduct
    ? getPiecesByAngle(genAngle, "hook", genProduct).length
    : 0;
  const genBodyCount = genProduct
    ? getPiecesByAngle(genAngle, "body", genProduct).length
    : 0;
  const genCtaCount = genProduct
    ? getPiecesByAngle(genAngle, "cta", genProduct).length
    : 0;

  const handleGenerate = () => {
    if (!genProduct) return;
    generateCombos(genAngle, genCount, genProduct);
    reload();
  };

  const handleManualCreate = () => {
    if (!manProduct || !selectedHook || !selectedBody || !selectedCta) return;
    addCombo({
      productId: manProduct,
      hookId: selectedHook,
      bodyId: selectedBody,
      ctaId: selectedCta,
      angle: manAngle,
      status: "planned",
    });
    setSelectedHook(null);
    setSelectedBody(null);
    setSelectedCta(null);
    reload();
  };

  const handleDeleteCombo = (id: string) => {
    deleteCombo(id);
    reload();
  };

  const handleScheduleDate = (id: string, date: string) => {
    updateCombo(id, { scheduledDate: date });
    reload();
  };

  const handleStatusChange = (id: string, status: VideoCombo["status"]) => {
    updateCombo(id, { status });
    reload();
  };

  const filteredCombos = filterProduct
    ? combos.filter((c) => c.productId === filterProduct)
    : combos;

  const getPieceText = (id: string): string => {
    const allHooks = getHooks();
    const allBodies = getBodies();
    const allCtas = getCTAs();
    const piece = [...allHooks, ...allBodies, ...allCtas].find(
      (p) => p.id === id
    );
    return piece?.text || "...";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Montar Videos</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Gere combinacoes ou monte manualmente seus videos
        </p>
      </div>

      {/* Section 1: Generator */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#1a1a2e] flex items-center gap-2">
          <Shuffle size={20} className="text-[#fe2c55]" />
          Gerador de Combos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              Produto
            </label>
            <select
              value={genProduct}
              onChange={(e) => setGenProduct(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
            >
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
              value={genAngle}
              onChange={(e) => setGenAngle(e.target.value as Angle)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
            >
              {ANGLES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.emoji} {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              Quantidade
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setGenCount(n)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    genCount === n
                      ? "bg-[#1a1a2e] text-white"
                      : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:bg-[#f5f0ea]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-[#9ca3af]">
          <span className="flex items-center gap-1">
            <Zap size={12} className="text-[#3b82f6]" />
            {genHookCount} hooks
          </span>
          <span className="flex items-center gap-1">
            <FileText size={12} className="text-[#8b5cf6]" />
            {genBodyCount} bodies
          </span>
          <span className="flex items-center gap-1">
            <Megaphone size={12} className="text-[#f59e0b]" />
            {genCtaCount} CTAs
          </span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={genHookCount === 0 || genBodyCount === 0 || genCtaCount === 0}
          className="rounded-xl bg-[#fe2c55] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#e0264d] transition-colors disabled:opacity-40"
        >
          Gerar {genCount} Combos
        </button>
      </div>

      {/* Section 2: Manual Builder */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#1a1a2e]">
          Montagem Manual
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              Produto
            </label>
            <select
              value={manProduct}
              onChange={(e) => setManProduct(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
            >
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
              value={manAngle}
              onChange={(e) => setManAngle(e.target.value as Angle)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hooks column */}
          <div>
            <h4 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap size={12} className="text-[#3b82f6]" />
              Hooks ({manHooks.length})
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {manHooks.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHook(h.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-colors border ${
                    selectedHook === h.id
                      ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                      : "bg-white text-[#1a1a2e] border-[#e8e0d4] hover:bg-[#f5f0ea]"
                  }`}
                >
                  {h.text.length > 80 ? h.text.slice(0, 80) + "..." : h.text}
                </button>
              ))}
              {manHooks.length === 0 && (
                <p className="text-xs text-[#9ca3af] py-4 text-center">
                  Nenhum hook
                </p>
              )}
            </div>
          </div>

          {/* Bodies column */}
          <div>
            <h4 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText size={12} className="text-[#8b5cf6]" />
              Bodies ({manBodies.length})
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {manBodies.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBody(b.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-colors border ${
                    selectedBody === b.id
                      ? "bg-[#8b5cf6] text-white border-[#8b5cf6]"
                      : "bg-white text-[#1a1a2e] border-[#e8e0d4] hover:bg-[#f5f0ea]"
                  }`}
                >
                  {b.text.length > 80 ? b.text.slice(0, 80) + "..." : b.text}
                </button>
              ))}
              {manBodies.length === 0 && (
                <p className="text-xs text-[#9ca3af] py-4 text-center">
                  Nenhum body
                </p>
              )}
            </div>
          </div>

          {/* CTAs column */}
          <div>
            <h4 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Megaphone size={12} className="text-[#f59e0b]" />
              CTAs ({manCtas.length})
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {manCtas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCta(c.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-colors border ${
                    selectedCta === c.id
                      ? "bg-[#f59e0b] text-white border-[#f59e0b]"
                      : "bg-white text-[#1a1a2e] border-[#e8e0d4] hover:bg-[#f5f0ea]"
                  }`}
                >
                  {c.text.length > 80 ? c.text.slice(0, 80) + "..." : c.text}
                </button>
              ))}
              {manCtas.length === 0 && (
                <p className="text-xs text-[#9ca3af] py-4 text-center">
                  Nenhum CTA
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview + Create */}
        {(selectedHook || selectedBody || selectedCta) && (
          <div className="rounded-xl border border-[#e8e0d4] p-4 bg-[#FAF7F2] space-y-2">
            <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
              Preview
            </p>
            {selectedHook && (
              <p className="text-xs text-[#1a1a2e]">
                <span className="font-medium text-[#3b82f6]">Hook:</span>{" "}
                {getPieceText(selectedHook)}
              </p>
            )}
            {selectedBody && (
              <p className="text-xs text-[#1a1a2e]">
                <span className="font-medium text-[#8b5cf6]">Body:</span>{" "}
                {getPieceText(selectedBody)}
              </p>
            )}
            {selectedCta && (
              <p className="text-xs text-[#1a1a2e]">
                <span className="font-medium text-[#f59e0b]">CTA:</span>{" "}
                {getPieceText(selectedCta)}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleManualCreate}
          disabled={!selectedHook || !selectedBody || !selectedCta}
          className="rounded-xl bg-[#1a1a2e] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-40"
        >
          Criar Combo
        </button>
      </div>

      {/* Section 3: Combos Criados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">
            Combos Criados ({filteredCombos.length})
          </h2>
        </div>

        {/* Product filter chips */}
        <div className="flex flex-wrap gap-2">
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

        {filteredCombos.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
            <p className="text-[#9ca3af] text-sm">Nenhum combo criado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCombos.map((combo) => {
              const product = getProductById(combo.productId);
              const angle = ANGLES.find((a) => a.id === combo.angle);

              return (
                <div
                  key={combo.id}
                  className="rounded-2xl bg-white border border-[#e8e0d4] p-4 shadow-sm space-y-3"
                >
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#fe2c55] hover:bg-[#fe2c55]/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Content preview */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[#1a1a2e]">
                      <span className="font-medium text-[#3b82f6]">H:</span>{" "}
                      {getPieceText(combo.hookId).slice(0, 60)}...
                    </p>
                    <p className="text-[#1a1a2e]">
                      <span className="font-medium text-[#8b5cf6]">B:</span>{" "}
                      {getPieceText(combo.bodyId).slice(0, 60)}...
                    </p>
                    <p className="text-[#1a1a2e]">
                      <span className="font-medium text-[#f59e0b]">C:</span>{" "}
                      {getPieceText(combo.ctaId).slice(0, 60)}...
                    </p>
                  </div>

                  {/* Status + Schedule */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#e8e0d4]">
                    <select
                      value={combo.status}
                      onChange={(e) =>
                        handleStatusChange(
                          combo.id,
                          e.target.value as VideoCombo["status"]
                        )
                      }
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
                        onChange={(e) =>
                          handleScheduleDate(combo.id, e.target.value)
                        }
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
