<script setup lang="ts">
import { useRegisterRequest } from "@/requests/register";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, reactive, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import Topbar from "@/components/Topbar/index.vue";
import { useGetListEvents } from "@/requests/Events/ListEvents/listEvent";

const getUserEvents = useGetListEvents();

const data = computed(() => getUserEvents.data.value ?? []);
const isPending = computed(() => getUserEvents.isPending.value);
const error = computed(() => getUserEvents.error.value);
</script>

<template>
  <Topbar />
  <div v-if="isPending">Carregando...</div>

  <div v-else-if="error">Erro ao carregar</div>

  <div v-else>
    <div v-for="event in data" :key="event.id">
      {{ event.name }} - {{ event.date }}
    </div>
  </div>
</template>

<style scoped></style>
