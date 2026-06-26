import type { PresentationType } from './common.types';

export type MovementType = 'production_output' | 'reserved' | 'unreserved' | 'sold' | 'waste' | 'adjustment';
export type FinishedInventoryStatus = 'available' | 'out_of_stock' | 'negative';
export type FinishedInventoryFilterStatus = 'with_stock' | 'out_of_stock' | 'negative';
export type FinishedInventorySort = 'stock_asc' | 'stock_desc' | 'name';

export interface FinishedInventoryFilters {
  search?: string;
  presentation?: PresentationType | '';
  status?: FinishedInventoryFilterStatus | '';
  sort?: FinishedInventorySort | '';
}

export interface FinishedInventoryItem {
  product_id: string;
  name: string;
  image_url: string | null;
  presentation: PresentationType;
  sale_price: number;
  pieces_per_batch: number;
  product_status: 'active' | 'inactive';
  current_stock: number;
  status: FinishedInventoryStatus;
}

export type FinishedInventoryStock = FinishedInventoryItem;

export interface FinishedInventoryMovementFilters {
  movement_type?: MovementType | '';
  date_from?: string;
  date_to?: string;
  related_order_id?: string;
  related_production_batch_id?: string;
}

export interface FinishedInventoryMovement {
  movement_id: string;
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  presentation: PresentationType;
  sale_price: number;
  pieces_per_batch: number;
  movement_type: MovementType;
  quantity: number;
  related_order_id: string | null;
  related_order_item_id: string | null;
  production_batch_id: string | null;
  order_customer_name: string | null;
  order_customer_phone: string | null;
  order_item_quantity: number | null;
  order_item_unit_price: number | null;
  production_date: string | null;
  batches_quantity: number | null;
  units_produced: number | null;
  production_mode: string | null;
  notes: string | null;
  created_at: string;
}

export interface MovementSummary {
  total_produced: number;
  total_reserved: number;
  total_unreserved: number;
  total_sold: number;
  total_waste: number;
  total_adjustments: number;
  current_stock: number;
}

export interface FinishedInventoryProductDetail {
  product: FinishedInventoryItem;
  current_stock: number;
  movement_summary: MovementSummary;
  movements: FinishedInventoryMovement[];
}

export interface WastePayload {
  product_id: string;
  quantity: number;
  notes?: string;
}

export interface AdjustmentPayload {
  product_id: string;
  quantity: number;
  notes: string;
}

export interface FinishedInventoryMutationResult {
  movement: FinishedInventoryMovement;
  current_stock: number;
}
