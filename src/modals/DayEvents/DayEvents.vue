<script setup lang="ts">
import type { Event, Calendar } from "@/types/api";
import { computed } from "vue";

const props = defineProps<{
  visible: boolean;
  events: Event[];
  calendars: Calendar[];
  dayDate: Date | null;
  contextCalendarId: string | null;
}>();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "create-event"): void;
}>();

const close = () => {
  emit("update:visible", false);
};

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const calendarMap = computed(() => {
  const map = new Map<string, Calendar>();
  for (const cal of props.calendars) {
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
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Eventos do Dia</h2>
        <button class="create-event-btn" @click="emit('create-event')">
          Criar Evento
        </button>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="tab-body">
        <div v-for="event in events" :key="event.id" class="event-card">
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
          <p v-if="event.description" class="event-description">
            {{ event.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  width: 1000px;
  height: 700px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  padding: 10px 0;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.create-event-btn {
  margin-left: 16px;
  padding: 8px 16px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.create-event-btn:hover {
  background: #6d28d9;
}

.tab-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
