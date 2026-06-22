import { get, post, put, del } from './client';

export interface MeterResponse {
  id: string;
  propertyId: string;
  label: string;
  serialNumber: string;
  connectionType: string;
  approvedPowerKw: number;
  status: string;
  notes: string | null;
  deviceId: string | null;
  createdAtUtc: string;
}

export interface CreateMeterRequest {
  propertyId: string;
  label: string;
  serialNumber: string;
  connectionType: string;
  notes?: string;
}

export interface UpdateMeterRequest {
  label: string;
  notes?: string;
}

export function getMeter(id: string): Promise<MeterResponse> {
  return get<MeterResponse>(`/api/meters/${id}`);
}

export function createMeter(data: CreateMeterRequest): Promise<MeterResponse> {
  return post<MeterResponse>('/api/meters', data);
}

export function updateMeter(id: string, data: UpdateMeterRequest): Promise<void> {
  return put<void>(`/api/meters/${id}`, data);
}

export function deleteMeter(id: string): Promise<void> {
  return del<void>(`/api/meters/${id}`);
}

export function registerDevice(deviceId: string, serialNumber: string): Promise<{ deviceAccessToken: string }> {
  return post<{ deviceAccessToken: string }>('/api/meters/register-device', { deviceId, serialNumber });
}
