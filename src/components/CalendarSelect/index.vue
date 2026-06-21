<script setup lang="ts">
import { ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Topbar from "@/components/Topbar/index.vue";

const date = ref<Date | null>(null);
</script>

<template>
  <Topbar />
  <VueDatePicker v-model="date" />

  <p>{{ date }}</p>
</template>
