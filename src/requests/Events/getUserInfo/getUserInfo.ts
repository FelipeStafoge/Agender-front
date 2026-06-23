import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";

export const getUserInfo = async ({
  NameWithCode,
}: {
  NameWithCode: string;
}) => {
  const { data } = await http.get("/auth/getUserInfo", {
    params: {
      NameWithCode,
    },
  });

  return data;
};

export const useGetUserInfo = (NameWithCode: string) => {
  return useQuery({
    queryKey: ["getUserInfo", NameWithCode],
    queryFn: () => getUserInfo({ NameWithCode }),
    staleTime: 1000 * 60 * 10,
    enabled: !!NameWithCode,
  });
};
