import { useMutation } from "@tanstack/vue-query";
import http from "@/services/http";

type CreateEventParams = {
  form: {
    name: string;
    dates: string[];
    description?: string | null;
    color: string;
    users_ids: string[];
    calendar_id?: string | number | null;
  };
};

const createEventRequest = async ({ form }: CreateEventParams) => {
  const payload = {
    ...form,
    dates: form.dates.map((d) => new Date(d).toISOString()),
  };
  const { data } = await http.post("/auth/createEvent", payload);

  return data;
};

export const useCreateEventRequest = () => {
  return useMutation({
    mutationFn: createEventRequest,
  });
};
