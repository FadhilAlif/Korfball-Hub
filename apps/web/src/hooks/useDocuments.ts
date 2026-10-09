import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export interface DocumentItem {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  view_url?: string;
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DocumentSummary {
  totalDocuments: number;
  totalBytes: number;
  formattedTotalSize: string;
}

export interface DocumentsResponse {
  items: DocumentItem[];
  summary: DocumentSummary;
}

export function useGetDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async (): Promise<DocumentsResponse> => {
      const res = await apiClient.get<any, {
        success: boolean;
        data: DocumentItem[];
        meta: DocumentSummary;
      }>('/documents');
      return {
        items: res.data || [],
        summary: res.meta || {
          totalDocuments: 0,
          totalBytes: 0,
          formattedTotalSize: '0.0 KB',
        },
      };
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post<any, { success: boolean; data: DocumentItem }>(
        '/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any, { success: boolean; message: string }>(
        `/documents/${id}`,
      );
      return res.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useGetDocumentPresignedUrl() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.get<any, {
        success: boolean;
        data: {
          id: string;
          name: string;
          view_url: string;
          expires_in: number;
        };
      }>(`/documents/${id}/url`);
      return res.data;
    },
  });
}
