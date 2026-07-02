<script setup lang="ts">
import { computed, ref } from "vue";
import { useGetListEventsByRange } from "@/requests/Events/ListEventsByRange/listEventsByRange";
import { useGetListCalendars } from "@/requests/Calendar/getListCalendar";
import type { Event, Calendar } from "@/types/api";

const props = withDefaults(
  defineProps<{
    startDate: string;
    endDate: string;
    calendarId?: string | null;
    width?: string;
    maxHeight?: string;
    filterFn?: (event: Event) => boolean;
  }>(),
  {
    calendarId: null,
    width: "600px",
    maxHeight: "430px",
    filterFn: undefined,
  },
);

const activeTab = ref<"24h" | "7d" | "30d">("24h");

const getUserEvents = useGetListEventsByRange(
  () => props.startDate,
  () => props.endDate,
  () => props.calendarId,
);
const getUserCalendars = useGetListCalendars();

const events = computed<Event[]>(() => getUserEvents.data.value ?? []);
const calendars = computed<Calendar[]>(() => getUserCalendars.data.value ?? []);
const isPending = computed(
  () => getUserEvents.isPending.value || getUserCalendars.isPending.value,
);
const error = computed(
  () => getUserEvents.error.value || getUserCalendars.error.value,
);

const calendarMap = computed(() => {
  const map = new Map<string, Calendar>();
  for (const cal of calendars.value) {
    map.set(cal.id, cal);
  }
  return map;
});

const getCalendarInfo = (calendarId: string | null) => {
  if (calendarId === null) return { name: "Pessoal", color: "#7c3aed" };
  const cal = calendarMap.value.get(calendarId);
  return cal
    ? { name: cal.name, color: cal.color || "#7c3aed" }
    : { name: "Desconhecido", color: "#7c3aed" };
};

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const filteredEvents = computed<Event[]>(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const cutoff = new Date(now);

  switch (activeTab.value) {
    case "24h":
      cutoff.setDate(cutoff.getDate() + 1);
      break;
    case "7d":
      cutoff.setDate(cutoff.getDate() + 7);
      break;
    case "30d":
      cutoff.setDate(cutoff.getDate() + 30);
      break;
  }

  let filtered = events.value.filter((event) => {
    const eventDate = parseDate(event.date);
    return eventDate >= now && eventDate <= cutoff;
  });

  if (props.filterFn) {
    filtered = filtered.filter(props.filterFn);
  }

  return filtered;
});

const tabs = [
  { key: "24h" as const, label: "24H" },
  { key: "7d" as const, label: "7 Dias" },
  { key: "30d" as const, label: "30 Dias" },
];

const emptyMessage = computed(() => {
  switch (activeTab.value) {
    case "24h":
      return "Nenhum evento nas próximas 24 horas.";
    case "7d":
      return "Nenhum evento nos próximos 7 dias.";
    case "30d":
      return "Nenhum evento nos próximos 30 dias.";
  }
});
</script>

<template>
  <div class="events-panel" :style="{ width, maxHeight }">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="isPending" class="state-message">Carregando...</div>

    <div v-else-if="error" class="state-message state-error">
      Erro ao carregar eventos
    </div>

    <div v-else class="events-list">
      <div v-if="filteredEvents.length === 0" class="state-message">
        {{ emptyMessage }}
      </div>

      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card"
      >
        <div class="event-header">
          <span class="event-name">{{ event.name }}</span>
          <span
            class="calendar-tag"
            :style="{
              backgroundColor: getCalendarInfo(event.calendarId).color + '1a',
              color: getCalendarInfo(event.calendarId).color,
            }"
          >
            <span
              class="calendar-dot"
              :style="{
                backgroundColor: getCalendarInfo(event.calendarId).color,
              }"
            ></span>
            {{ getCalendarInfo(event.calendarId).name }}
          </span>
        </div>
        <div class="event-date">{{ event.date }}</div>
        <p v-if="event.description" class="event-description">
          {{ event.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-panel {
  background: #fff;
  border: 1px solid #6bacea;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
}

.state-message {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 0;
}

.state-error {
  color: #e53e3e;
}

.events-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.event-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.event-date {
  font-size: 13px;
  color: #6b7280;
}

.calendar-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.calendar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
</style>
