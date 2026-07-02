import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type RemoveParticipantParams = {
  calendarId: string;
  userId: string;
};

const removeParticipantRequest = async ({
  calendarId,
  userId,
}: RemoveParticipantParams) => {
  const { data } = await http.delete(
    `/auth/removeParticipantInCalendar/${calendarId}/${userId}`,
  );
  return data;
};

export const useRemoveParticipantInCalendar = () => {
  return useMutation({
    mutationFn: removeParticipantRequest,
  });
};
