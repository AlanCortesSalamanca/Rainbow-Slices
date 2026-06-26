import { reportsRepository } from '../repositories/reports.repository';

export class ReportsService {
  async summary(from?: string, to?: string) {
    const [sales, expenses] = await Promise.all([
      reportsRepository.salesReport(from, to),
      reportsRepository.expenses(from, to)
    ]);

    const totalIncome = sales.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const totalExpenses = expenses.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

    return { totalIncome, totalExpenses, estimatedProfit: totalIncome - totalExpenses };
  }

  salesByProduct(from?: string, to?: string) {
    return reportsRepository.salesReport(from, to);
  }

  salesByDeliveryPoint(from?: string, to?: string) {
    return reportsRepository.salesReport(from, to);
  }

  lowStock() {
    return reportsRepository.lowStock();
  }

  waste(from?: string, to?: string) {
    return reportsRepository.waste(from, to);
  }
}

export const reportsService = new ReportsService();
