import { publicRepository } from '../repositories/public.repository';

export class PublicService {
  listProducts() {
    return publicRepository.listProducts();
  }
}

export const publicService = new PublicService();
