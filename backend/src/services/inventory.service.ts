import { inventoryRepository } from '../repositories/inventory.repository';

export class InventoryService {
  finishedStock() {
    return inventoryRepository.listFinishedStock();
  }

  ingredientStock() {
    return inventoryRepository.listIngredientStock();
  }

  createAdjustment(payload: { product_id: string; quantity: number; notes?: string }) {
    return inventoryRepository.createFinishedMovement({
      product_id: payload.product_id,
      movement_type: 'adjustment',
      quantity: payload.quantity,
      notes: payload.notes
    });
  }

  createWaste(payload: { product_id: string; quantity: number; notes?: string }) {
    return inventoryRepository.createFinishedMovement({
      product_id: payload.product_id,
      movement_type: 'waste',
      quantity: -payload.quantity,
      notes: payload.notes
    });
  }
}

export const inventoryService = new InventoryService();
