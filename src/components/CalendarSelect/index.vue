<script setup lang="ts">
import { reactive, ref } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Topbar from "@/components/Topbar/index.vue";
import { formatDate } from "@/utils/formatDate";
import { useCreateEventRequest } from "@/requests/Events/CreateEvent/createEvent";
import { useAuth } from "@/utils/Authentication/auth";
import { getUserInfo } from "@/requests/Events/getUserInfo/getUserInfo";

const date = ref<Date | null>(null);
const createEvent = useCreateEventRequest;
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

  console.log(validateUser.data);
  newEventForm.users_ids.push(userInput.value);

  userInput.value = "";
};

const { getUser } = useAuth();

const handleDateChange = async ({
  form,
}: {
  form: {
    name: string;
    date: string;
    creator_id: string;
    users_ids: string[];
  };
}) => {
  form.creator_id = getUser?.account_id || "";
  try {
    await createEvent({ form });
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <Topbar />
  <VueDatePicker
    v-model="date"
    @update:model-value="
      (value) => {
        newEventForm.date = formatDate(value);
      }
    "
  />
  <input
    v-model="newEventForm.name"
    placeholder="Nome do evento"
    style="margin-bottom: 5px"
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
    v-on:click="handleDateChange({ form: newEventForm })"
  >
    Confirmar Evento
  </div>

  <div v-for="user in newEventForm.users_ids" :key="user">
    <p>{{ user }}</p>
  </div>
</template>
