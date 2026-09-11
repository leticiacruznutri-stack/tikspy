import { supabase } from './supabase';
import type { Angle, ContentPiece, GravacaoSession, Product, ProductAnalysis, VideoCombo } from './types';

// ── Mapping helpers ──

function toDbProduct(p: Partial<Product> & { name?: string }) {
  return {
    ...(p.id !== undefined && { id: p.id }),
    ...(p.name !== undefined && { name: p.name }),
    ...(p.emoji !== undefined && { emoji: p.emoji }),
    ...(p.description !== undefined && { description: p.description }),
    ...(p.shopUrl !== undefined && { shop_url: p.shopUrl }),
    ...(p.imageUrl !== undefined && { image_url: p.imageUrl }),
  };
}

function fromDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    description: row.description,
    shopUrl: row.shop_url,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

function toDbPiece(p: Partial<ContentPiece>) {
  return {
    ...(p.id !== undefined && { id: p.id }),
    ...(p.productId !== undefined && { product_id: p.productId }),
    ...(p.type !== undefined && { type: p.type }),
    ...(p.angle !== undefined && { angle: p.angle }),
    ...(p.text !== undefined && { text: p.text }),
    ...(p.visualHook !== undefined && { visual_hook: p.visualHook }),
    ...(p.headline !== undefined && { headline: p.headline }),
    ...(p.videoFormat !== undefined && { video_format: p.videoFormat }),
    ...(p.status !== undefined && { status: p.status }),
  };
}

