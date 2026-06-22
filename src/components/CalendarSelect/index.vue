<script setup lang="ts">
import { ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Topbar from "@/components/Topbar/index.vue";
import { formatDate } from "@/utils/formatDate";
import { useCreateEventRequest } from "@/requests/Events/CreateEvent/createEvent";

const date = ref<Date | null>(null);
const createEvent = useCreateEventRequest;

const handleDateChange = async (value: Date) => {
  try {
    await createEvent({ DateTime: formatDate(value) });
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <Topbar />
  <VueDatePicker v-model="date" @update:model-value="handleDateChange" />

  <p>{{ date }}</p>
</template>
