<script setup lang="ts">
import { reactive, ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDate } from "@/utils/formatDate";

import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";
import { useQueryClient } from "@tanstack/vue-query";
import { Compact } from "@ckpack/vue-color";
import { useCreateCalendarRequest } from "@/requests/Calendar/createNewCalendar";

defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const createCalendar = useCreateCalendarRequest();
const queryClient = useQueryClient();
const newEventInitialForm = {
  name: "",
  DefaultColor: "#7c3aed",
  users_ids: [] as string[],
};
const userInput = ref("");
const submitError = ref("");
const userSearchError = ref("");

const newEventForm = reactive({ ...newEventInitialForm });

const formErrors = reactive({
  name: "",
  DefaultColor: "",
});

const close = () => emit("update:visible", false);

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const validateForm = () => {
  let valid = true;
  formErrors.name = "";
  formErrors.DefaultColor = "";
  submitError.value = "";

  if (!newEventForm.name.trim()) {
    formErrors.name = "Nome do calendário é obrigatório";
    valid = false;
  }

  if (!newEventForm.DefaultColor) {
    formErrors.DefaultColor = "Cor do calendário é obrigatória";
    valid = false;
  }

  return valid;
};

const resetForm = () => {
  Object.assign(newEventForm, { ...newEventInitialForm });

  userInput.value = "";
  formErrors.name = "";
  formErrors.DefaultColor = "";
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

const handleCreateCalendar = async ({
  form,
}: {
  form: {
    name: string;
    DefaultColor: string;
    users_ids: string[];
  };
}) => {
  if (!validateForm()) return;

  try {
    await createCalendar.mutateAsync({
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
      <h2>Novo Calendario</h2>

      <p v-if="submitError" class="error-text general-error">
        {{ submitError }}
      </p>

      <div class="field-wrap">
        <input
          v-model="newEventForm.name"
          placeholder="Nome do calendario"
          :class="['form-input', { 'form-input--error': formErrors.name }]"
        />
        <span v-if="formErrors.name" class="error-text">{{
          formErrors.name
        }}</span>
      </div>

      <div
        :class="[
          'color-picker-wrap',
          { 'form-input--error': formErrors.DefaultColor },
        ]"
      >
        <label class="color-label">Cor do calendário</label>
        <Compact
          :model-value="newEventForm.DefaultColor"
          @update:model-value="
            (payload: any) => {
              newEventForm.DefaultColor = payload.hex;
              formErrors.DefaultColor = '';
            }
          "
        />
        <span v-if="formErrors.DefaultColor" class="error-text">{{
          formErrors.DefaultColor
        }}</span>
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

      <div v-for="user in newEventForm.users_ids" :key="user">
        <p>{{ user }}</p>
      </div>

      <button
        class="confirm-btn"
        :disabled="createCalendar.isPending.value"
        @click="() => handleCreateCalendar({ form: newEventForm })"
      >
        {{
          createCalendar.isPending.value ? "Criando..." : "Confirmar calendario"
        }}
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
