import { get, post, put, del } from './client';

export interface PropertyResponse {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string | null;
  userId: string;
  createdAtUtc: string;
}

export interface MeterSummary {
  id: string;
  label: string;
  serialNumber: string;
  connectionType: string;
  approvedPowerKw: number;
  status: string;
}

export interface PropertyDetailResponse {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string | null;
  userId: string;
  createdAtUtc: string;
  meters: MeterSummary[];
}

export interface CreatePropertyRequest {
  name: string;
  city: string;
  address: string;
  description?: string;
}

export interface UpdatePropertyRequest {
  name: string;
  city: string;
  address: string;
  description?: string;
}

export function getProperties(): Promise<PropertyResponse[]> {
  return get<PropertyResponse[]>('/api/properties');
}

export function getPropertyDetail(id: string): Promise<PropertyDetailResponse> {
  return get<PropertyDetailResponse>(`/api/properties/${id}`);
}

export function createProperty(data: CreatePropertyRequest): Promise<PropertyResponse> {
  return post<PropertyResponse>('/api/properties', data);
}

export function updateProperty(id: string, data: UpdatePropertyRequest): Promise<void> {
  return put<void>(`/api/properties/${id}`, data);
}

export function deleteProperty(id: string): Promise<void> {
  return del<void>(`/api/properties/${id}`);
}
