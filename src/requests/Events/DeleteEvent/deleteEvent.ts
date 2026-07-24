import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

const deleteEventRequest = async (eventId: string) => {
  const { data } = await http.delete(`/auth/deleteEvent/${eventId}`);
  return data;
};

export const useDeleteEventRequest = () => {
  return useMutation({
    mutationFn: deleteEventRequest,
  });
};
