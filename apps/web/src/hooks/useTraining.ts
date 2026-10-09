import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export interface TrainingActivity {
  id: string;
  training_session_id: string;
  activity_name: string;
  category: string;
  duration: number;
  objective: string | null;
  notes: string | null;
  sequence: number;
}

export interface TrainingAttendance {
  id: string;
  training_session_id: string;
  athlete_id: string;
  status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
  rpe?: number | null;
  notes: string | null;
  athlete?: {
    id: string;
    player_id: string;
    full_name: string;
    gender: 'MALE' | 'FEMALE';
    jersey_number: number;
    position: string | null;
  };
}

export interface TrainingSession {
  id: string;
  team_id: string;
  coach_id: string;
  session_date: string;
  start_datetime: string;
  end_datetime: string;
  venue: string | null;
  objective: string;
  notes: string | null;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  activities: TrainingActivity[];
  attendances?: TrainingAttendance[];
  stats?: {
    totalRecorded: number;
    presentCount: number;
    lateCount: number;
    excusedCount: number;
    absentCount: number;
    attendanceRate: number;
    totalDrillMinutes?: number;
    avgRpe?: number | null;
  };
}

export interface TrainingStats {
  totalSessions: number;
  overallAttendanceRate: number;
  avgTeamRpe: number | null;
  totalPresencesRecorded: number;
}

export interface FilterSessionsParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export function useGetTrainingSessions(params: FilterSessionsParams = {}) {
  return useQuery({
    queryKey: ['training-sessions', params],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: TrainingSession[]; meta: any }>(
        '/training/sessions',
        { params },
      );
      return res.data;
    },
  });
}

export function useGetTrainingSession(id: string) {
  return useQuery({
    queryKey: ['training-sessions', id],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: TrainingSession }>(
        `/training/sessions/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });
}

export function useGetTrainingStats() {
  return useQuery({
    queryKey: ['training-stats'],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: TrainingStats }>(
        '/training/stats',
      );
      return res.data;
    },
  });
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<Partial<TrainingSession>, 'activities'> & {
        activities?: Partial<TrainingActivity>[];
      },
    ) => {
      const res = await apiClient.post<any, { success: boolean; data: TrainingSession }>(
        '/training/sessions',
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
    },
  });
}

export function useUpdateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrainingSession> }) => {
      const res = await apiClient.patch<any, { success: boolean; data: TrainingSession }>(
        `/training/sessions/${id}`,
        data,
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-sessions', variables.id] });
    },
  });
}

export function useDeleteTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<any, { success: boolean; message: string }>(
        `/training/sessions/${id}`,
      );
      return res.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
    },
  });
}

export function useAddDrill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: Partial<TrainingActivity>;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: TrainingActivity }>(
        `/training/sessions/${sessionId}/drills`,
        data,
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', variables.sessionId] });
    },
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      attendances,
    }: {
      sessionId: string;
      attendances: Array<{
        athlete_id: string;
        status: string;
        rpe?: number;
        notes?: string;
      }>;
    }) => {
      const res = await apiClient.post<any, { success: boolean; data: TrainingSession }>(
        `/training/sessions/${sessionId}/attendance`,
        { attendances },
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-sessions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
    },
  });
}
