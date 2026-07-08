import { useQuery } from '@tanstack/react-query';
import {
  fetchGrafanaDashboards,
  fetchGrafanaAlerts,
  fetchGrafanaHealth,
  fetchGrafanaDatasources,
} from '../services/grafanaApi';

export const useGrafanaDashboards  = () => useQuery({ queryKey: ['grafana-dashboards'],  queryFn: fetchGrafanaDashboards,  staleTime: 120000 });
export const useGrafanaAlerts      = () => useQuery({ queryKey: ['grafana-alerts'],      queryFn: fetchGrafanaAlerts,      refetchInterval: 30000 });
export const useGrafanaHealth      = () => useQuery({ queryKey: ['grafana-health'],      queryFn: fetchGrafanaHealth,      refetchInterval: 60000 });
export const useGrafanaDatasources = () => useQuery({ queryKey: ['grafana-datasources'], queryFn: fetchGrafanaDatasources, staleTime: 300000 });
