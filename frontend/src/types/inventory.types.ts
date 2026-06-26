import type { PresentationType } from './common.types';

export interface FinishedInventoryStock {
  product_id: string;
  name: string;
  presentation: PresentationType;
  current_stock: number;
}
