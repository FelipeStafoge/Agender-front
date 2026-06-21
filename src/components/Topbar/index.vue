<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.removeItem("token");
};
</script>

<template>
  <div
    style="
      width: 100%;
      height: 50px;
      background-color: green;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <div style="display: flex">
      <div
        style="
          width: 50px;
          height: 30px;
          background-color: brown;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 100px;
        "
        v-on:click="() => router.push('/profile')"
      >
        Profile
      </div>

      <div
        style="
          width: 50px;
          height: 30px;
          background-color: red;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 100px;
        "
        v-on:click="() => router.push('/')"
      >
        Home
      </div>

      <div
        style="
          width: 50px;
          height: 30px;
          background-color: chartreuse;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 100px;
        "
        v-on:click="() => router.push('/calendar')"
      >
        calendar
      </div>
    </div>

    <div
      style="
        display: flex;
        width: 50px;
        height: 30px;
        background-color: dimgray;
        justify-content: center;
        align-items: center;
      "
      v-on:click="
        () => {
          logout();
          router.push('/login');
        }
      "
    >
      Log Out
    </div>
  </div>
</template>
