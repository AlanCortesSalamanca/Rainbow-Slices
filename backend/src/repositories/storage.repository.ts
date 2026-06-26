import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class StorageRepository {
  async ensureBucketExists(bucket: string) {
    const { data, error } = await supabase.storage.getBucket(bucket);

    if (error || !data) {
      throw new ApiError(400, `Bucket de Supabase Storage no encontrado: ${bucket}. Verifica el nombre en backend/.env`, error);
    }

    if (!data.public) {
      throw new ApiError(400, `Bucket de Supabase Storage no es público: ${bucket}. Actívalo como público o configura una policy de lectura pública para usar URLs públicas`);
    }

    return data;
  }

  async uploadProductImage(bucket: string, path: string, file: Buffer, contentType: string) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: true
    });

    if (error) throw new ApiError(400, error.message, error);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { imageUrl: data.publicUrl, path, bucket };
  }
}

export const storageRepository = new StorageRepository();
