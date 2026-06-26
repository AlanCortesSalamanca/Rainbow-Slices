export type ExpenseCategory = 'ingredients' | 'packaging' | 'transport' | 'advertising' | 'utensils' | 'services' | 'other';

export interface Expense {
  id: string;
  concept: string;
  category: ExpenseCategory;
  source: 'manual' | 'ingredient_stock';
  amount: number;
  expense_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
