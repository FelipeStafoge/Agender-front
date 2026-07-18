<script setup lang="ts">
import { ref, computed, watch } from "vue";
import "@vuepic/vue-datepicker/dist/main.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import NewEventModal from "@/modals/NewEvent/NewEvent.vue";
import NewCalendarModal from "@/modals/NewCalendar/NewCalendar.vue";
import CalendarActionsModal from "@/modals/CalendarActions/CalendarActions.vue";
import DayEventsModal from "@/modals/DayEvents/DayEvents.vue";
import CalendarCard from "@/components/CalendarCard.vue";
import SectionHeader from "@/components/SectionHeader.vue";
import { useGetListEventsByRange } from "@/requests/Events/ListEventsByRange/listEventsByRange";
import { useGetListCalendars } from "@/requests/Calendar/getListCalendar";
import { formatDate } from "@/utils/formatDate";
import type { Event, Calendar } from "@/types/api";

const showCreateEventModal = ref(false);
const showCreateAgenderModal = ref(false);
const showCalendarActions = ref(false);
const selectedCalendar = ref<Calendar | null>(null);
const selectedCalendarEvents = ref<Event[]>([]);
const date = ref(new Date());
const calendarDates = ref<Record<string | number, Date>>({});
const selectedCalendarId = ref<string | number | null>(null);
const selectedCalendarColor = ref<string>("#7c3aed");
const selectedCalendarDate = ref<Date | null>(null);
const showDayEventsModal = ref(false);
const selectedDayEvents = ref<Event[]>([]);
const selectedDayEventsDate = ref<Date | null>(null);
const selectedDayEventsContextCalendarId = ref<string | null>(null);

const windowStart = computed(() => {
  const d = new Date(date.value);
  d.setDate(1);
  return formatDate(d);
});

const windowEnd = computed(() => {
  const d = new Date(date.value.getFullYear(), date.value.getMonth() + 2, 0);
  return formatDate(d);
});

const listEvents = useGetListEventsByRange(windowStart, windowEnd);
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
  const [day = 1, month = 1, year = 2000] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const createMarkers = (events: Event[] = []) => {
  const grouped = new Map<string, Event[]>();
  for (const event of events) {
    const existing = grouped.get(event.date) || [];
    existing.push(event);
    grouped.set(event.date, existing);
  }
  return Array.from(grouped.entries()).map(([dateStr, dateEvents]) => ({
    date: parseEventDate(dateStr),
    color: dateEvents[0]?.color || "#7c3aed",
    type: "dot" as const,
    tooltip: dateEvents.map((e) => ({
      text: e.name,
      color: e.color || "#7c3aed",
    })),
  }));
};

const markers = computed(() => createMarkers(listEvents.data.value));

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

const onMainDayClick = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dateStr = `${day}/${month}/${d.getFullYear()}`;
  const events = (listEvents.data.value ?? []).filter(
    (e) => e.date === dateStr,
  );
  if (events.length > 0) {
    selectedDayEvents.value = events;
    selectedDayEventsDate.value = d;
    selectedDayEventsContextCalendarId.value = null;
    showDayEventsModal.value = true;
  } else {
    selectedCalendarId.value = null;
    selectedCalendarColor.value = "#7c3aed";
    selectedCalendarDate.value = d;
    showCreateEventModal.value = true;
  }
};

const onCalendarDayClick = (
  calendar: Calendar,
  d: Date,
  dayEvents: Event[],
) => {
  if (dayEvents.length > 0) {
    selectedDayEvents.value = dayEvents;
    selectedDayEventsDate.value = d;
    selectedDayEventsContextCalendarId.value = calendar.id;
    showDayEventsModal.value = true;
  } else {
    openGroupEventModal(calendar, d);
  }
};

const onOpenCalendarActions = (calendar: Calendar, events: Event[]) => {
  selectedCalendar.value = calendar;
  selectedCalendarEvents.value = events;
  showCalendarActions.value = true;
};

const handleCreateFromDayEvents = () => {
  const calId = selectedDayEventsContextCalendarId.value;
  showDayEventsModal.value = false;
  if (calId) {
    const cal = calendars.value.find((c) => c.id === calId);
    selectedCalendarId.value = calId;
    selectedCalendarColor.value = cal?.color || "#7c3aed";
  } else {
    selectedCalendarId.value = null;
    selectedCalendarColor.value = "#7c3aed";
  }
  selectedCalendarDate.value = selectedDayEventsDate.value;
  showCreateEventModal.value = true;
};
</script>

