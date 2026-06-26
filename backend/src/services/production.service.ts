import { productionRepository } from '../repositories/production.repository';

export class ProductionService {
  list() {
    return productionRepository.list();
  }

  async register(payload: { product_id: string; batches_quantity: number; notes?: string }) {
    const batchId = await productionRepository.register(payload.product_id, payload.batches_quantity, payload.notes);
    return productionRepository.findById(String(batchId));
  }
}

export const productionService = new ProductionService();
