<script setup lang="ts">
import { computed, ref } from "vue";
import type { Event } from "@/types/api";
import { useQueryClient } from "@tanstack/vue-query";
import { useAuth } from "@/utils/Authentication/auth";
import { useLeaveEventRequest } from "@/requests/Events/LeaveEvent/leaveEvent";
import { useDeleteEventRequest } from "@/requests/Events/DeleteEvent/deleteEvent";
import { useAddParticipantInEvent } from "@/requests/Events/AddParticipant/addParticipantInEvent";
import { useRemoveParticipantInEvent } from "@/requests/Events/RemoveParticipant/removeParticipantInEvent";
import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";

const props = defineProps<{ visible: boolean; event: Event | null }>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const queryClient = useQueryClient();
const leaveEvent = useLeaveEventRequest();
const deleteEvent = useDeleteEventRequest();
const addParticipant = useAddParticipantInEvent();
const removeParticipant = useRemoveParticipantInEvent();
const auth = useAuth();
const submitError = ref("");
const activeTab = ref<"info" | "people" | "edit">("info");

const userInput = ref("");
const userSearchError = ref("");
const addError = ref("");

const currentUserId = computed(() => auth.getUser?.account_id);

const close = () => {
  submitError.value = "";
  userInput.value = "";
  userSearchError.value = "";
  addError.value = "";
  emit("update:visible", false);
};

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const isOwner = computed(() => {
  if (!props.event) return false;
  return props.event.participants.some(
    (p) => p.userId === auth.getUser?.account_id && p.role === "Owner",
  );
});

const handleLeave = async () => {
  if (!props.event) return;
  submitError.value = "";
  try {
    await leaveEvent.mutateAsync(props.event.id);
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["listCalendar"] });
    close();
  } catch {
    submitError.value = "Erro ao sair do evento. Tente novamente.";
  }
};

const handleDelete = async () => {
  if (!props.event) return;
  submitError.value = "";
  try {
    await deleteEvent.mutateAsync(props.event.id);
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["listCalendar"] });
    close();
  } catch {
    submitError.value = "Erro ao deletar evento. Tente novamente.";
  }
};

const handleAddParticipant = async () => {
  if (!userInput.value || !props.event) return;

  userSearchError.value = "";
  addError.value = "";

  try {
    const user = await getUserInfo({ NameWithCode: userInput.value });
    await addParticipant.mutateAsync({
      eventId: props.event.id,
      userId: user.id,
    });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    userInput.value = "";
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 404) {
      userSearchError.value = "Usuário não encontrado";
    } else if (err?.response?.status === 400) {
      addError.value = "Usuário já é participante ou formato inválido";
    } else if (err?.response?.status === 403) {
      addError.value = "Apenas o dono pode adicionar participantes";
    } else {
      addError.value = "Erro ao adicionar participante";
    }
  }
};

const handleRemoveParticipant = async (userId: string) => {
  if (!props.event) return;

  submitError.value = "";

  try {
    await removeParticipant.mutateAsync({
      eventId: props.event.id,
      userId,
    });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  } catch {
    submitError.value = "Erro ao remover participante";
  }
};
</script>

<template>
  <div v-if="visible && event" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <div class="tabs">
          <div
            v-on:click="close"
            style="display: flex; justify-content: center; align-items: center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="#6b7280"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <button
            :class="['tab', { active: activeTab === 'info' }]"
            @click="activeTab = 'info'"
          >
            Infos
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
        <div v-if="activeTab === 'info'" class="tab-content info-tab">
          <div class="info-field">
            <span class="info-label">Nome</span>
            <span class="info-value">{{ event.name }}</span>
          </div>
          <div class="info-field">
            <span class="info-label">Descrição</span>
            <span class="info-value info-description">{{
              event.description || "Sem descrição"
            }}</span>
          </div>
          <div class="info-field">
            <span class="info-label">Data</span>
            <span class="info-value">{{ event.date }}</span>
          </div>
        </div>

        <div v-if="activeTab === 'people'" class="tab-content">
          <div v-if="isOwner" class="add-participant-wrap">
            <div class="add-participant-row">
              <input
                v-model="userInput"
                placeholder="Nome#Código"
                class="form-input"
                @keydown.enter.prevent="handleAddParticipant"
              />
              <button
                class="add-btn"
                :disabled="addParticipant.isPending.value || !userInput.trim()"
                @click="handleAddParticipant"
              >
                {{ addParticipant.isPending.value ? "..." : "Adicionar" }}
              </button>
            </div>
            <span v-if="userSearchError" class="error-text">{{
              userSearchError
            }}</span>
            <span v-if="addError" class="error-text">{{ addError }}</span>
          </div>

          <div v-if="event.participants.length === 0" class="empty-state">
            Nenhum participante neste evento.
          </div>
          <div v-else class="list">
            <div
              v-for="participant in event.participants"
              :key="participant.userId"
              class="list-item participant-item"
            >
              <div class="participant-info">
                <span>{{ participant.name }}</span>
                <span class="role-badge">{{
                  participant.role === "Owner" ? "Proprietário" : "Membro"
                }}</span>
              </div>
              <button
                v-if="isOwner && participant.userId !== currentUserId"
                class="remove-btn"
                :disabled="removeParticipant.isPending.value"
                @click="handleRemoveParticipant(participant.userId)"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'edit'" class="tab-content edit-tab">
          <button
            class="action-btn leave-btn"
            :disabled="leaveEvent.isPending.value"
            @click="handleLeave"
          >
            {{ leaveEvent.isPending.value ? "Saindo..." : "SAIR DO EVENTO" }}
          </button>

          <button
            v-if="isOwner"
            class="action-btn delete-btn"
            :disabled="deleteEvent.isPending.value"
            @click="handleDelete"
          >
            {{
              deleteEvent.isPending.value ? "Deletando..." : "DELETAR EVENTO"
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
  transition:
    color 0.2s,
    border-color 0.2s;
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

.info-tab {
  padding: 16px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
}

.info-description {
  font-weight: 400;
  color: #374151;
  line-height: 1.5;
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

.add-participant-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.add-participant-row {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.add-btn {
  padding: 10px 16px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 2px 8px;
  border-radius: 999px;
}

.remove-btn {
  padding: 6px 12px;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-width: none;
    max-height: none;
    padding: 0;
  }

  .modal-header {
    padding: 0 12px;
  }

  .tab {
    padding: 10px 12px;
    font-size: 13px;
  }

  .tab-body {
    padding: 10px 16px;
  }

  .close-btn {
    padding: 4px 12px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
