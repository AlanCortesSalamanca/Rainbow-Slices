import { storageRepository } from '../repositories/storage.repository';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slugify';
import { randomUUID } from 'crypto';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxFileSizeBytes = 5 * 1024 * 1024;

function getExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
}

export class UploadsService {
  uploadProductImage(file?: Express.Multer.File) {
    if (!file) {
      throw new ApiError(400, 'Image file is required');
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new ApiError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed');
    }

    if (file.size > maxFileSizeBytes) {
      throw new ApiError(400, 'Image file must be 5 MB or smaller');
    }

    const baseName = slugify(file.originalname.replace(/\.[^.]+$/, '')) || 'product-image';
    const extension = getExtension(file.originalname);
    const uniquePart = `${Date.now()}-${randomUUID()}`;
    const path = `products/${baseName}-${uniquePart}.${extension}`;

    return storageRepository.uploadProductImage(path, file.buffer, file.mimetype);
  }
}

export const uploadsService = new UploadsService();
