import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class PublicRepository {
  async listProducts() {
    const [{ data: products, error: productsError }, { data: stock, error: stockError }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, description, presentation, sale_price, image_url, created_at')
        .eq('status', 'active')
        .ilike('category', 'cheesecake')
        .or('is_custom.is.false,is_custom.is.null')
        .order('name'),
      supabase.from('vw_product_stock').select('product_id, current_stock')
    ]);

    if (productsError) throw new ApiError(500, productsError.message, productsError);
    if (stockError) throw new ApiError(500, stockError.message, stockError);

    const stockByProduct = new Map((stock ?? []).map((item) => [item.product_id, Number(item.current_stock ?? 0)]));

    return (products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      presentation: product.presentation,
      sale_price: Number(product.sale_price ?? 0),
      image_url: product.image_url,
      current_stock: stockByProduct.get(product.id) ?? 0
    }));
  }
}

export const publicRepository = new PublicRepository();
