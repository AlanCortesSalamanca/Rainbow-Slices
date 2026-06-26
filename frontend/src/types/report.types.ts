export interface SummaryReport {
  totalIncome: number;
  totalExpenses: number;
  estimatedProfit: number;
}

export interface SalesReportRow {
  product_name?: string;
  delivery_point_name?: string;
  quantity?: number;
  amount?: number;
  income_date?: string;
}
