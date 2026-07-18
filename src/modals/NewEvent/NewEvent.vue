<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDate } from "@/utils/formatDate";
import { useCreateEventRequest } from "@/requests/Events/CreateEvent/createEvent";
import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";
import { useQueryClient } from "@tanstack/vue-query";
import { Compact } from "@ckpack/vue-color";
import type { Calendar } from "@/types/api";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    calendarId?: string | number | null;
    calendarColor?: string;
    calendars?: Calendar[];
    initialDate?: Date | null;
  }>(),
  {
    calendarId: null,
    calendarColor: "#7c3aed",
    calendars: () => [],
    initialDate: null,
  },
);

const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const isCalendarLocked = computed(() => !!props.calendarId);

const calendarOptions = computed(() => [
  { id: null, name: "Meus Eventos", color: "#7c3aed" },
  ...(props.calendars || []).map((c: Calendar) => ({
    id: c.id,
    name: c.name,
    color: c.color || "#7c3aed",
  })),
]);

const date = ref<Date | null>(null);
const createEvent = useCreateEventRequest();
const queryClient = useQueryClient();
const newEventInitialForm = {
  name: "",
  date: "",
  description: "",
  color: "#7c3aed",
  users: [{ name: "", id: "" }],
};
const selectedCalendarId = ref<string | number | null>(null);
const userInput = ref("");
const submitError = ref("");
const userSearchError = ref("");

const newEventForm = reactive({ ...newEventInitialForm });

const formErrors = reactive({
  name: "",
  date: "",
  color: "",
});

const close = () => emit("update:visible", false);

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      if (props.initialDate) {
        date.value = props.initialDate;
        newEventForm.date = formatDate(props.initialDate);
      }
      if (props.calendarId) {
        selectedCalendarId.value = props.calendarId;
        newEventForm.color = props.calendarColor || "#7c3aed";
      } else {
        selectedCalendarId.value = null;
        newEventForm.color = "#7c3aed";
      }
    }
  },
);

const onCalendarChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const id = target.value === "" ? null : target.value;
  selectedCalendarId.value = id as string | number | null;
  const option = calendarOptions.value.find((o) => String(o.id) === String(id));
  if (option && option.id !== null) {
    newEventForm.color = option.color;
  }
};

const validateForm = () => {
  let valid = true;
  formErrors.name = "";
  formErrors.date = "";
  formErrors.color = "";
  submitError.value = "";

  if (!newEventForm.name.trim()) {
    formErrors.name = "Nome do evento é obrigatório";
    valid = false;
  }

  if (!newEventForm.date) {
    formErrors.date = "Data do evento é obrigatória";
    valid = false;
  }

  if (!newEventForm.color) {
    formErrors.color = "Cor do evento é obrigatória";
    valid = false;
  }

  return valid;
};

const resetForm = () => {
  Object.assign(newEventForm, { ...newEventInitialForm });
  date.value = null;
  userInput.value = "";
  selectedCalendarId.value = null;
  formErrors.name = "";
  formErrors.date = "";
  formErrors.color = "";
  submitError.value = "";
  userSearchError.value = "";
};

const addUser = async () => {
  if (!userInput.value) return;

  userSearchError.value = "";

  try {
    const validateUser = await getUserInfo({ NameWithCode: userInput.value });

    newEventForm.users.push({ name: validateUser.name, id: validateUser.id });
    userInput.value = "";
  } catch {
    userSearchError.value = "Usuário não encontrado";
  }
};

