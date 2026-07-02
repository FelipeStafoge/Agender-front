import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";
import { toValue, type MaybeRef } from "vue";
import type { Event } from "@/types/api";

async function getListEventsByRange(
  startDate: string,
  endDate: string,
  calendarId?: string,
): Promise<Event[]> {
  if (calendarId) {
    const { data } = await http.get("/auth/getCalendarEvents", {
      params: { calendarId, startDate, endDate },
    });
    return data.data;
  }
  const { data } = await http.get("/auth/getListEvents", {
    params: { startDate, endDate },
  });
  return data.data;
}

export function useGetListEventsByRange(
  startDate: MaybeRef<string>,
  endDate: MaybeRef<string>,
  calendarId?: MaybeRef<string | null>,
) {
  return useQuery<Event[]>({
    queryKey: ["events", startDate, endDate, calendarId ?? "all"],
    queryFn: () =>
      getListEventsByRange(
        toValue(startDate),
        toValue(endDate),
        calendarId != null ? (toValue(calendarId) ?? undefined) : undefined,
      ),
    staleTime: 1000 * 60 * 5,
  });
}
