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

  return;
};

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
  return;
};
