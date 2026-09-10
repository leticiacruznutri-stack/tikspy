"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ExternalLink } from "lucide-react";
import { getProducts, getAnalysis } from "@/lib/store";
import type { Product, ProductAnalysis } from "@/lib/types";

export default function AssistentePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    getProducts().then((prods) => {
      setProducts(prods);
      if (prods.length > 0) setSelectedProduct(prods[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    getAnalysis(selectedProduct).then((a) => setAnalysis(a || null));
  }, [selectedProduct]);

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const buildContext = () => {
    if (!selectedProductData) return "Nenhum produto selecionado.";

    let ctx = `PRODUTO: ${selectedProductData.emoji} ${selectedProductData.name}\n`;
    ctx += `${selectedProductData.description}\n\n`;

    if (analysis) {
      ctx += `DADOS DO PRODUTO:\n`;
      ctx += `- Preço: ${analysis.price}${analysis.originalPrice ? ` (de ${analysis.originalPrice})` : ""}\n`;
      ctx += `- Frete: ${analysis.shipping}\n`;
      ctx += `- Nota: ${analysis.rating}/5 (${analysis.reviewCount} avaliações)\n`;
      ctx += `- Vendidos: ${analysis.soldCount}\n`;
      ctx += `- Vendedor: ${analysis.seller}\n`;
      ctx += `- Material: ${analysis.material}\n`;
      ctx += `- Tamanhos: ${analysis.sizes?.join(", ")}\n`;
      ctx += `- Cores: ${analysis.colors?.join(", ")}\n\n`;

      ctx += `BENEFÍCIO PRINCIPAL:\n${analysis.mainBenefit}\n\n`;

      ctx += `PIRÂMIDE DE DECISÃO:\n`;
      ctx += `1. ${analysis.decisionPyramid?.desire}\n`;
      ctx += `2. ${analysis.decisionPyramid?.justification}\n`;
      ctx += `3. ${analysis.decisionPyramid?.rationalization}\n`;
      ctx += `4. ${analysis.decisionPyramid?.conversion}\n\n`;

      if (analysis.features && analysis.features.length > 0) {
        ctx += `RECURSOS E BENEFÍCIOS:\n`;
        analysis.features.forEach((f) => {
          ctx += `- ${f.feature}: ${f.dimensioned} (Emoção+: ${f.emotionPositive} | Emoção-: ${f.emotionNegative})\n`;
        });
        ctx += "\n";
      }

      if (analysis.objections && analysis.objections.length > 0) {
        ctx += `OBJEÇÕES:\n`;
        analysis.objections.forEach((o) => {
          ctx += `- ${o.objection} → ${o.treatment}\n`;
        });
        ctx += "\n";
      }

      if (analysis.strategicInsights && analysis.strategicInsights.length > 0) {
        ctx += `INSIGHTS ESTRATÉGICOS:\n`;
        analysis.strategicInsights.forEach((s, i) => {
          ctx += `${i + 1}. ${s}\n`;
        });
        ctx += "\n";
      }
    }

    ctx += `MEU TOM DE COMUNICAÇÃO:\n`;
    ctx += `- Informal, como se estivesse falando com uma amiga\n`;
    ctx += `- Uso "miga", "migas", "gente"\n`;
    ctx += `- Letras esticadas pra ênfase: "lindaaaa", "perfeiiito", "sérioooo"\n`;
    ctx += `- Emoção genuína, nunca parece propaganda\n`;
    ctx += `- Demonstro o produto como se tivesse mostrando algo que comprei e amei\n`;
    ctx += `- Frases curtas e diretas\n`;

    return ctx;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildContext());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Assistente IA</h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Use o Claude pra escrever hooks, bodies e CTAs com contexto do produto
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Product selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-xl bg-white border border-[#e8e0d4] px-4 py-2.5 text-sm font-medium text-[#1a1a2e] hover:bg-[#f5f0ea] transition-colors shadow-sm"
            >
              <span>{selectedProductData?.emoji || "📦"}</span>
              <span className="max-w-[150px] truncate">
                {selectedProductData?.name || "Selecionar produto"}
              </span>
              <ChevronDown size={14} className="text-[#9ca3af]" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white border border-[#e8e0d4] shadow-lg z-10 py-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                      p.id === selectedProduct
                        ? "bg-[#f5f0ea] text-[#1a1a2e] font-medium"
                        : "text-[#6b7280] hover:bg-[#f5f0ea] hover:text-[#1a1a2e]"
                    }`}
                  >
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy context button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${
              copied
                ? "bg-[#22c55e] text-white"
                : "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e]"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copiado!" : "Copiar Contexto"}
          </button>

          {/* Open in new tab */}
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white border border-[#e8e0d4] px-4 py-2.5 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea] transition-colors shadow-sm"
          >
            <ExternalLink size={14} />
            Abrir em nova aba
          </a>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-4 shadow-sm">
        <p className="text-sm text-[#6b7280]">
          <strong className="text-[#1a1a2e]">Como usar:</strong> Clique em{" "}
          <strong>&quot;Copiar Contexto&quot;</strong> → cole no chat do Claude abaixo → peça o que
          precisa (hooks, bodies, CTAs, roteiros). O Claude já vai saber tudo sobre o produto,
          seus benefícios e seu tom de comunicação.
        </p>
      </div>

      {/* Claude iframe */}
      <div className="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-[#e8e0d4] shadow-sm bg-white">
        <iframe
          src="https://claude.ai/new"
          className="w-full h-full min-h-[600px]"
          title="Claude AI"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