<template>
  <div class="page-wrapper">
    <div class="container">
      <div class="left-panel">
        <div class="left-content">
          <SectionHeader
            class="events-header"
            title="Seus eventos"
            subtitle="Aqui você encontra todos os seus eventos, tanto os eventos individuais quanto os eventos pertencentes aos calendários dos quais você participa."
          />
          <VueDatePicker
            class="calendar-custom"
            v-model="date"
            inline
            auto-apply
            :enable-time-picker="false"
            no-today
            :markers="markers"
            @date-click="onMainDayClick"
          />
          <button
            class="open-modal-btn novo-evento-btn"
            @click="openPersonalEventModal"
          >
            Novo Evento
          </button>
        </div>
      </div>

      <div class="center-divider-line"></div>

      <div class="right-panel">
        <div class="calendars-header">
          <button
            class="open-modal-btn create-calendar-btn"
            @click="showCreateAgenderModal = true"
          >
            Novo Calendário
          </button>
          <SectionHeader
            title="Calendários"
            subtitle="Crie calendários separados para organizar melhor seus eventos e compartilhá-los com outros participantes."
          />
        </div>
        <div class="calendar-grid">
          <CalendarCard
            v-for="cal in calendars.slice(0, 6)"
            :key="cal.id"
            :model-value="calendarDates[cal.id] ?? new Date()"
            @update:model-value="(val: Date) => (calendarDates[cal.id] = val)"
            :calendar="cal"
            :window-start="windowStart"
            :window-end="windowEnd"
            @day-click="onCalendarDayClick"
            @open-actions="onOpenCalendarActions"
          />
        </div>
      </div>
    </div>

    <CalendarActionsModal
      v-model:visible="showCalendarActions"
      :calendar="selectedCalendar"
      :events="selectedCalendarEvents"
    />
    <NewCalendarModal v-model:visible="showCreateAgenderModal" />
    <NewEventModal
      v-model:visible="showCreateEventModal"
      :calendar-id="selectedCalendarId"
      :calendar-color="selectedCalendarColor"
      :calendars="calendars"
      :initial-date="selectedCalendarDate"
    />
    <DayEventsModal
      v-model:visible="showDayEventsModal"
      :events="selectedDayEvents"
      :calendars="calendars"
      :day-date="selectedDayEventsDate"
      :context-calendar-id="selectedDayEventsContextCalendarId"
      @create-event="handleCreateFromDayEvents"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.events-header {
  text-align: center;
  padding-top: 24px;
}

.events-header :deep(.section-subtitle) {
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
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

.left-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
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

.open-modal-btn:hover {
  background: #6d28d9;
}

.right-panel {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.calendars-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.center-divider-line {
  width: 1px;
  background: #d0d0d0;
  flex-shrink: 0;
}

.create-calendar-btn {
  display: block;
  width: fit-content;
  flex-shrink: 0;
  margin-left: 16px;
}

.novo-evento-btn {
  width: fit-content;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-content: start;
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

.role-badge {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-wrapper {
    height: auto;
    min-height: 100%;
  }

  .container {
    flex-direction: column;
    flex: none;
  }

  .events-header {
    text-align: left;
    padding: 16px 16px 0;
  }

  .events-header :deep(.section-subtitle) {
    max-width: none;
  }

  .events-header :deep(.title-row) {
    justify-content: center;
  }

  .calendar-custom :deep(.dp--outer-menu-wrap) {
    width: 100% !important;
  }

  .left-panel {
    padding: 16px 16px 0;
  }

  .left-content {
    align-items: center;
    width: 100%;
  }

  .novo-evento-btn {
    width: 100%;
  }

  .center-divider-line {
    width: 100%;
    height: 1px;
    margin: 16px 0;
  }

  .right-panel {
    padding: 0 16px 24px;
    overflow-y: visible;
  }

  .calendars-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .create-calendar-btn {
    width: 100%;
    margin-left: 0;
  }

  .calendar-grid {
    grid-template-columns: 1fr;
  }
}
</style>
