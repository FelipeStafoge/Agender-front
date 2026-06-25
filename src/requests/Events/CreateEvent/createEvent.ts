import { useMutation } from "@tanstack/vue-query";
import http from "@/services/http";

type CreateEventParams = {
  form: {
    name: string;
    date: string;
    color: string;
    users_ids: string[];
  };
};

const createEventRequest = async ({ form }: CreateEventParams) => {
  const { data } = await http.post("/auth/createEvent", form);

  return data;
};

export const useCreateEventRequest = () => {
  return useMutation({
    mutationFn: createEventRequest,
  });
};
