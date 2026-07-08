<script setup lang="ts">
import { computed } from "vue";
import EventListPanel from "@/components/EventListPanel.vue";
import { useAuth } from "@/utils/Authentication/auth";
import { formatDate } from "@/utils/formatDate";
import type { Event } from "@/types/api";

const auth = useAuth();
const userId = computed(() => auth.getUser?.account_id);

const isOwnerFilter = (event: Event): boolean =>
  event.participants.some(
    (p) => p.userId === userId.value && p.role === "Owner",
  );

const isCalendarEventFilter = (event: Event): boolean =>
  event.calendarId !== null;

const today = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return formatDate(d);
});

const thirtyDaysLater = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return formatDate(d);
});
</script>

<template>
  <div class="home-container">
    <div class="top-row">
      <EventListPanel
        :start-date="today"
        :end-date="thirtyDaysLater"
        width="495px"
        max-height="380px"
        :filter-fn="isOwnerFilter"
      />
      <EventListPanel
        :start-date="today"
        :end-date="thirtyDaysLater"
        width="495px"
        max-height="380px"
        :filter-fn="isCalendarEventFilter"
      />
    </div>

    <EventListPanel
      :start-date="today"
      :end-date="thirtyDaysLater"
      width="1000px"
      max-height="430px"
    />
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 150px;
  gap: 16px;
  height: 100%;
}

.top-row {
  display: flex;
  gap: 10px;
  width: 1000px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 24px 0;
    gap: 16px;
    height: auto;
    min-height: 100%;
  }

  .top-row {
    flex-direction: column;
    width: 100%;
    gap: 16px;
  }
}
</style>
