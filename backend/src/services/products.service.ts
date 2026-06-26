import { productsRepository } from '../repositories/products.repository';
import { slugify } from '../utils/slugify';

function piecesPerBatchForPresentation(presentation: unknown) {
  return presentation === 'slice' ? 8 : 1;
}

export class ProductsService {
  list(filters: Record<string, unknown>) {
    return productsRepository.list(filters);
  }

  async getById(id: string) {
    const product = await productsRepository.findById(id);
    const recipeCost = await productsRepository.getRecipeCosts(id);
    const availability = await productsRepository.getAvailability(id);
    return { product, recipeCost, availability };
  }

  private async getUniqueSlug(baseSlug: string, currentProductId?: string) {
    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      const existingProduct = await productsRepository.findBySlug(candidate);

      if (!existingProduct || existingProduct.id === currentProductId) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  async create(payload: Record<string, unknown>) {
    const presentation = payload.presentation;
    const baseSlug = slugify(String(payload.slug ?? payload.name));
    const slug = await this.getUniqueSlug(baseSlug);

    return productsRepository.create({
      ...payload,
      slug,
      pieces_per_batch: piecesPerBatchForPresentation(presentation),
      is_custom: payload.is_custom ?? presentation === 'custom'
    });
  }

  async update(id: string, payload: Record<string, unknown>) {
    const normalized = { ...payload };

    if (payload.name || payload.slug) {
      const baseSlug = slugify(String(payload.slug ?? payload.name));
      normalized.slug = await this.getUniqueSlug(baseSlug, id);
    }

    if (payload.presentation) {
      normalized.pieces_per_batch = piecesPerBatchForPresentation(payload.presentation);
    }

    return productsRepository.update(id, normalized);
  }

  updateStatus(id: string, status: string) {
    return productsRepository.update(id, { status });
  }

  deactivate(id: string) {
    return productsRepository.update(id, { status: 'inactive' });
  }
}

export const productsService = new ProductsService();
