import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

const deleteCalendarRequest = async (calendarId: string) => {
  const { data } = await http.delete(`/auth/deleteCalendar/${calendarId}`);
  return data;
};

export const useDeleteCalendarRequest = () => {
  return useMutation({
    mutationFn: deleteCalendarRequest,
  });
};
