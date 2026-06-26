import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class DeliveryPointsRepository {
  async listActive() {
    const { data, error } = await supabase
      .from('delivery_points')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }
}

export const deliveryPointsRepository = new DeliveryPointsRepository();
