import http from "@/services/http";

export const useCreateEventRequest = async ({
  form,
}: {
  form: {
    name: string;
    date: string;
    creator_id: string;
    users_ids: string[];
  };
}) => {
  const { data } = await http.post("/auth/createEvent", {
    form,
  });

  return data;
};
