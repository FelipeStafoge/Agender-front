<script setup lang="ts">
import { useLoginRequest } from "@/requests/login";
import { useRegisterRequest } from "@/requests/register";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

const RegisterinitialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const loginMutation = useLoginRequest();
const registerMutation = useRegisterRequest();
const route = useRoute();
const router = useRouter();
const Registerform = reactive({ ...RegisterinitialForm });

const LogininitialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

const Loginform = reactive({ ...LogininitialForm });

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleLogin = async (form: { email: string; password: string }) => {
  if (!isValidEmail(form.email)) return;

  try {
    await loginMutation.mutateAsync({ form });

    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } catch (error) {
    console.log(error);
  }
};

const handleRegister = async (form: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    await registerMutation.mutateAsync({ form });

    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 100px;
      margin-top: 100px;
    "
  >
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      "
    >
      <h1>Register</h1>
      <input
        v-model="Registerform.name"
        placeholder="Nome"
        style="margin-bottom: 5px"
      />
      <input
        v-model="Registerform.email"
        placeholder="Email"
        style="margin-bottom: 5px"
      />
      <input
        v-model="Registerform.password"
        type="password"
        placeholder="Senha"
        style="margin-bottom: 5px"
      />
      <input
        v-model="Registerform.confirmPassword"
        type="password"
        placeholder="Confirme a senha"
        style="margin-bottom: 5px"
      />
      <button @click="handleRegister(Registerform)">Sign Up</button>
    </div>

    <div style="background-color: black; height: 100px; width: 10px"></div>

    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      "
    >
      <h1>Login</h1>
      <input
        v-model="Loginform.email"
        placeholder="Email"
        style="margin-bottom: 5px"
      />
      <input
        v-model="Loginform.password"
        type="password"
        placeholder="Senha"
        style="margin-bottom: 5px"
      />

      <button @click="handleLogin(Loginform)">Login</button>
    </div>
  </div>
</template>

<style scoped></style>
