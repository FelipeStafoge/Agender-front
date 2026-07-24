import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type RemoveParticipantParams = {
  eventId: string;
  userId: string;
};

const removeParticipantRequest = async ({
  eventId,
  userId,
}: RemoveParticipantParams) => {
  const { data } = await http.delete(
    `/auth/removeParticipantInEvent/${eventId}/${userId}`,
  );
  return data;
};

export const useRemoveParticipantInEvent = () => {
  return useMutation({
    mutationFn: removeParticipantRequest,
  });
};
