import { productsRepository } from '../repositories/products.repository';
import { slugify } from '../utils/slugify';

function normalizePiecesPerBatch(presentation: unknown, piecesPerBatch: unknown) {
  if (presentation !== 'slice') {
    return 1;
  }

  const normalized = Number(piecesPerBatch);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : 8;
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
      pieces_per_batch: normalizePiecesPerBatch(presentation, payload.pieces_per_batch),
      is_custom: payload.is_custom ?? presentation === 'custom'
    });
  }

  async update(id: string, payload: Record<string, unknown>) {
    const currentProduct = await productsRepository.findById(id);
    const normalized = { ...payload };
    const presentation = payload.presentation ?? currentProduct.presentation;

    if (payload.name || payload.slug) {
      const baseSlug = slugify(String(payload.slug ?? payload.name));
      normalized.slug = await this.getUniqueSlug(baseSlug, id);
    }

    if (payload.presentation || payload.pieces_per_batch !== undefined) {
      normalized.pieces_per_batch = normalizePiecesPerBatch(presentation, payload.pieces_per_batch ?? currentProduct.pieces_per_batch);
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
