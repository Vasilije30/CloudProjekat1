import { get, post, patch } from './client';

export interface ManualReadingResponse {
  id: string;
  meterId: string;
  userId: string;
  reading: number;
  photoUrl: string;
  status: string;
  createdAtUtc: string;
  verifiedAtUtc: string | null;
  verificationNotes: string | null;
}

export function createReading(meterId: string, reading: number, image: File): Promise<ManualReadingResponse> {
  const formData = new FormData();
  formData.append('reading', reading.toString());
  formData.append('image', image);
  return post<ManualReadingResponse>(`/api/meters/${meterId}/manual-reading`, formData);
}

export function getReadings(): Promise<ManualReadingResponse[]> {
  return get<ManualReadingResponse[]>('/api/manualreadings');
}

export function approveReading(id: string, notes?: string): Promise<void> {
  return patch<void>(`/api/manualreadings/${id}/approve`, { notes });
}

export function rejectReading(id: string, notes?: string): Promise<void> {
  return patch<void>(`/api/manualreadings/${id}/reject`, { notes });
}
