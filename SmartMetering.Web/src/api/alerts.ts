import { get, post } from './client';

export interface AlertResponse {
  id: string;
  alertType: string;
  severity: string;
  meterId: string | null;
  propertyId: string | null;
  userId: string;
  description: string;
  occurredAtUtc: string;
  resolvedAtUtc: string | null;
}

export function getAlerts(): Promise<AlertResponse[]> {
  return get<AlertResponse[]>('/api/alerts');
}

export function resolveAlert(id: string): Promise<void> {
  return post<void>(`/api/alerts/${id}/resolve`);
}
