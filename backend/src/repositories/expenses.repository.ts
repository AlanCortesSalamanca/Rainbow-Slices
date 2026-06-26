import { BaseRepository } from './BaseRepository';

export class ExpensesRepository extends BaseRepository {
  constructor() {
    super('expenses');
  }
}

export const expensesRepository = new ExpensesRepository();
