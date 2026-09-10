import { supabase } from './supabase';
import { INITIAL_PRODUCTS, INITIAL_HOOKS, INITIAL_ANALYSES } from './initial-data';

let seeded = false;

export async function seedDatabase(): Promise<void> {
  if (seeded) return;
  seeded = true;

  // Check if products table already has data
  const { data: existing, error: checkError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('seedDatabase check error:', checkError);
    return;
  }

  if (existing && existing.length > 0) {
    // Already seeded
    return;
  }

  console.log('Seeding database with initial data...');

  // Insert products
  for (const product of INITIAL_PRODUCTS) {
    const { error } = await supabase.from('products').insert({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      description: product.description,
      shop_url: product.shopUrl,
      image_url: product.imageUrl,
    });
    if (error) console.error('Seed product error:', error);
  }

  // Insert content pieces (hooks)
  for (const piece of INITIAL_HOOKS) {
    const { error } = await supabase.from('content_pieces').insert({
      id: piece.id,
      product_id: piece.productId,
      type: piece.type,
      angle: piece.angle,
      text: piece.text,
      visual_hook: piece.visualHook,
      status: piece.status,
    });
    if (error) console.error('Seed piece error:', error);
  }

  // Insert analyses
  for (const analysis of INITIAL_ANALYSES) {
    const { error } = await supabase.from('product_analyses').insert({
      product_id: analysis.productId,
      price: analysis.price,
      original_price: analysis.originalPrice,
      discount: analysis.discount,
      shipping: analysis.shipping,
      rating: analysis.rating,
      review_count: analysis.reviewCount,
      sold_count: analysis.soldCount,
      seller: analysis.seller,
      sizes: analysis.sizes,
      colors: analysis.colors,
      material: analysis.material,
      image_url: analysis.imageUrl,
      features: analysis.features,
      main_benefit: analysis.mainBenefit,
      decision_pyramid: analysis.decisionPyramid,
      objections: analysis.objections,
      strategic_insights: analysis.strategicInsights,
    });
    if (error) console.error('Seed analysis error:', error);
  }

  console.log('Database seeded successfully.');
}