function fromDbPiece(row: any): ContentPiece {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    angle: row.angle,
    text: row.text,
    visualHook: row.visual_hook,
    headline: row.headline,
    videoFormat: row.video_format,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toDbCombo(c: Partial<VideoCombo>) {
  return {
    ...(c.id !== undefined && { id: c.id }),
    ...(c.productId !== undefined && { product_id: c.productId }),
    ...(c.hookId !== undefined && { hook_id: c.hookId }),
    ...(c.bodyId !== undefined && { body_id: c.bodyId }),
    ...(c.ctaId !== undefined && { cta_id: c.ctaId }),
    ...(c.angle !== undefined && { angle: c.angle }),
    ...(c.status !== undefined && { status: c.status }),
    ...(c.scheduledDate !== undefined && { scheduled_date: c.scheduledDate }),
    ...(c.notes !== undefined && { notes: c.notes }),
  };
}

function fromDbCombo(row: any): VideoCombo {
  return {
    id: row.id,
    productId: row.product_id,
    hookId: row.hook_id,
    bodyId: row.body_id,
    ctaId: row.cta_id,
    angle: row.angle,
    status: row.status,
    scheduledDate: row.scheduled_date,
    notes: row.notes,
  };
}

function toDbAnalysis(a: ProductAnalysis) {
  return {
    product_id: a.productId,
    price: a.price,
    original_price: a.originalPrice,
    discount: a.discount,
    shipping: a.shipping,
    rating: a.rating,
    review_count: a.reviewCount,
    sold_count: a.soldCount,
    seller: a.seller,
    sizes: a.sizes,
    colors: a.colors,
    material: a.material,
    image_url: a.imageUrl,
    features: a.features,
    main_benefit: a.mainBenefit,
    decision_pyramid: a.decisionPyramid,
    objections: a.objections,
    strategic_insights: a.strategicInsights,
    swipe_file_url: a.swipeFileUrl,
    video_analysis: a.videoAnalysis,
    reference_hooks: a.referenceHooks,
  };
}

function fromDbAnalysis(row: any): ProductAnalysis {
  return {
    productId: row.product_id,
    price: row.price,
    originalPrice: row.original_price,
    discount: row.discount,
    shipping: row.shipping,
    rating: row.rating,
    reviewCount: row.review_count,
    soldCount: row.sold_count,
    seller: row.seller,
    sizes: row.sizes,
    colors: row.colors,
    material: row.material,
    imageUrl: row.image_url,
    features: row.features,
    mainBenefit: row.main_benefit,
    decisionPyramid: row.decision_pyramid,
    objections: row.objections,
    strategicInsights: row.strategic_insights,
    swipeFileUrl: row.swipe_file_url,
    videoAnalysis: row.video_analysis,
    referenceHooks: row.reference_hooks,
  };
}

// ── Products ──

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getProducts error:', error); return []; }
  return (data || []).map(fromDbProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return undefined;
  return fromDbProduct(data);
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(toDbProduct(product as any))
    .select()
    .single();
  if (error) throw error;
  return fromDbProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(toDbProduct(updates))
    .eq('id', id)
    .select()
    .single();
  if (error || !data) return null;
  return fromDbProduct(data);
}

export async function deleteProduct(id: string): Promise<boolean> {
  // Delete related records first
  await supabase.from('content_pieces').delete().eq('product_id', id);
  await supabase.from('video_combos').delete().eq('product_id', id);
  await supabase.from('product_analyses').delete().eq('product_id', id);

  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

// ── Content Pieces ──

export async function getAllPieces(productId?: string): Promise<ContentPiece[]> {
  let query = supabase.from('content_pieces').select('*').order('created_at', { ascending: true });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getAllPieces error:', error); return []; }
  return (data || []).map(fromDbPiece);
}

export async function getHooks(productId?: string): Promise<ContentPiece[]> {
  let query = supabase.from('content_pieces').select('*').eq('type', 'hook').order('created_at', { ascending: true });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getHooks error:', error); return []; }
  return (data || []).map(fromDbPiece);
}

export async function getBodies(productId?: string): Promise<ContentPiece[]> {
  let query = supabase.from('content_pieces').select('*').eq('type', 'body').order('created_at', { ascending: true });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getBodies error:', error); return []; }
  return (data || []).map(fromDbPiece);
}

export async function getCTAs(productId?: string): Promise<ContentPiece[]> {
  let query = supabase.from('content_pieces').select('*').eq('type', 'cta').order('created_at', { ascending: true });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getCTAs error:', error); return []; }
  return (data || []).map(fromDbPiece);
}

export async function getPiecesByAngle(angle: Angle, type?: string, productId?: string): Promise<ContentPiece[]> {
  let query = supabase.from('content_pieces').select('*').eq('angle', angle).order('created_at', { ascending: true });
  if (type) query = query.eq('type', type);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getPiecesByAngle error:', error); return []; }
  return (data || []).map(fromDbPiece);
}

export async function addPiece(piece: Omit<ContentPiece, 'id' | 'createdAt'>): Promise<ContentPiece> {
  const { data, error } = await supabase
    .from('content_pieces')
    .insert(toDbPiece(piece as any))
    .select()
    .single();
  if (error) throw error;
  return fromDbPiece(data);
}

export async function updatePiece(id: string, updates: Partial<ContentPiece>): Promise<ContentPiece | null> {
  const { data, error } = await supabase
    .from('content_pieces')
    .update(toDbPiece(updates))
    .eq('id', id)
    .select()
    .single();
  if (error || !data) return null;
  return fromDbPiece(data);
}

export async function deletePiece(id: string): Promise<boolean> {
  const { error } = await supabase.from('content_pieces').delete().eq('id', id);
  return !error;
}

// ── Video Combos ──

export async function getCombos(productId?: string): Promise<VideoCombo[]> {
  let query = supabase.from('video_combos').select('*').order('created_at', { ascending: true });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getCombos error:', error); return []; }
  return (data || []).map(fromDbCombo);
}

export async function addCombo(combo: Omit<VideoCombo, 'id'>): Promise<VideoCombo> {
  const { data, error } = await supabase
    .from('video_combos')
    .insert(toDbCombo(combo as any))
    .select()
    .single();
  if (error) throw error;
  return fromDbCombo(data);
}

export async function updateCombo(id: string, updates: Partial<VideoCombo>): Promise<VideoCombo | null> {
  const { data, error } = await supabase
    .from('video_combos')
    .update(toDbCombo(updates))
    .eq('id', id)
    .select()
    .single();
  if (error || !data) return null;
  return fromDbCombo(data);
}

export async function deleteCombo(id: string): Promise<boolean> {
  const { error } = await supabase.from('video_combos').delete().eq('id', id);
  return !error;
}

export async function generateCombos(angle: Angle | null, count: number, productId: string): Promise<VideoCombo[]> {
  // Pega todas as peças gravadas do produto, sem filtrar por ângulo
  const allPieces = await getAllPieces(productId);
  const filmed = allPieces.filter(p => p.status === 'filmed');

  const hooks = filmed.filter(p => p.type === 'hook');
  const bodies = filmed.filter(p => p.type === 'body');
  const ctas = filmed.filter(p => p.type === 'cta');

  if (hooks.length === 0 || bodies.length === 0 || ctas.length === 0) {
    return [];
  }

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const generated: VideoCombo[] = [];

  for (let i = 0; i < count; i++) {
    const combo = await addCombo({
      productId,
      hookId: pick(hooks).id,
      bodyId: pick(bodies).id,
      ctaId: pick(ctas).id,
      angle: angle || pick(hooks).angle,
      status: 'planned',
    });
    generated.push(combo);
  }

  return generated;
}

export async function getSchedule(date: string, productId?: string): Promise<VideoCombo[]> {
  let query = supabase.from('video_combos').select('*').eq('scheduled_date', date);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('getSchedule error:', error); return []; }
  return (data || []).map(fromDbCombo);
}

export async function getSessionsForDate(date: string): Promise<GravacaoSession[]> {
  const combos = await getSchedule(date);
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

// ── Product Analysis ──

export async function getAnalysis(productId: string): Promise<ProductAnalysis | undefined> {
  const { data, error } = await supabase
    .from('product_analyses')
    .select('*')
    .eq('product_id', productId)
    .single();
  if (error || !data) return undefined;
  return fromDbAnalysis(data);
}

export async function saveAnalysis(analysis: ProductAnalysis): Promise<void> {
  const dbRow = toDbAnalysis(analysis);
  const { error } = await supabase
    .from('product_analyses')
    .upsert(dbRow, { onConflict: 'product_id' });
  if (error) console.error('saveAnalysis error:', error);
}

export async function deleteAnalysis(productId: string): Promise<void> {
  await supabase.from('product_analyses').delete().eq('product_id', productId);
}
