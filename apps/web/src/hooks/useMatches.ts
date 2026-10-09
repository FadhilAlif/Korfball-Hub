import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export interface MatchSquadMember {
  id: string;
  match_id: string;
  athlete_id: string;
  squad_status: 'STARTING' | 'SUBSTITUTE' | 'UNAVAILABLE';
  is_captain: boolean;
  minutes_played: number;
  assists: number;
  cards: number;
  notes: string | null;
  athlete?: {
    id: string;
    player_id: string;
    full_name: string;
    gender: 'MALE' | 'FEMALE';
    jersey_number: number;
    position: string | null;
    status: string;
  };
}

export interface MatchEvent {
  id: string;
  match_id: string;
  athlete_id: string;
  event_type: 'GOAL';
  event_time: number;
  notes: string | null;
  athlete?: {
    id: string;
    full_name: string;
    jersey_number: number;
    gender: string;
  };
}

export interface Match {
  id: string;
  team_id: string;
  season_id: string;
  opponent: string;
  competition: string | null;
  match_date: string;
  start_time: string;
  venue: string;
  home_away: 'HOME' | 'AWAY' | 'NEUTRAL';
  team_score: number | null;
  opponent_score: number | null;
  notes: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  result: 'WIN' | 'LOSS' | 'DRAW' | null;
  season?: {
    id: string;
    name: string;
  };
  squad?: MatchSquadMember[];
  events?: MatchEvent[];
  ikfCompliance?: {
    isCompliant: boolean;
    totalStarters: number;
    starterMales: number;
    starterFemales: number;
    message: string;
  };
}

export interface MatchesSummary {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export function useGetMatches(seasonId?: string, status?: string) {
  return useQuery({
    queryKey: ['matches', { seasonId, status }],
    queryFn: async () => {
      const res = await apiClient.get<
        any,
        { success: boolean; data: Match[]; meta: MatchesSummary }
      >('/matches', {
        params: { season_id: seasonId, status },
      });
      return {
        items: res.data,
        summary: res.meta,
      };
    },
  });
}

export function useGetMatch(id: string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: Match }>(
        `/matches/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Match>) => {
      const res = await apiClient.post<any, { success: boolean; data: Match }>(
        '/matches',
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Match> }) => {
      const res = await apiClient.patch<any, { success: boolean; data: Match }>(
        `/matches/${id}`,
        data,
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any, { success: boolean; message: string }>(
        `/matches/${id}`,
      );
      return res.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useAssignSquad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      squad,
    }: {
      matchId: string;
      squad: Array<{
        athlete_id: string;
        squad_status: string;
        is_captain?: boolean;
        notes?: string;
      }>;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: Match }>(
        `/matches/${matchId}/squad`,
        { squad },
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
}

export function useRecordMatchEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      athleteId,
      eventType,
      eventTime,
      shotType,
      notes,
    }: {
      matchId: string;
      athleteId: string;
      eventType: string;
      eventTime: number;
      shotType?: string;
      notes?: string;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: Match }>(
        `/matches/${matchId}/events`,
        {
          athlete_id: athleteId,
          event_type: eventType,
          event_time: eventTime,
          shot_type: shotType,
          notes,
        },
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
}

export function useFinalizeMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      teamScore,
      opponentScore,
    }: {
      matchId: string;
      teamScore: number;
      opponentScore: number;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: Match }>(
        `/matches/${matchId}/finalize`,
        {
          team_score: teamScore,
          opponent_score: opponentScore,
        },
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
}
