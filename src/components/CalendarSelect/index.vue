<script setup lang="ts">
import { reactive, ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { formatDate } from "@/utils/formatDate";
import { useCreateEventRequest } from "@/requests/Events/CreateEvent/createEvent";
import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";

const date = ref<Date | null>(null);
const createEvent = useCreateEventRequest();
const newEventInitialForm = {
  name: "",
  date: "",
  creator_id: "",
  users_ids: [] as string[],
};
const userInput = ref("");

const newEventForm = reactive({ ...newEventInitialForm });

const addUser = async () => {
  if (!userInput.value) return;

  const validateUser = await getUserInfo({ NameWithCode: userInput.value });

  newEventForm.users_ids.push(validateUser.id);

  userInput.value = "";
};

const handleCreateEvent = async ({
  form,
}: {
  form: {
    name: string;
    date: string;
    users_ids: string[];
  };
}) => {
  try {
    await createEvent.mutateAsync({
      form,
    });
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      max-width: 800px;
    "
  >
    <input
      v-model="newEventForm.name"
      placeholder="Nome do evento"
      style="margin-bottom: 5px"
    />
    <VueDatePicker
      v-model="date"
      @update:model-value="
        (value) => {
          newEventForm.date = formatDate(value);
        }
      "
    />
    <input
      v-model="userInput"
      placeholder="Nome#ID"
      @keydown.enter.prevent="addUser"
      style="margin-bottom: 5px"
    />
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        width: 500px;
        height: 50px;
        background-color: purple;
        margin-left: 50px;
        margin-top: 50px;
      "
      v-on:click="handleCreateEvent({ form: newEventForm })"
    >
      Confirmar Evento
    </div>
  </div>

  <div v-for="user in newEventForm.users_ids" :key="user">
    <p>{{ user }}</p>
  </div>
</template>
