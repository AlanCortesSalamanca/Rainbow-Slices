import { apiClient } from './apiClient';
import type { Expense } from '../types/expense.types';

export const expensesService = {
  list: () => apiClient.get<Expense[]>('/expenses'),
  create: (payload: Partial<Expense>) => apiClient.post<Expense>('/expenses', payload)
};
