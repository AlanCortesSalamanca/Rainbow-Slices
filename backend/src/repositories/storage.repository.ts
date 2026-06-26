import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export class StorageRepository {
  async uploadProductImage(path: string, file: Buffer, contentType: string) {
    const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(path, file, {
      contentType,
      upsert: true
    });

    if (error) throw new ApiError(400, error.message, error);

    const { data } = supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}

export const storageRepository = new StorageRepository();
