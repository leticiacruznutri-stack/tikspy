export type Angle =
  | 'nao-vaza'
  | 'estetica'
  | '2em1'
  | 'tamanho'
  | 'temperatura'
  | 'uso-inesperado'
  | 'criancas';

export type Product = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  shopUrl?: string;
  createdAt: string;
};

export type ContentPiece = {
  id: string;
  productId: string;
  type: 'hook' | 'body' | 'cta';
  angle: Angle;
  text: string;
  visualHook?: string;
  status: 'draft' | 'ready' | 'filmed' | 'posted';
  createdAt: string;
};

export type VideoCombo = {
  id: string;
  productId: string;
  hookId: string;
  bodyId: string;
  ctaId: string;
  angle: Angle;
  status: 'planned' | 'filming' | 'editing' | 'posted';
  scheduledDate?: string;
  notes?: string;
};

export type AngleInfo = {
  id: Angle;
  label: string;
  emoji: string;
  color: string;
  description: string;
};

export type GravacaoSession = {
  productId: string;
  angle: Angle;
  date: string;
  combos: VideoCombo[];
};

export type ProductFeature = {
  id: string;
  category: 'structural' | 'functional' | 'aesthetic' | 'commercial';
  feature: string;
  why: string;
  whatItDoes: string;
  dimensioned: string;
  emotionPositive: string;
  emotionNegative: string;
  ranking: number; // 1-5 stars
};

export type ProductAnalysis = {
  productId: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  shipping: string;
  rating: string;
  reviewCount: string;
  soldCount: string;
  seller: string;
  sizes: string[];
  colors: string[];
  material: string;
  imageUrl?: string;
  features: ProductFeature[];
  mainBenefit: string;
  decisionPyramid: {
    desire: string;
    justification: string;
    rationalization: string;
    conversion: string;
  };
  objections: { objection: string; source: string; treatment: string }[];
  strategicInsights: string[];
};
