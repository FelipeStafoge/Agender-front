<script setup lang="ts">
import Topbar from "@/components/Topbar/index.vue";
import BottomNav from "@/components/BottomNav/index.vue";
</script>

<template>
  <div class="layout">
    <Topbar />

    <main class="content-wrapper">
      <div class="content">
        <router-view />
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, rgba(124, 58, 237, 0.20) 0%, rgba(124, 58, 237, 0.06) 100%);
}

.content-wrapper {
  flex: 1;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 100px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 16px;
    padding-bottom: 56px;
  }
}

.content {
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
