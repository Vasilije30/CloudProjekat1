import { get, post, put, del } from './client';

export interface TariffModelResponse {
  id: string;
  name: string;
  greenHighTariffPrice: number;
  greenLowTariffPrice: number;
  blueHighTariffPrice: number;
  blueLowTariffPrice: number;
  redHighTariffPrice: number;
  redLowTariffPrice: number;
  greenZoneUpperLimit: number;
  blueZoneUpperLimit: number;
  powerBillingRate: number;
  supplierFee: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateTariffModelRequest {
  name: string;
  greenHighTariffPrice: number;
  greenLowTariffPrice: number;
  blueHighTariffPrice: number;
  blueLowTariffPrice: number;
  redHighTariffPrice: number;
  redLowTariffPrice: number;
  greenZoneUpperLimit: number;
  blueZoneUpperLimit: number;
  powerBillingRate: number;
  supplierFee: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export type UpdateTariffModelRequest = CreateTariffModelRequest;

export function getTariffModels(): Promise<TariffModelResponse[]> {
  return get<TariffModelResponse[]>('/api/tariffmodels');
}

export function createTariffModel(data: CreateTariffModelRequest): Promise<TariffModelResponse> {
  return post<TariffModelResponse>('/api/tariffmodels', data);
}

export function updateTariffModel(id: string, data: UpdateTariffModelRequest): Promise<void> {
  return put<void>(`/api/tariffmodels/${id}`, data);
}

export function deleteTariffModel(id: string): Promise<void> {
  return del<void>(`/api/tariffmodels/${id}`);
}
