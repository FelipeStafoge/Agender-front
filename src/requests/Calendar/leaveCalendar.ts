import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

const leaveCalendarRequest = async (calendarId: string) => {
  const { data } = await http.post(`/auth/leaveCalendar/${calendarId}`);
  return data;
};

export const useLeaveCalendarRequest = () => {
  return useMutation({
    mutationFn: leaveCalendarRequest,
  });
};
