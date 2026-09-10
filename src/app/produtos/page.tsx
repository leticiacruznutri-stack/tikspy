"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllPieces,
} from "@/lib/store";
import type { ContentPiece, Product } from "@/lib/types";

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allPieces, setAllPieces] = useState<ContentPiece[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formShopUrl, setFormShopUrl] = useState("");

  const reload = useCallback(async () => {
    setProducts(await getProducts());
    setAllPieces(await getAllPieces());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSubmit = async () => {
    if (!formName.trim()) return;

    if (editingId) {
      await updateProduct(editingId, {
        name: formName.trim(),
        emoji: formEmoji || "\uD83D\uDCE6",
        description: formDescription.trim(),
        shopUrl: formShopUrl.trim() || undefined,
      });
    } else {
      await addProduct({
        name: formName.trim(),
        emoji: formEmoji || "\uD83D\uDCE6",
        description: formDescription.trim(),
        shopUrl: formShopUrl.trim() || undefined,
      });
    }

    resetForm();
    reload();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormName(product.name);
    setFormEmoji(product.emoji);
    setFormDescription(product.description);
    setFormShopUrl(product.shopUrl || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    reload();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormEmoji("");
    setFormDescription("");
    setFormShopUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Produtos</h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Gerencie seus produtos TikTok Shop
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
        >
          <Plus size={16} />
          Adicionar Produto
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a1a2e]">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h3>
            <button onClick={resetForm} className="text-[#9ca3af] hover:text-[#1a1a2e]">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Nome
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Emoji
              </label>
              <input
                value={formEmoji}
                onChange={(e) => setFormEmoji(e.target.value)}
                className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
                placeholder="Ex: \uD83E\uDDCA"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              Descrição
            </label>
            <input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              placeholder="Breve descrição do produto"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">
              URL da Loja (opcional)
            </label>
            <input
              value={formShopUrl}
              onChange={(e) => setFormShopUrl(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6b7280] hover:bg-[#f5f0ea] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className="rounded-xl bg-[#1a1a2e] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-40"
            >
              {editingId ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Product List */}
      {products.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
          <Package size={40} className="mx-auto mb-3 text-[#9ca3af] opacity-50" />
          <p className="text-[#9ca3af] text-sm">Nenhum produto cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const hookCount = allPieces.filter((p) => p.productId === product.id && p.type === 'hook').length;
            const bodyCount = allPieces.filter((p) => p.productId === product.id && p.type === 'body').length;
            const ctaCount = allPieces.filter((p) => p.productId === product.id && p.type === 'cta').length;

            return (
              <Link
                key={product.id}
                href={`/produtos/${product.id}`}
                className="block rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm group hover:border-[#1a1a2e]/20 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#e8e0d4]"
                      />
                    ) : (
                      <span className="text-3xl">{product.emoji}</span>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-[#1a1a2e]">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-[#9ca3af] mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.preventDefault(); startEdit(product); }}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#1a1a2e] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(product.id); }}
                      className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#fe2c55] hover:bg-[#fe2c55]/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {product.shopUrl && (
                  <span className="text-xs text-[#3b82f6] block mb-3 truncate">
                    {product.shopUrl}
                  </span>
                )}

                <div className="flex gap-3 text-xs text-[#9ca3af] pt-3 border-t border-[#e8e0d4]">
                  <span>{hookCount} hooks</span>
                  <span>{bodyCount} bodies</span>
                  <span>{ctaCount} CTAs</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
