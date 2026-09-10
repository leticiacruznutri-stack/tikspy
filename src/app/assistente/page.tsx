"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ExternalLink, MessageCircle, Sparkles } from "lucide-react";
import { getProducts, getAnalysis } from "@/lib/store";
import type { Product, ProductAnalysis } from "@/lib/types";

const PROMPTS_SUGESTOES = [
  "Escreve 5 bodies pro ângulo 'não vaza' no meu tom de comunicação",
  "Cria 5 CTAs urgentes pra esse produto",
  "Escreve um roteiro completo de 30 segundos usando o hook: 'Bonita ela é, né?'",
  "Me dá 10 hooks novos pro ângulo estética",
  "Escreve 3 bodies pro ângulo crianças/mãe",
  "Cria variações do hook: 'Eu achei que tinha comprado uma garrafinha de água e simplesmente ganhei um copo térmico'",
  "Analisa esses hooks e me diz quais são os mais fortes e por quê",
  "Escreve 5 legendas pro TikTok pra esse produto",
];

export default function AssistentePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);
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

    let ctx = `Você é meu assistente de criação de conteúdo para TikTok Shop. Vou te passar o contexto do produto e preciso que você me ajude a criar conteúdo.\n\n`;
    ctx += `PRODUTO: ${selectedProductData.emoji} ${selectedProductData.name}\n`;
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
    ctx += `- Frases curtas e diretas\n\n`;
    ctx += `ÂNGULOS DE CONTEÚDO:\n`;
    ctx += `- Não Vaza (vedação, teste de vazamento)\n`;
    ctx += `- Estética (beleza, impulso, pinterest)\n`;
    ctx += `- 2 em 1 (troca de tampa)\n`;
    ctx += `- Tamanho (cabe na bolsa, carro, mochila)\n`;
    ctx += `- Temperatura (teste térmico, gelo, café)\n`;
    ctx += `- Uso Inesperado (café, escritório, canudo)\n`;
    ctx += `- Crianças (filhos, mãe, escola)\n`;

    return ctx;
  };

  const handleCopyContext = () => {
    navigator.clipboard.writeText(buildContext());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = (idx: number) => {
    navigator.clipboard.writeText(PROMPTS_SUGESTOES[idx]);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleOpenClaude = () => {
    navigator.clipboard.writeText(buildContext());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open("https://claude.ai/new", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] flex items-center gap-2">
            <MessageCircle size={24} className="text-[#8b5cf6]" />
            Assistente IA
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Use o Claude pra escrever hooks, bodies e CTAs com contexto do produto
          </p>
        </div>

        {/* Product selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-xl bg-white border border-[#e8e0d4] px-4 py-2.5 text-sm font-medium text-[#1a1a2e] hover:bg-[#f5f0ea] transition-colors shadow-sm"
          >
            <span>{selectedProductData?.emoji || "📦"}</span>
            <span className="max-w-[200px] truncate">
              {selectedProductData?.name || "Selecionar produto"}
            </span>
            <ChevronDown size={14} className="text-[#9ca3af]" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white border border-[#e8e0d4] shadow-lg z-10 py-1">
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
      </div>

      {/* Main action */}
      <div className="rounded-2xl bg-gradient-to-r from-[#8b5cf6]/10 to-[#ec4899]/10 border border-[#8b5cf6]/20 p-8 shadow-sm text-center">
        <Sparkles size={40} className="mx-auto mb-4 text-[#8b5cf6]" />
        <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
          Abrir Claude com Contexto do Produto
        </h2>
        <p className="text-sm text-[#6b7280] mb-6 max-w-md mx-auto">
          Clique no botão abaixo. O contexto completo do produto será copiado automaticamente.
          Depois é só colar no Claude e pedir o que precisar.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleOpenClaude}
            className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] text-white px-6 py-3 text-sm font-medium hover:bg-[#2a2a3e] transition-colors shadow-md"
          >
            <ExternalLink size={16} />
            Abrir Claude + Copiar Contexto
          </button>
          <button
            onClick={handleCopyContext}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors shadow-sm ${
              copied
                ? "bg-[#22c55e] text-white"
                : "bg-white border border-[#e8e0d4] text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copiado!" : "Só Copiar Contexto"}
          </button>
        </div>
      </div>

      {/* How to use */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
        <h3 className="text-base font-semibold text-[#1a1a2e] mb-3">Como usar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold">1</div>
            <div>
              <p className="text-sm font-medium text-[#1a1a2e]">Copie o contexto</p>
              <p className="text-xs text-[#9ca3af]">Clique em &quot;Abrir Claude + Copiar Contexto&quot;</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold">2</div>
            <div>
              <p className="text-sm font-medium text-[#1a1a2e]">Cole no Claude</p>
              <p className="text-xs text-[#9ca3af]">Ctrl+V no chat que abriu</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold">3</div>
            <div>
              <p className="text-sm font-medium text-[#1a1a2e]">Peça o que precisa</p>
              <p className="text-xs text-[#9ca3af]">Hooks, bodies, CTAs, roteiros...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt suggestions */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
        <h3 className="text-base font-semibold text-[#1a1a2e] mb-4">Sugestões de prompts</h3>
        <p className="text-xs text-[#9ca3af] mb-4">Clique pra copiar e colar no Claude depois do contexto</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROMPTS_SUGESTOES.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleCopyPrompt(idx)}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                copiedPrompt === idx
                  ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                  : "border-[#e8e0d4] text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
              }`}
            >
              {copiedPrompt === idx ? "✓ Copiado!" : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Context preview */}
      <div className="rounded-2xl bg-white border border-[#e8e0d4] p-6 shadow-sm">
        <h3 className="text-base font-semibold text-[#1a1a2e] mb-3">Preview do contexto</h3>
        <p className="text-xs text-[#9ca3af] mb-3">Isso é o que será copiado pro Claude</p>
        <pre className="text-xs text-[#6b7280] bg-[#FAF7F2] rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap border border-[#e8e0d4]">
          {buildContext()}
        </pre>
      </div>
    </div>
  );
}
