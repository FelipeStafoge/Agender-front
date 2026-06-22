import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";

export const getListEvents = async () => {
  const { data } = await http.get("/auth/getListEvents");
  return data.data;
};

export const useGetListEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getListEvents,
    staleTime: 1000 * 60 * 10,
  });
};
