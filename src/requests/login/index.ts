import http from "@/services/http";

export const useLoginRequest = async ({
  form,
}: {
  form: { email: string; password: string };
}) => {
  const { data } = await http.post("/auth/login", {
    email: form.email,
    password: form.password,
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  return;
};
