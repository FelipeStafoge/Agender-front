import { useMutation } from "@tanstack/vue-query";
import http from "@/services/http";

type RegisterParams = {
  form: {
    name: string;
    email: string;
    password: string;
  };
};

const registerRequest = async ({ form }: RegisterParams) => {
  const { data } = await http.post("/auth/register", {
    name: form.name,
    email: form.email,
    password: form.password,
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  return data;
};

export const useRegisterRequest = () => {
  return useMutation({
    mutationFn: registerRequest,
  });
};
