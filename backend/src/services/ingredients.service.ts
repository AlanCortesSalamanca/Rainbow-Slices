import { ingredientsRepository } from '../repositories/ingredients.repository';

export class IngredientsService {
  list() {
    return ingredientsRepository.list();
  }

  getById(id: string) {
    return ingredientsRepository.findById(id);
  }

  create(payload: Record<string, unknown>) {
    return ingredientsRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return ingredientsRepository.update(id, payload);
  }

  updateStatus(id: string, active: boolean) {
    return ingredientsRepository.update(id, { active });
  }

  async addStock(id: string, payload: { quantity: number; total_cost: number; notes?: string }) {
    await ingredientsRepository.addStock(id, payload.quantity, payload.total_cost, payload.notes);
    return ingredientsRepository.findById(id);
  }
}

export const ingredientsService = new IngredientsService();
