export interface ProductionBatch {
  id: string;
  product_id: string;
  batches_quantity: number;
  units_produced: number;
  estimated_total_cost: number;
  production_date: string;
  notes?: string | null;
  created_at: string;
}
