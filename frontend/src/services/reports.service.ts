import { apiClient } from './apiClient';
import type { DateRangeFilter } from '../types/common.types';
import type { SalesReportRow, SummaryReport } from '../types/report.types';

function toQuery(filter: DateRangeFilter = {}) {
  const params = new URLSearchParams();
  if (filter.from) params.set('from', filter.from);
  if (filter.to) params.set('to', filter.to);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const reportsService = {
  summary: (filter?: DateRangeFilter) => apiClient.get<SummaryReport>(`/reports/summary${toQuery(filter)}`),
  salesByProduct: (filter?: DateRangeFilter) => apiClient.get<SalesReportRow[]>(`/reports/sales-by-product${toQuery(filter)}`),
  salesByDeliveryPoint: (filter?: DateRangeFilter) => apiClient.get<SalesReportRow[]>(`/reports/sales-by-delivery-point${toQuery(filter)}`),
  lowStock: () => apiClient.get('/reports/stock-low'),
  waste: (filter?: DateRangeFilter) => apiClient.get(`/reports/waste${toQuery(filter)}`)
};
