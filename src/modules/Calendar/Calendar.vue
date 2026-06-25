<script setup lang="ts">
import { ref, computed } from "vue";
import "@vuepic/vue-datepicker/dist/main.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import Calendar from "@/components/CalendarSelect/index.vue";
import { useGetListEvents } from "@/requests/Events/ListEvents/listEvent";

const showModal = ref(false);
const date = ref(new Date());

const { data: events } = useGetListEvents();

const parseEventDate = (dateStr: string): Date => {
  const parts = dateStr.split("/");
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  return new Date(year, month - 1, day);
};

const markers = computed(() => {
  if (!events.value) return [];

  const grouped = new Map<string, any[]>();
  for (const event of events.value) {
    const existing = grouped.get(event.date) || [];
    existing.push(event);
    grouped.set(event.date, existing);
  }

  return Array.from(grouped.entries()).map(([dateStr, dateEvents]) => ({
    date: parseEventDate(dateStr),
    color: dateEvents[0].color || "#7c3aed",
    type: "dot" as const,
    tooltip: dateEvents.map((e: any) => ({
      text: e.name,
      color: e.color || "#7c3aed",
    })),
  }));
});
</script>

<template>
  <div>
    <VueDatePicker
      v-model="date"
      inline
      auto-apply
      :enable-time-picker="false"
      no-today
      :markers="markers"
    />

    <button class="open-modal-btn" @click="showModal = true">
      Novo Evento
    </button>

    <Calendar v-model:visible="showModal" />
  </div>
</template>

<style scoped>
.open-modal-btn {
  margin: 16px;
  padding: 12px 24px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

:deep(.dp--marker-base) {
  height: 100% !important;
  width: 100% !important;
  top: 0 !important;
  left: 0 !important;
  border-radius: 0 !important;
  transform: none !important;
  opacity: 0.3;
}

:deep(.dp--tp-wrap) {
  display: none !important;
}
</style>
