import { productionRepository } from '../repositories/production.repository';

export class ProductionService {
  list() {
    return productionRepository.list();
  }

  register(payload: { product_id: string; batches_quantity: number; notes?: string }) {
    return productionRepository.register(payload.product_id, payload.batches_quantity, payload.notes);
  }
}

export const productionService = new ProductionService();
