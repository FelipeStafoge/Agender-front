<script setup lang="ts">
import Topbar from "@/components/Topbar/index.vue";
</script>

<template>
  <div class="layout">
    <Topbar />

    <main class="content-wrapper">
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-wrapper {
  flex: 1;
  background-color: #d3d3d3;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 100px;
}

.content {
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
