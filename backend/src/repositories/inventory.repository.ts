import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class InventoryRepository {
  async listFinishedStock() {
    const [{ data: products, error: productsError }, { data: stocks, error: stocksError }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, image_url, presentation, sale_price, pieces_per_batch, status')
        .order('name'),
      supabase.from('vw_product_stock').select('product_id, current_stock')
    ]);

    if (productsError) throw new ApiError(500, productsError.message, productsError);
    if (stocksError) throw new ApiError(500, stocksError.message, stocksError);

    const stockByProduct = new Map((stocks ?? []).map((item) => [item.product_id, Number(item.current_stock ?? 0)]));

    return (products ?? []).map((product) => {
      const currentStock = stockByProduct.get(product.id) ?? 0;
      return {
        product_id: product.id,
        name: product.name,
        image_url: product.image_url,
        presentation: product.presentation,
        sale_price: Number(product.sale_price ?? 0),
        pieces_per_batch: Number(product.pieces_per_batch ?? 1),
        product_status: product.status,
        current_stock: currentStock,
        status: currentStock < 0 ? 'negative' : currentStock === 0 ? 'out_of_stock' : 'available'
      };
    });
  }

  async findFinishedProduct(productId: string) {
    const stock = await this.listFinishedStock();
    const product = stock.find((item) => item.product_id === productId);
    if (!product) throw new ApiError(404, 'Producto no encontrado');
    return product;
  }

  async listFinishedMovements(productId: string, filters: Record<string, unknown> = {}) {
    let query = supabase
      .from('vw_finished_inventory_movements_detail')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (filters.movement_type) query = query.eq('movement_type', filters.movement_type);
    if (filters.date_from) query = query.gte('created_at', `${filters.date_from}T00:00:00`);
    if (filters.date_to) query = query.lte('created_at', `${filters.date_to}T23:59:59.999`);
    if (filters.related_order_id) query = query.eq('related_order_id', filters.related_order_id);
    if (filters.related_production_batch_id) query = query.eq('production_batch_id', filters.related_production_batch_id);

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message, error);
    return data ?? [];
  }

  async getFinishedMovement(movementId: string) {
    const { data, error } = await supabase
      .from('vw_finished_inventory_movements_detail')
      .select('*')
      .eq('movement_id', movementId)
      .single();

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async listIngredientStock() {
    const { data, error } = await supabase.from('vw_ingredient_stock').select('*').order('name');
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async createFinishedWaste(payload: { product_id: string; quantity: number; notes?: string }) {
    const { data, error } = await supabase.rpc('register_finished_inventory_waste', {
      p_product_id: payload.product_id,
      p_quantity: payload.quantity,
      p_notes: payload.notes ?? null
    });

    if (error) throw new ApiError(400, error.message, error);
    return this.getFinishedMovement(data as string);
  }

  async createFinishedAdjustment(payload: { product_id: string; quantity: number; notes: string }) {
    const { data, error } = await supabase.rpc('register_finished_inventory_adjustment', {
      p_product_id: payload.product_id,
      p_quantity: payload.quantity,
      p_notes: payload.notes
    });

    if (error) throw new ApiError(400, error.message, error);
    return this.getFinishedMovement(data as string);
  }
}

export const inventoryRepository = new InventoryRepository();
