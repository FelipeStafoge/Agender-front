<script setup lang="ts">
import { computed } from "vue";
import { useGetListEvents } from "@/requests/Events/ListEvents/listEvent";
import type { Event } from "@/types/api";

const getUserEvents = useGetListEvents();

const data = computed<Event[]>(() => getUserEvents.data.value ?? []);
const isPending = computed(() => getUserEvents.isPending.value);
const error = computed(() => getUserEvents.error.value);
</script>

<template>
  <div v-if="isPending">Carregando...</div>

  <div v-else-if="error">Erro ao carregar</div>

  <div v-else>
    <div v-for="event in data" :key="event.id" class="event-card">
      <strong>{{ event.name }}</strong> - {{ event.date }}
      <p v-if="event.description" class="event-description">{{ event.description }}</p>
      <div class="participants">
        <div
          v-for="p in event.participants"
          :key="p.userId"
          class="participant"
        >
          <span>{{ p.name }}</span>
          <span class="role-badge">{{ p.role === 'Owner' ? 'Dono' : 'Membro' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.participants {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 6px;
  font-size: 13px;
}

.participant {
  display: flex;
  gap: 8px;
}

.role-badge {
  color: #7c3aed;
  font-weight: 600;
  font-size: 11px;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0;
}
</style>
