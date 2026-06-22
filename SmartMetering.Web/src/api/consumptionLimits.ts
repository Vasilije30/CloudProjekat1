import { get, post } from './client';

export interface ConsumptionLimitResponse {
  id: string;
  userId: string;
  threshold: number;
  unit: string;
  notifiedForMonth: string | null;
}

export interface SetConsumptionLimitRequest {
  threshold: number;
  unit: string;
}

export function getLimit(): Promise<ConsumptionLimitResponse> {
  return get<ConsumptionLimitResponse>('/api/consumption-limit');
}

export function setLimit(data: SetConsumptionLimitRequest): Promise<void> {
  return post<void>('/api/consumption-limit', data);
}