const handleCreateEvent = async () => {
  if (!validateForm()) return;

  try {
    await createEvent.mutateAsync({
      form: {
        name: newEventForm.name,
        date: newEventForm.date,
        description: newEventForm.description || null,
        color: newEventForm.color,
        users_ids: newEventForm.users.filter((u) => u.id).map((u) => u.id),
        calendar_id: selectedCalendarId.value,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    resetForm();
    close();
  } catch (error) {
    submitError.value = "Erro ao criar evento. Tente novamente.";
  }
};
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      <h2>Novo Evento</h2>

      <p v-if="submitError" class="error-text general-error">
        {{ submitError }}
      </p>

      <div class="field-wrap">
        <label class="field-label">Calendário</label>
        <select
          :value="selectedCalendarId"
          :disabled="isCalendarLocked"
          class="form-select"
          @change="onCalendarChange"
        >
          <option value="">Meus Eventos</option>
          <option v-for="cal in calendars" :key="cal.id" :value="cal.id">
            {{ cal.name }}
          </option>
        </select>
      </div>

      <div class="field-wrap">
        <input
          v-model="newEventForm.name"
          placeholder="Nome do evento"
          :class="['form-input', { 'form-input--error': formErrors.name }]"
        />
        <span v-if="formErrors.name" class="error-text">{{
          formErrors.name
        }}</span>
      </div>

      <div class="field-wrap">
        <textarea
          v-model="newEventForm.description"
          placeholder="Adicionar descrição..."
          class="form-textarea"
          rows="3"
        ></textarea>
      </div>

      <div class="field-wrap">
        <VueDatePicker
          v-model="date"
          :class="['form-input', { 'form-input--error': formErrors.date }]"
          :enable-time-picker="false"
          @update:model-value="
            (value) => {
              newEventForm.date = formatDate(value);
              if (value) formErrors.date = '';
            }
          "
        />
        <span v-if="formErrors.date" class="error-text">{{
          formErrors.date
        }}</span>
      </div>

      <div
        v-if="!selectedCalendarId"
        :class="[
          'color-picker-wrap',
          { 'form-input--error': formErrors.color },
        ]"
      >
        <label class="color-label">Cor do evento</label>
        <Compact
          :model-value="newEventForm.color"
          @update:model-value="
            (payload: any) => {
              newEventForm.color = payload.hex;
              formErrors.color = '';
            }
          "
        />
        <span v-if="formErrors.color" class="error-text">{{
          formErrors.color
        }}</span>
      </div>
      <div v-else class="color-preview">
        <span
          class="color-swatch"
          :style="{ background: newEventForm.color }"
        ></span>
        <span class="color-label"
          >Cor do calendário: {{ newEventForm.color }}</span
        >
      </div>

      <div class="field-wrap">
        <input
          v-model="userInput"
          placeholder="Nome#ID"
          class="form-input"
          @keydown.enter.prevent="addUser"
        />
        <span v-if="userSearchError" class="error-text">{{
          userSearchError
        }}</span>
      </div>

      <div v-for="user in newEventForm.users.filter(u => u.id)" :key="user.id" class="user-item">
        <p>{{ user.name }}</p>
        <button class="remove-user-btn" @click="newEventForm.users = newEventForm.users.filter(u => u.id !== user.id)" type="button">&times;</button>
      </div>

      <button
        class="confirm-btn"
        :disabled="createEvent.isPending.value"
        @click="handleCreateEvent"
      >
        {{ createEvent.isPending.value ? "Criando..." : "Confirmar Evento" }}
      </button>
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
  padding: 32px;
  width: 90%;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.form-input {
  width: 70%;
}

.form-select,
.form-textarea {
  width: 70%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-label {
  font-size: 13px;
  color: #666;
  align-self: flex-start;
  margin-bottom: -8px;
}

.color-preview {
  width: 70%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.confirm-btn {
  width: 70%;
  padding: 12px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.color-picker-wrap {
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  color: #666;
  align-self: flex-start;
}

.field-wrap {
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-wrap .form-input,
.field-wrap .form-textarea {
  width: 100%;
}

.user-item {
  width: 70%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #374151;
}

.remove-user-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0 4px;
  line-height: 1;
}

.remove-user-btn:hover {
  color: #e53e3e;
}

.form-input--error {
  border: 1px solid #e53e3e;
}

.form-input--error:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.2);
}

.error-text {
  color: #e53e3e;
  font-size: 12px;
}

.general-error {
  width: 70%;
  text-align: center;
  padding: 8px;
  background: #fff5f5;
  border-radius: 6px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 24px 16px;
    gap: 12px;
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    min-height: 100dvh;
    overflow-y: auto;
  }

  .form-input,
  .field-wrap,
  .confirm-btn,
  .form-select,
  .form-textarea,
  .color-picker-wrap,
  .user-item,
  .general-error {
    width: 100%;
  }

  .close-btn {
    top: 16px;
    right: 16px;
  }
}
</style>
