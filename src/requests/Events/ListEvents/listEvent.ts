import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";
import type { Event } from "@/types/api";

export const getListEvents = async (): Promise<Event[]> => {
  const { data } = await http.get("/auth/getListEvents");
  return data.data;
};

export const useGetListEvents = () => {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getListEvents,
    staleTime: 1000 * 60 * 10,
  });
};
