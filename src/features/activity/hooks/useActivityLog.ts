import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import { fetchActivityLog } from '../api';

export function useActivityLog() {
  return useQuery({ queryKey: queryKeys.activityLog, queryFn: () => fetchActivityLog() });
}
