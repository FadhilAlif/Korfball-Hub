import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  region: string;
  home_venue: string | null;
  description: string | null;
  seasons: Season[];
}

export function useGetTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: Team }>('/teams');
      return res.data;
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      const res = await apiClient.patch<any, { success: boolean; data: Team }>(`/teams/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: Partial<Season> }) => {
      const res = await apiClient.post<any, { success: boolean; data: Season }>(`/teams/${teamId}/seasons`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useSetActiveSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, seasonId }: { teamId: string; seasonId: string }) => {
      const res = await apiClient.patch<any, { success: boolean; data: Season }>(
        `/teams/${teamId}/seasons/${seasonId}/active`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}
