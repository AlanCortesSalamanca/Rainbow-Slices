import { storageRepository } from '../repositories/storage.repository';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slugify';
import { randomUUID } from 'crypto';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};
const maxFileSizeBytes = 5 * 1024 * 1024;

function getExtension(fileName: string, mimeType: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : null;
  return safeExtension && Object.values(extensionByMimeType).includes(safeExtension) ? safeExtension : extensionByMimeType[mimeType];
}

function getStorageBucket() {
  const bucket = env.SUPABASE_STORAGE_BUCKET?.trim();

  if (!bucket) {
    throw new ApiError(500, 'SUPABASE_STORAGE_BUCKET no está configurado');
  }

  if (/^https?:\/\//i.test(bucket) || bucket.includes('supabase.com/dashboard') || bucket.includes('/storage/files/buckets/')) {
    throw new ApiError(500, 'SUPABASE_STORAGE_BUCKET debe ser solo el nombre del bucket, por ejemplo: rainbaw-slices-web');
  }

  if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/i.test(bucket)) {
    throw new ApiError(500, 'SUPABASE_STORAGE_BUCKET debe ser solo el nombre del bucket, por ejemplo: rainbaw-slices-web');
  }

  return bucket;
}

export class UploadsService {
  async uploadProductImage(file?: Express.Multer.File) {
    if (!file) {
      throw new ApiError(400, 'Image file is required');
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new ApiError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed');
    }

    if (file.size > maxFileSizeBytes) {
      throw new ApiError(400, 'Image file must be 5 MB or smaller');
    }

    const bucket = getStorageBucket();
    await storageRepository.ensureBucketExists(bucket);

    const baseName = slugify(file.originalname.replace(/\.[^.]+$/, '')) || 'product-image';
    const extension = getExtension(file.originalname, file.mimetype);
    const uniquePart = `${Date.now()}-${randomUUID()}`;
    const path = `products/${baseName}-${uniquePart}.${extension}`;

    return storageRepository.uploadProductImage(bucket, path, file.buffer, file.mimetype);
  }
}

export const uploadsService = new UploadsService();
