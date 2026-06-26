import { expensesRepository } from '../repositories/expenses.repository';

export class ExpensesService {
  list() {
    return expensesRepository.list();
  }

  create(payload: Record<string, unknown>) {
    return expensesRepository.create({ ...payload, source: 'manual' });
  }
}

export const expensesService = new ExpensesService();
