import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type AddParticipantParams = {
  eventId: string;
  userId: string;
};

const addParticipantRequest = async ({
  eventId,
  userId,
}: AddParticipantParams) => {
  const { data } = await http.post(
    `/auth/addParticipantInEvent/${eventId}`,
    { userId },
  );
  return data;
};

export const useAddParticipantInEvent = () => {
  return useMutation({
    mutationFn: addParticipantRequest,
  });
};
