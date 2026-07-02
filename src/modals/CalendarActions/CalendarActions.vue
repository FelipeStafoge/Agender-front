<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import type { Calendar, Event } from "@/types/api";
import { useLeaveCalendarRequest } from "@/requests/Calendar/leaveCalendar";
import { useDeleteCalendarRequest } from "@/requests/Calendar/deleteCalendar";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, ref } from "vue";

const props = defineProps<{
  visible: boolean;
  calendar: Calendar | null;
  events: Event[];
}>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const queryClient = useQueryClient();
const leaveCalendar = useLeaveCalendarRequest();
const deleteCalendar = useDeleteCalendarRequest();
const auth = useAuth();
const submitError = ref("");
const activeTab = ref<"overview" | "people" | "edit">("overview");

const close = () => {
  submitError.value = "";
  emit("update:visible", false);
};

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const isOwner = computed(() => {
  if (!props.calendar) return false;
  return props.calendar.participants.some(
    (p) => p.userId === auth.getUser?.account_id && p.role === "Owner",
  );
});

const handleLeave = async () => {
  if (!props.calendar) return;
  submitError.value = "";
  try {
    await leaveCalendar.mutateAsync(props.calendar.id);
    queryClient.invalidateQueries({ queryKey: ["listCalendar"] });
    close();
  } catch {
    submitError.value = "Erro ao sair do calendário. Tente novamente.";
  }
};

const handleDelete = async () => {
  if (!props.calendar) return;
  submitError.value = "";
  try {
    await deleteCalendar.mutateAsync(props.calendar.id);
    queryClient.invalidateQueries({ queryKey: ["listCalendar"] });
    close();
  } catch {
    submitError.value = "Erro ao deletar calendário. Tente novamente.";
  }
};
</script>

<template>
  <div v-if="visible && calendar" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'overview' }]"
            @click="activeTab = 'overview'"
          >
            Visão Geral
          </button>
          <button
            :class="['tab', { active: activeTab === 'people' }]"
            @click="activeTab = 'people'"
          >
            Pessoas
          </button>
          <button
            :class="['tab', { active: activeTab === 'edit' }]"
            @click="activeTab = 'edit'"
          >
            Edição
          </button>
        </div>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <p v-if="submitError" class="error-text">{{ submitError }}</p>

      <div class="tab-body">
        <div v-if="activeTab === 'overview'" class="tab-content">
          <div v-if="events.length === 0" class="empty-state">
            Nenhum evento neste calendário.
          </div>
          <div v-else class="list">
            <div v-for="event in events" :key="event.id" class="list-item">
              <strong>{{ event.name }}</strong> - {{ event.date }}
              <p v-if="event.description" class="event-description">{{ event.description }}</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'people'" class="tab-content">
          <div v-if="calendar.participants.length === 0" class="empty-state">
            Nenhum participante neste calendário.
          </div>
          <div v-else class="list">
            <div
              v-for="participant in calendar.participants"
              :key="participant.userId"
              class="list-item"
            >
              {{ participant.name }} -
              {{ participant.role === "Owner" ? "Proprietário" : "Membro" }}
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'edit'" class="tab-content edit-tab">
          <button
            class="action-btn leave-btn"
            :disabled="leaveCalendar.isPending.value"
            @click="handleLeave"
          >
            {{
              leaveCalendar.isPending.value
                ? "Saindo..."
                : "SAIR DO CALENDÁRIO"
            }}
          </button>

          <button
            v-if="isOwner"
            class="action-btn delete-btn"
            :disabled="deleteCalendar.isPending.value"
            @click="handleDelete"
          >
            {{
              deleteCalendar.isPending.value
                ? "Deletando..."
                : "DELETAR CALENDÁRIO"
            }}
          </button>
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

.tabs {
  display: flex;
}

.tab {
  padding: 10px 16px;
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

.tab.active {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
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

.tab-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-tab {
  align-items: center;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
}

.action-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.leave-btn {
  background: #6b7280;
  color: #fff;
}

.delete-btn {
  background: #e53e3e;
  color: #fff;
}

.error-text {
  color: #e53e3e;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}
</style>
