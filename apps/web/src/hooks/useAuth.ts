import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../lib/axios.js';
import { useAuthStore, AuthUser } from '../store/useAuthStore.js';

export interface ProfileResponse {
  user: AuthUser;
  athlete: any | null;
}

export function useGetProfile() {
  const { token, setAuth, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await apiClient.get<any, { success: boolean; data: ProfileResponse }>('/auth/me');
      if (res.data?.user && token) {
        setAuth(token, res.data.user, res.data.athlete);
      }
      return res.data;
    },
    enabled: !!token,
    retry: 1,
  });
}
