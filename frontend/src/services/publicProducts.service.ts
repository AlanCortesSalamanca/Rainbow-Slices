import { publicApiClient } from './publicApiClient';
import type { PublicProduct } from '../types/public.types';

export const publicProductsService = {
  list: () => publicApiClient.get<PublicProduct[]>('/public/products')
};
