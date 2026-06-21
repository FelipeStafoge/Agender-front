<script setup lang="ts">
import { useLoginRequest, useRegisterRequest } from "@/requests/register";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import Topbar from "@/components/Topbar/index.vue";

const RegisterinitialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};
</script>

<template>
  <Topbar />
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 100px;
      margin-top: 100px;
    "
  >
    ESSE AQUI É A PAGINA DE PERFIL
  </div>
</template>

<style scoped></style>
