<script setup lang="ts">
import { reactive, ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDate } from "@/utils/formatDate";
import { useCreateEventRequest } from "@/requests/Events/CreateEvent/createEvent";
import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";
import { useQueryClient } from "@tanstack/vue-query";
import { Compact } from "@ckpack/vue-color";

defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const date = ref<Date | null>(null);
const createEvent = useCreateEventRequest();
const queryClient = useQueryClient();
const newEventInitialForm = {
  name: "",
  date: "",
  color: "#7c3aed",
  creator_id: "",
  users_ids: [] as string[],
};
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

    newEventForm.users_ids.push(validateUser.id);
    userInput.value = "";
  } catch {
    userSearchError.value = "Usuário não encontrado";
  }
};

const handleCreateEvent = async ({
  form,
}: {
  form: {
    name: string;
    date: string;
    color: string;
    users_ids: string[];
  };
}) => {
  if (!validateForm()) return;

  try {
    await createEvent.mutateAsync({
      form,
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

      <p v-if="submitError" class="error-text general-error">{{ submitError }}</p>

      <div class="field-wrap">
        <input
          v-model="newEventForm.name"
          placeholder="Nome do evento"
          :class="['form-input', { 'form-input--error': formErrors.name }]"
        />
        <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
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
        <span v-if="formErrors.date" class="error-text">{{ formErrors.date }}</span>
      </div>

      <div
        :class="['color-picker-wrap', { 'form-input--error': formErrors.color }]"
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
        <span v-if="formErrors.color" class="error-text">{{ formErrors.color }}</span>
      </div>

      <div class="field-wrap">
        <input
          v-model="userInput"
          placeholder="Nome#ID"
          class="form-input"
          @keydown.enter.prevent="addUser"
        />
        <span v-if="userSearchError" class="error-text">{{ userSearchError }}</span>
      </div>

      <div v-for="user in newEventForm.users_ids" :key="user">
        <p>{{ user }}</p>
      </div>

      <button
        class="confirm-btn"
        :disabled="createEvent.isPending.value"
        @click="handleCreateEvent({ form: newEventForm })"
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

.field-wrap .form-input {
  width: 100%;
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
</style>
