<script setup lang="ts">
import { ref, computed, watch } from "vue";
import "@vuepic/vue-datepicker/dist/main.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import NewEventModal from "@/modals/NewEvent/NewEvent.vue";
import NewCalendarModal from "@/modals/NewCalendar/NewCalendar.vue";
import { useGetListEvents } from "@/requests/Events/ListEvents/listEvent";
import { useGetListCalendars } from "@/requests/Calendar/getListCalendar";
import type { Event, Calendar } from "@/types/api";

const showCreateEventModal = ref(false);
const showCreateAgenderModal = ref(false);
const date = ref(new Date());
const calendarDates = ref<Record<string | number, Date>>({});
const selectedCalendarId = ref<string | number | null>(null);
const selectedCalendarColor = ref<string>("#7c3aed");
const selectedCalendarDate = ref<Date | null>(null);

const listEvents = useGetListEvents();
const listCalendars = useGetListCalendars();
const calendars = computed(() => listCalendars.data.value ?? []);
watch(
  calendars,
  (newCalendars) => {
    const dates: Record<string | number, Date> = {};
    for (const cal of newCalendars) {
      dates[cal.id] = calendarDates.value[cal.id] ?? new Date();
    }
    calendarDates.value = dates;
  },
  { immediate: true },
);

const parseEventDate = (dateStr: string): Date => {
  const parts = dateStr.split("/");
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  return new Date(year, month - 1, day);
};

const createMarkers = (events: Event[] = []) => {
  const grouped = new Map<string, any[]>();

  for (const event of events) {
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

const markers = computed(() => createMarkers(listEvents.data.value));

const eventsByCalendarId = computed(() => {
  const events = listEvents.data.value ?? [];
  const map: Record<string | number, Event[]> = {};
  for (const e of events) {
    const cid = e.calendarId;
    if (cid != null) {
      if (!map[cid]) map[cid] = [];
      map[cid].push(e);
    }
  }
  return map;
});

const openGroupEventModal = (calendar: Calendar, selectedDate: Date) => {
  selectedCalendarId.value = calendar.id;
  selectedCalendarColor.value = calendar.DefaultColor || "#7c3aed";
  selectedCalendarDate.value = selectedDate;
  showCreateEventModal.value = true;
};

const openPersonalEventModal = () => {
  selectedCalendarId.value = null;
  selectedCalendarColor.value = "#7c3aed";
  selectedCalendarDate.value = null;
  showCreateEventModal.value = true;
};
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

    <button class="open-modal-btn" @click="openPersonalEventModal">
      Novo Evento
    </button>

    <button class="open-modal-btn" @click="showCreateAgenderModal = true">
      Novo calendario
    </button>

    <NewEventModal
      v-model:visible="showCreateEventModal"
      :calendar-id="selectedCalendarId"
      :calendar-color="selectedCalendarColor"
      :calendars="calendars"
      :initial-date="selectedCalendarDate"
    />
    <div v-for="calendar in calendars" :key="calendar.id">
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background-color: aqua;
          width: fit-content;
          height: fit-content;
        "
        id="{{calendar.id}}"
      >
        <div class="calendar-header">
          <p>{{ calendar.name }}</p>

          <button class="close-button">✕</button>
        </div>
        <div class="participants">
          <div
            v-for="p in calendar.participants"
            :key="p.userId"
            class="participant"
          >
            <span>{{ p.name }}</span>
            <span class="role-badge">{{ p.role === 'Owner' ? 'Dono' : 'Membro' }}</span>
          </div>
        </div>
        <VueDatePicker
          v-model="calendarDates[calendar.id]"
          inline
          no-today
          :markers="createMarkers(eventsByCalendarId[calendar.id] || [])"
          @update:model-value="(d: Date) => openGroupEventModal(calendar, d)"
        />
      </div>
    </div>

    <NewCalendarModal v-model:visible="showCreateAgenderModal" />
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

.close-button {
  position: absolute;
  right: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  font-size: 18px;
}

.participants {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 8px 0;
}

.participant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.role-badge {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 600;
}
</style>
