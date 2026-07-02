import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type AddParticipantParams = {
  calendarId: string;
  userId: string;
};

const addParticipantRequest = async ({
  calendarId,
  userId,
}: AddParticipantParams) => {
  const { data } = await http.post(
    `/auth/addParticipantInCalendar/${calendarId}`,
    { userId },
  );
  return data;
};

export const useAddParticipantInCalendar = () => {
  return useMutation({
    mutationFn: addParticipantRequest,
  });
};
