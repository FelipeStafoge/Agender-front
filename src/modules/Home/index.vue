<script setup lang="ts">
import { useRegisterRequest } from "@/requests/register";
import http from "@/services/http";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import Topbar from "@/components/Topbar/index.vue";

const router = useRouter();
</script>

<template>
  <Topbar />

  <div>AQUI É A HOME OFICIAL</div>
</template>

<style scoped></style>
