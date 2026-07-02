<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useGetListEventsByRange } from "@/requests/Events/ListEventsByRange/listEventsByRange";
import type { Event, Calendar } from "@/types/api";

const props = defineProps<{
  calendar: Calendar;
  windowStart: string;
  windowEnd: string;
  modelValue: Date;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Date): void;
  (e: "day-click", calendar: Calendar, date: Date, dayEvents: Event[]): void;
  (e: "open-actions", calendar: Calendar, events: Event[]): void;
}>();

const date = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    date.value = val;
  },
);

watch(date, (val) => {
  emit("update:modelValue", val);
});

const listEvents = useGetListEventsByRange(
  () => props.windowStart,
  () => props.windowEnd,
  () => props.calendar.id,
);

const events = computed<Event[]>(() => listEvents.data.value ?? []);

const parseEventDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const createMarkers = (evts: Event[] = []) => {
  const grouped = new Map<string, Event[]>();
  for (const event of evts) {
    const existing = grouped.get(event.date) || [];
    existing.push(event);
    grouped.set(event.date, existing);
  }
  return Array.from(grouped.entries()).map(([dateStr, dateEvents]) => ({
    date: parseEventDate(dateStr),
    color: dateEvents[0].color || "#7c3aed",
    type: "dot" as const,
    tooltip: dateEvents.map((e) => ({
      text: e.name,
      color: e.color || "#7c3aed",
    })),
  }));
};

const markers = computed(() => createMarkers(events.value));

const formatDateStr = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const onDayClick = (d: Date) => {
  const dateStr = formatDateStr(d);
  const dayEvents = events.value.filter((e) => e.date === dateStr);
  emit("day-click", props.calendar, d, dayEvents);
};

const onOpenActions = () => {
  emit("open-actions", props.calendar, events.value);
};
</script>

<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <p>{{ calendar.name }}</p>
      <button class="more-button" @click="onOpenActions">...</button>
    </div>

    <VueDatePicker
      v-model="date"
      inline
      no-today
      auto-apply
      :markers="markers"
      @date-click="onDayClick"
    />
  </div>
</template>

<style scoped>
.calendar-card {
  background: #eef2ff;
  border-radius: 8px;
  padding: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
}

.calendar-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.calendar-header p {
  margin: 0;
}

.more-button {
  position: absolute;
  right: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  line-height: 1;
  color: #555;
}
</style>
