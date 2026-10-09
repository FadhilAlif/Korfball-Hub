import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export interface Athlete {
  id: string;
  team_id: string;
  player_id: string;
  full_name: string;
  display_name: string | null;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  jersey_number: number;
  position: string | null;
  join_date: string;
  status: 'ACTIVE' | 'UNAVAILABLE' | 'INJURED' | 'SUSPENDED' | 'INACTIVE';
  phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  notes: string | null;
  rosters?: Array<{
    id: string;
    season_id: string;
    jersey_number: number;
    is_captain: boolean;
    status: string;
    season?: {
      id: string;
      name: string;
      is_active: boolean;
    };
  }>;
}

export interface AthletesResponse {
  items: Athlete[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    males: number;
    females: number;
    activeFit: number;
    medicalHold: number;
  };
}

export interface AthleteFilters {
  search?: string;
  gender?: string;
  status?: string;
  season_id?: string;
  page?: number;
  limit?: number;
}

export function useGetAthletes(filters: AthleteFilters = {}) {
  return useQuery({
    queryKey: ['athletes', filters],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: AthletesResponse }>('/athletes', {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useGetAthlete(id: string) {
  return useQuery({
    queryKey: ['athletes', id],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: Athlete }>(`/athletes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateAthlete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Athlete> & { season_id?: string; is_captain?: boolean }) => {
      const res = await apiClient.post<any, { success: boolean; data: Athlete }>('/athletes', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useUpdateAthlete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Athlete> }) => {
      const res = await apiClient.patch<any, { success: boolean; data: Athlete }>(`/athletes/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athletes', variables.id] });
    },
  });
}

export function useDeleteAthlete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any, { success: boolean; data: { message: string } }>(`/athletes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useAssignRoster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      athlete_id: string;
      season_id: string;
      jersey_number: number;
      is_captain?: boolean;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: any }>('/athletes/roster', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useSetCaptain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rosterId: string) => {
      const res = await apiClient.patch<any, { success: boolean; data: any }>(`/athletes/roster/${rosterId}/captain`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}
