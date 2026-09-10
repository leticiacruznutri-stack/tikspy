import type { Angle, ContentPiece, GravacaoSession, Product, ProductAnalysis, VideoCombo } from './types';
import { INITIAL_ANALYSES, INITIAL_HOOKS, INITIAL_PRODUCTS } from './initial-data';

// ── localStorage keys ──
const PIECES_KEY = 'tikspy:pieces';
const COMBOS_KEY = 'tikspy:combos';
const PRODUCTS_KEY = 'tikspy:products';

// ── SSR guard ──
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ── Internal helpers ──
function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function readProducts(): Product[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    // Seed with initial products on first access
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(raw) as Product[];
}

function writeProducts(products: Product[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function readPieces(): ContentPiece[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(PIECES_KEY);
  if (!raw) {
    // Seed with initial hooks on first access
    localStorage.setItem(PIECES_KEY, JSON.stringify(INITIAL_HOOKS));
    return INITIAL_HOOKS;
  }
  const pieces = JSON.parse(raw) as ContentPiece[];
  // Migrate: if pieces exist but have no productId, replace with fresh initial data
  if (pieces.length > 0 && !pieces[0].productId) {
    localStorage.setItem(PIECES_KEY, JSON.stringify(INITIAL_HOOKS));
    return INITIAL_HOOKS;
  }
  return pieces;
}

function writePieces(pieces: ContentPiece[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PIECES_KEY, JSON.stringify(pieces));
}

function readCombos(): VideoCombo[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(COMBOS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as VideoCombo[];
}

function writeCombos(combos: VideoCombo[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(COMBOS_KEY, JSON.stringify(combos));
}

// ── Product queries ──
export function getProducts(): Product[] {
  return readProducts();
}

export function getProductById(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

// ── Product CRUD ──
export function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = readProducts();
  const newProduct: Product = {
    ...product,
    id: uid(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  products.push(newProduct);
  writeProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Product | null {
  const products = readProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  writeProducts(products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeProducts(filtered);

  // Also remove all pieces and combos for this product
  const pieces = readPieces().filter((p) => p.productId !== id);
  writePieces(pieces);
  const combos = readCombos().filter((c) => c.productId !== id);
  writeCombos(combos);

  return true;
}

// ── Piece queries ──
export function getAllPieces(productId?: string): ContentPiece[] {
  const pieces = readPieces();
  if (productId) return pieces.filter((p) => p.productId === productId);
  return pieces;
}

export function getHooks(productId?: string): ContentPiece[] {
  return readPieces().filter(
    (p) => p.type === 'hook' && (productId ? p.productId === productId : true),
  );
}

export function getBodies(productId?: string): ContentPiece[] {
  return readPieces().filter(
    (p) => p.type === 'body' && (productId ? p.productId === productId : true),
  );
}

export function getCTAs(productId?: string): ContentPiece[] {
  return readPieces().filter(
    (p) => p.type === 'cta' && (productId ? p.productId === productId : true),
  );
}

export function getPiecesByAngle(
  angle: Angle,
  type?: ContentPiece['type'],
  productId?: string,
): ContentPiece[] {
  return readPieces().filter(
    (p) =>
      p.angle === angle &&
      (type ? p.type === type : true) &&
      (productId ? p.productId === productId : true),
  );
}

// ── Piece CRUD ──
export function addPiece(piece: Omit<ContentPiece, 'id' | 'createdAt'>): ContentPiece {
  const pieces = readPieces();
  const newPiece: ContentPiece = {
    ...piece,
    id: uid(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  pieces.push(newPiece);
  writePieces(pieces);
  return newPiece;
}

export function updatePiece(id: string, updates: Partial<Omit<ContentPiece, 'id'>>): ContentPiece | null {
  const pieces = readPieces();
  const idx = pieces.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pieces[idx] = { ...pieces[idx], ...updates };
  writePieces(pieces);
  return pieces[idx];
}

export function deletePiece(id: string): boolean {
  const pieces = readPieces();
  const filtered = pieces.filter((p) => p.id !== id);
  if (filtered.length === pieces.length) return false;
  writePieces(filtered);
  return true;
}

// ── Combo queries ──
export function getCombos(productId?: string): VideoCombo[] {
  const combos = readCombos();
  if (productId) return combos.filter((c) => c.productId === productId);
  return combos;
}

// ── Combo CRUD ──
export function addCombo(combo: Omit<VideoCombo, 'id'>): VideoCombo {
  const combos = readCombos();
  const newCombo: VideoCombo = { ...combo, id: uid() };
  combos.push(newCombo);
  writeCombos(combos);
  return newCombo;
}

export function updateCombo(id: string, updates: Partial<Omit<VideoCombo, 'id'>>): VideoCombo | null {
  const combos = readCombos();
  const idx = combos.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  combos[idx] = { ...combos[idx], ...updates };
  writeCombos(combos);
  return combos[idx];
}

export function deleteCombo(id: string): boolean {
  const combos = readCombos();
  const filtered = combos.filter((c) => c.id !== id);
  if (filtered.length === combos.length) return false;
  writeCombos(filtered);
  return true;
}

// ── Combo generator ──
export function generateCombos(angle: Angle, count: number, productId: string): VideoCombo[] {
  const hooks = getPiecesByAngle(angle, 'hook', productId);
  const bodies = getPiecesByAngle(angle, 'body', productId);
  const ctas = getPiecesByAngle(angle, 'cta', productId);

  if (hooks.length === 0 || bodies.length === 0 || ctas.length === 0) {
    return [];
  }

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const generated: VideoCombo[] = [];

  for (let i = 0; i < count; i++) {
    const combo = addCombo({
      productId,
      hookId: pick(hooks).id,
      bodyId: pick(bodies).id,
      ctaId: pick(ctas).id,
      angle,
      status: 'planned',
    });
    generated.push(combo);
  }

  return generated;
}

// ── Schedule helper ──
export function getSchedule(date: string, productId?: string): VideoCombo[] {
  return readCombos().filter(
    (c) =>
      c.scheduledDate === date &&
      (productId ? c.productId === productId : true),
  );
}

// ── Gravacao sessions ──
export function getSessionsForDate(date: string): GravacaoSession[] {
  const combos = getSchedule(date);
  const grouped = new Map<string, VideoCombo[]>();

  for (const combo of combos) {
    const key = `${combo.productId}::${combo.angle}`;
    const list = grouped.get(key);
    if (list) {
      list.push(combo);
    } else {
      grouped.set(key, [combo]);
    }
  }

  const sessions: GravacaoSession[] = [];
  for (const [key, sessionCombos] of grouped) {
    const [productId, angle] = key.split('::');
    sessions.push({
      productId,
      angle: angle as Angle,
      date,
      combos: sessionCombos,
    });
  }

  return sessions;
}

// ── Analysis storage ──
const ANALYSIS_KEY = 'tikspy:analysis';

function readAnalyses(): ProductAnalysis[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(ANALYSIS_KEY);
  if (!raw) {
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(INITIAL_ANALYSES));
    return INITIAL_ANALYSES;
  }
  return JSON.parse(raw);
}

function writeAnalyses(analyses: ProductAnalysis[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analyses));
}

export function getAnalysis(productId: string): ProductAnalysis | undefined {
  return readAnalyses().find(a => a.productId === productId);
}

export function saveAnalysis(analysis: ProductAnalysis): void {
  const analyses = readAnalyses();
  const idx = analyses.findIndex(a => a.productId === analysis.productId);
  if (idx >= 0) analyses[idx] = analysis;
  else analyses.push(analysis);
  writeAnalyses(analyses);
}

export function deleteAnalysis(productId: string): void {
  writeAnalyses(readAnalyses().filter(a => a.productId !== productId));
}
