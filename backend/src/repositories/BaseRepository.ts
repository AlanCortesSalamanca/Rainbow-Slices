import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

type RowData = Record<string, unknown>;

export class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async list(filters: RowData = {}) {
    let query = supabase.from(this.tableName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async findById(id: string) {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) throw new ApiError(404, error.message, error);
    return data;
  }

  async create(payload: RowData) {
    const { data, error } = await supabase.from(this.tableName).insert(payload).select('*').single();
    if (error) throw new ApiError(400, error.message, error);
    return data;
  }

  async update(id: string, payload: RowData) {
    const { data, error } = await supabase.from(this.tableName).update(payload).eq('id', id).select('*').single();
    if (error) throw new ApiError(400, error.message, error);
    return data;
  }

  async remove(id: string) {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw new ApiError(400, error.message, error);
  }
}
