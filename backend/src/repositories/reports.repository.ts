import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class ReportsRepository {
  async salesReport(from?: string, to?: string) {
    let query = supabase.from('vw_sales_report').select('*');
    if (from) query = query.gte('income_date', from);
    if (to) query = query.lte('income_date', to);

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async expenses(from?: string, to?: string) {
    let query = supabase.from('expenses').select('*');
    if (from) query = query.gte('expense_date', from);
    if (to) query = query.lte('expense_date', to);

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async lowStock() {
    const { data, error } = await supabase.from('vw_ingredient_stock').select('*').eq('is_low_stock', true).order('name');
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async waste(from?: string, to?: string) {
    let query = supabase.from('finished_inventory_movements').select('*, products(name)').eq('movement_type', 'waste');
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }
}

export const reportsRepository = new ReportsRepository();
