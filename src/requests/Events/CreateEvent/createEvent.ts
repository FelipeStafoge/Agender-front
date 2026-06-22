import http from "@/services/http";

export const useCreateEventRequest = async ({
  DateTime,
}: {
  DateTime: string;
}) => {
  const { data } = await http.post("/auth/createEvent", {
    DateTime,
  });

  return data;
};
