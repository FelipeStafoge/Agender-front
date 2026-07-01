import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type CreateCalendarParams = {
  form: {
    name: string;
    DefaultColor: string;
    users_ids: string[];
  };
};

const createCalendarRequest = async ({ form }: CreateCalendarParams) => {
  const { data } = await http.post("/auth/createCalendar", form);
  return data;
};

export const useCreateCalendarRequest = () => {
  return useMutation({
    mutationFn: createCalendarRequest,
  });
};
