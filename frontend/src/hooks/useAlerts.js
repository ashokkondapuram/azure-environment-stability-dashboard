import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../services/api';

export function useAlerts(options = {}) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 30000, // poll every 30s
    ...options,
  });
}
