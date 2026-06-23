import { useMutation } from "@tanstack/vue-query";
import http from "@/services/http";
import { useAuth } from "@/utils/Authentication/auth";

type LoginParams = {
  form: {
    email: string;
    password: string;
  };
};

const loginRequest = async ({ form }: LoginParams) => {
  const { data } = await http.post("/auth/login", {
    email: form.email,
    password: form.password,
  });
  const { setUser } = useAuth();
  setUser({
    userCode: data.data.userCode,
    userEmail: data.data.email,
    userName: data.data.userName,
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  return data;
};

export const useLoginRequest = () => {
  return useMutation({
    mutationFn: loginRequest,
  });
};
