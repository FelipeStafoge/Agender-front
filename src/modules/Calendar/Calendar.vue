<script setup lang="ts">
import { ref, computed, watch } from "vue";
import "@vuepic/vue-datepicker/dist/main.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import NewEventModal from "@/modals/NewEvent/NewEvent.vue";
import NewCalendarModal from "@/modals/NewCalendar/NewCalendar.vue";
import CalendarActionsModal from "@/modals/CalendarActions/CalendarActions.vue";
import { useGetListEvents } from "@/requests/Events/ListEvents/listEvent";
import { useGetListCalendars } from "@/requests/Calendar/getListCalendar";
import { useAuth } from "@/utils/Authentication/auth";
import type { Event, Calendar } from "@/types/api";

const showCreateEventModal = ref(false);
const showCreateAgenderModal = ref(false);
const showCalendarActions = ref(false);
const selectedCalendar = ref<Calendar | null>(null);
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

const auth = useAuth();

const openCalendarActions = (calendar: Calendar) => {
  selectedCalendar.value = calendar;
  showCalendarActions.value = true;
};

const openGroupEventModal = (calendar: Calendar, selectedDate: Date) => {
  selectedCalendarId.value = calendar.id;
  selectedCalendarColor.value = calendar.color || "#7c3aed";
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
  <div class="container">
    <div class="left-panel">
      <VueDatePicker
        class="calendar-custom"
        v-model="date"
        inline
        auto-apply
        :enable-time-picker="false"
        no-today
        :markers="markers"
      />
    </div>

    <div class="center-divider">
      <div class="center-buttons">
        <button class="open-modal-btn" @click="openPersonalEventModal">
          Novo Evento
        </button>
        <button class="open-modal-btn" @click="showCreateAgenderModal = true">
          Novo Calendário
        </button>
      </div>
    </div>

    <div class="right-panel">
      <div class="calendar-grid">
        <div
          v-for="calendar in calendars.slice(0, 6)"
          :key="calendar.id"
          class="calendar-card"
        >
          <div class="calendar-header">
            <p>{{ calendar.name }}</p>
            <button class="more-button" @click="openCalendarActions(calendar)">
              ...
            </button>
          </div>

          <VueDatePicker
            v-model="calendarDates[calendar.id]"
            inline
            no-today
            auto-apply
            :markers="createMarkers(eventsByCalendarId[calendar.id] || [])"
            @update:model-value="(d: Date) => openGroupEventModal(calendar, d)"
          />
        </div>
      </div>
    </div>

    <CalendarActionsModal
      v-model:visible="showCalendarActions"
      :calendar="selectedCalendar"
      :events="eventsByCalendarId[selectedCalendar?.id ?? ''] || []"
    />
    <NewCalendarModal v-model:visible="showCreateAgenderModal" />
    <NewEventModal
      v-model:visible="showCreateEventModal"
      :calendar-id="selectedCalendarId"
      :calendar-color="selectedCalendarColor"
      :calendars="calendars"
      :initial-date="selectedCalendarDate"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: calc(100vh - 64px);
}

.calendar-custom :deep(.dp--outer-menu-wrap) {
  width: 500px;
}

.left-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-divider {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.center-divider::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #d0d0d0;
  z-index: 0;
}

.center-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
  padding: 60px 0;
}

.open-modal-btn {
  padding: 12px 24px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
}

.right-panel {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-content: start;
}

.calendar-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.role-badge {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 600;
}
</style>
