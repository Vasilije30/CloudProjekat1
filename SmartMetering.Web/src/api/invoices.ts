import { get, post, getBlob } from './client';

export interface InvoiceResponse {
  id: string;
  propertyId: string;
  meterId: string;
  month: number;
  year: number;
  highTariffKwh: number;
  lowTariffKwh: number;
  totalKwh: number;
  greenZoneKwh: number;
  blueZoneKwh: number;
  redZoneKwh: number;
  energyCharge: number;
  powerCharge: number;
  supplierCharge: number;
  totalAmount: number;
  status: string;
  paidAtUtc: string | null;
  hasDocument: boolean;
  createdAtUtc: string;
}

export interface InvoiceListResponse {
  items: InvoiceResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface InvoiceDetailResponse extends InvoiceResponse {
  propertyName: string;
  propertyAddress: string;
  meterLabel: string;
  meterSerialNumber: string;
}

export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

export function getInvoices(page: number = 1, pageSize: number = 10, propertyId?: string): Promise<InvoiceListResponse> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('pageSize', pageSize.toString());
  if (propertyId) params.set('propertyId', propertyId);
  return get<InvoiceListResponse>(`/api/invoices?${params.toString()}`);
}

export function getInvoiceDetail(id: string): Promise<InvoiceDetailResponse> {
  return get<InvoiceDetailResponse>(`/api/invoices/${id}`);
}

export function downloadDocument(id: string): Promise<Blob> {
  return getBlob(`/api/invoices/${id}/document`);
}

export function createCheckout(invoiceId: string): Promise<CheckoutResponse> {
  return post<CheckoutResponse>('/api/payments/checkout', { invoiceId });
}
