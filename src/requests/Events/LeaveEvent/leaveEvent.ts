import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

const leaveEventRequest = async (eventId: string) => {
  const { data } = await http.post(`/auth/leaveEvent/${eventId}`);
  return data;
};

export const useLeaveEventRequest = () => {
  return useMutation({
    mutationFn: leaveEventRequest,
  });
};
