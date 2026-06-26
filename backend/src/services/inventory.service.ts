import { inventoryRepository } from '../repositories/inventory.repository';
import type { z } from 'zod';
import type { finishedInventoryQuerySchema, finishedMovementsQuerySchema } from '../schemas/inventory.schemas';
import { ApiError } from '../utils/ApiError';

type FinishedInventoryFilters = z.infer<typeof finishedInventoryQuerySchema>;
type FinishedMovementFilters = z.infer<typeof finishedMovementsQuerySchema>;

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase();

export class InventoryService {
  async finishedStock(filters: FinishedInventoryFilters = {}) {
    const stock = await inventoryRepository.listFinishedStock();
    const search = normalize(filters.search);

    let result = stock;

    if (search) {
      result = result.filter((item) => normalize(item.name).includes(search));
    }

    if (filters.presentation) {
      result = result.filter((item) => item.presentation === filters.presentation);
    }

    if (filters.status === 'with_stock') {
      result = result.filter((item) => item.current_stock > 0);
    }

    if (filters.status === 'out_of_stock') {
      result = result.filter((item) => item.current_stock === 0);
    }

    if (filters.status === 'negative') {
      result = result.filter((item) => item.current_stock < 0);
    }

    if (filters.sort === 'stock_asc') {
      result = [...result].sort((left, right) => left.current_stock - right.current_stock || left.name.localeCompare(right.name));
    } else if (filters.sort === 'stock_desc') {
      result = [...result].sort((left, right) => right.current_stock - left.current_stock || left.name.localeCompare(right.name));
    } else {
      result = [...result].sort((left, right) => left.name.localeCompare(right.name));
    }

    return result;
  }

  async finishedProductDetail(productId: string) {
    const [product, movements] = await Promise.all([
      inventoryRepository.findFinishedProduct(productId),
      inventoryRepository.listFinishedMovements(productId)
    ]);

    return {
      product,
      current_stock: product.current_stock,
      movement_summary: this.buildMovementSummary(movements, product.current_stock),
      movements
    };
  }

  async finishedProductMovements(productId: string, filters: FinishedMovementFilters = {}) {
    await inventoryRepository.findFinishedProduct(productId);
    return inventoryRepository.listFinishedMovements(productId, filters);
  }

  ingredientStock() {
    return inventoryRepository.listIngredientStock();
  }

  async createAdjustment(payload: { product_id: string; quantity: number; notes: string }) {
    const product = await inventoryRepository.findFinishedProduct(payload.product_id);

    if (!payload.notes.trim()) {
      throw new ApiError(400, 'Las notas son obligatorias para ajustes manuales');
    }

    if (product.current_stock + payload.quantity < 0) {
      throw new ApiError(400, `El ajuste dejaría stock negativo. Disponible: ${product.current_stock}, ajuste: ${payload.quantity}`);
    }

    const movement = await inventoryRepository.createFinishedAdjustment(payload);
    const updatedProduct = await inventoryRepository.findFinishedProduct(payload.product_id);

    return { movement, current_stock: updatedProduct.current_stock };
  }

  async createWaste(payload: { product_id: string; quantity: number; notes?: string }) {
    const product = await inventoryRepository.findFinishedProduct(payload.product_id);

    if (payload.quantity > product.current_stock) {
      throw new ApiError(400, `Stock insuficiente para registrar merma. Disponible: ${product.current_stock}, solicitado: ${payload.quantity}`);
    }

    const movement = await inventoryRepository.createFinishedWaste(payload);
    const updatedProduct = await inventoryRepository.findFinishedProduct(payload.product_id);

    return { movement, current_stock: updatedProduct.current_stock };
  }

  private buildMovementSummary(movements: Array<{ movement_type: string; quantity: number }>, currentStock: number) {
    return movements.reduce(
      (summary, movement) => {
        const quantity = Number(movement.quantity ?? 0);

        if (movement.movement_type === 'production_output') summary.total_produced += quantity;
        if (movement.movement_type === 'reserved') summary.total_reserved += Math.abs(quantity);
        if (movement.movement_type === 'unreserved') summary.total_unreserved += quantity;
        if (movement.movement_type === 'sold') summary.total_sold += Math.abs(quantity);
        if (movement.movement_type === 'waste') summary.total_waste += Math.abs(quantity);
        if (movement.movement_type === 'adjustment') summary.total_adjustments += quantity;

        return summary;
      },
      {
        total_produced: 0,
        total_reserved: 0,
        total_unreserved: 0,
        total_sold: 0,
        total_waste: 0,
        total_adjustments: 0,
        current_stock: currentStock
      }
    );
  }
}

export const inventoryService = new InventoryService();
