import http from "@/services/http";

export const useRegisterRequest = async ({
  form,
}: {
  form: { email: string; password: string };
}) => {
  const { data } = await http.post("/auth/register", {
    name: "Felipe Criou a COnta",
    email: form.email,
    password: form.password,
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  return;
};
