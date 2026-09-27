import { apiRequest } from './api';
import type { DashboardData, ApiEnvelope, ReportSummary } from '../types/api';

export async function fetchDashboard(familyId: string) {
  const result = await apiRequest<ApiEnvelope<DashboardData>>('/dashboard', {}, { familyId });
  return result;
}

export async function fetchFamilySummary(familyId: string) {
  const result = await apiRequest<ApiEnvelope<ReportSummary>>('/reports/family-summary', {}, { familyId });
  return result;
}
