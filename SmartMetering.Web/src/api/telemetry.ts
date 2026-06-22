import { get } from './client';

export interface DailyConsumptionPoint {
  date: string;
  vtKwh: number;
  ntKwh: number;
}

export interface DailyConsumptionResponse {
  propertyId: string;
  fromDate: string;
  toDate: string;
  points: DailyConsumptionPoint[];
}

export interface TelemetrySample {
  meterId: string;
  recordedAtUtc: string;
  voltage: number;
  loadKw: number;
}

export interface TelemetryTrendResponse {
  propertyId: string;
  fromUtc: string;
  toUtc: string;
  samples: TelemetrySample[];
}

export interface TelemetryBroadcastEvent {
  meterId: string;
  propertyId: string;
  recordedAtUtc: string;
  voltage: number;
  loadKw: number;
  tariff: string;
  totalKwh: number;
}

export function getDailyConsumption(propertyId: string, date?: string): Promise<DailyConsumptionResponse> {
  const query = date ? `?date=${date}` : '';
  return get<DailyConsumptionResponse>(`/api/properties/${propertyId}/telemetry/daily${query}`);
}

export function getTelemetryTrend(propertyId: string, from?: string, to?: string): Promise<TelemetryTrendResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  return get<TelemetryTrendResponse>(`/api/properties/${propertyId}/telemetry/trend${query}`);
}
