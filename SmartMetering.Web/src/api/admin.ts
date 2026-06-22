import { get, post } from './client';

export interface MeterOverviewResponse {
  id: string;
  label: string;
  serialNumber: string;
  status: string;
  connectionType: string;
  approvedPowerKw: number;
  deviceId: string | null;
  propertyName: string;
  propertyCity: string;
  propertyAddress: string;
  ownerName: string;
  ownerEmail: string;
}

export interface AdminInvoiceSummaryResponse {
  totalInvoices: number;
  paidCount: number;
  unpaidCount: number;
  totalBilled: number;
  totalCollected: number;
}

export interface GenerateInvoicesRequest {
  month: number;
  year: number;
}

export interface GenerateInvoicesResponse {
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  message: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export function getMeterOverview(): Promise<MeterOverviewResponse[]> {
  return get<MeterOverviewResponse[]>('/api/admin/meters');
}

export function getInvoiceSummary(): Promise<AdminInvoiceSummaryResponse> {
  return get<AdminInvoiceSummaryResponse>('/api/admin/invoices-summary');
}

export function generateInvoices(data: GenerateInvoicesRequest): Promise<GenerateInvoicesResponse> {
  return post<GenerateInvoicesResponse>('/api/admin/generate-invoices', data);
}

export function getUsers(): Promise<UserResponse[]> {
  return get<UserResponse[]>('/api/users');
}

export function createUser(data: CreateUserRequest): Promise<UserResponse> {
  return post<UserResponse>('/api/users', data);
}

export function suspendUser(id: string): Promise<void> {
  return post<void>(`/api/users/${id}/suspend`);
}
