import { useQuery } from "@tanstack/react-query";
import {
  listServiceSessionsPaged,
  type ServiceSessionsQuery,
} from "@/modules/sessions/services/service-sessions.service";

export function serviceSessionsQueryKey(query: ServiceSessionsQuery) {
  return ["service-sessions", "all", query] as const;
}

export function useServiceSessions(query: ServiceSessionsQuery = {}) {
  return useQuery({
    queryKey: serviceSessionsQueryKey(query),
    queryFn: () => listServiceSessionsPaged(query),
  });
}
