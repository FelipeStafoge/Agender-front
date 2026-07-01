import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";
import type { Calendar } from "@/types/api";

export const getListCalendars = async (): Promise<Calendar[]> => {
  const { data } = await http.get("/auth/getListCalendar");
  return data.data;
};

export const useGetListCalendars = () => {
  return useQuery<Calendar[]>({
    queryKey: ["listCalendar"],
    queryFn: getListCalendars,
    staleTime: 1000 * 60 * 10,
  });
};
