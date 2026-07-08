import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export function useClientDashboard() {
  const { authHeader } = useAuth();
  return useQuery({
    queryKey: ['client-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/client-dashboard', { headers: authHeader() });
      if (!res.ok) throw new Error('Failed to load dashboard data');
      return res.json();
    },
    refetchInterval: 60000,
    staleTime:       30000,
  });
}

export function useSnapshots() {
  const { authHeader } = useAuth();
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: async () => {
      const res = await fetch('/api/snapshots', { headers: authHeader() });
      if (!res.ok) throw new Error('Failed to load snapshots');
      return res.json();
    },
    refetchInterval: 120000,
    staleTime:       60000,
  });
}
