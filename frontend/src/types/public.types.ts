import type { PresentationType } from './common.types';

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  presentation: PresentationType;
  sale_price: number;
  image_url: string | null;
  current_stock: number;
}
