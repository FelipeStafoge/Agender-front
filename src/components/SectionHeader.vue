<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  title: string;
  subtitle: string;
}>();

const showPopover = ref(false);
const popoverAlign = ref<"left" | "right">("right");
const popoverOffset = ref(0);
const iconRef = ref<HTMLElement | null>(null);

const computeAlignment = () => {
  if (!iconRef.value) return;
  const rect = iconRef.value.getBoundingClientRect();
  const iconCenterX = rect.left + rect.width / 2;
  const spaceLeft = iconCenterX;
  const spaceRight = window.innerWidth - iconCenterX;

  if (spaceLeft >= spaceRight) {
    popoverAlign.value = "left";
    const overflow = 8 - (rect.right - 260);
    popoverOffset.value = overflow > 0 ? overflow : 0;
  } else {
    popoverAlign.value = "right";
    const overflow = rect.left + 260 - window.innerWidth + 8;
    popoverOffset.value = overflow > 0 ? -overflow : 0;
  }
};

const togglePopover = () => {
  showPopover.value = !showPopover.value;
  if (showPopover.value) {
    nextTick(computeAlignment);
  }
};

const closePopover = () => {
  showPopover.value = false;
};

const onDocumentClick = (e: MouseEvent) => {
  if (!iconRef.value) return;
  if (!iconRef.value.contains(e.target as Node)) {
    closePopover();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<template>
  <div class="section-header">
    <div class="title-row">
      <h2 class="section-title">{{ props.title }}</h2>
      <span class="help-icon-wrapper" ref="iconRef">
        <button class="help-icon-btn" @click.stop="togglePopover" type="button" aria-label="Ajuda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#9ca3af" stroke-width="1.5" />
            <path
              d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
              stroke="#9ca3af"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle cx="12" cy="17" r="0.5" fill="#9ca3af" stroke="#9ca3af" stroke-width="0.5" />
          </svg>
        </button>
        <div
          v-if="showPopover"
          class="help-popover"
          :class="`help-popover--${popoverAlign}`"
          :style="{ transform: `translateX(${popoverOffset}px)`, '--arrow-offset': `${popoverOffset}px` }"
        >
          {{ props.subtitle }}
        </div>
      </span>
    </div>
    <p class="section-subtitle">{{ props.subtitle }}</p>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.help-icon-wrapper {
  display: none;
  position: relative;
}

.help-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  line-height: 0;
}

.help-icon-btn:hover circle {
  stroke: #6b7280;
}

.help-icon-btn:hover path {
  stroke: #6b7280;
}

.help-popover {
  position: absolute;
  top: calc(100% + 8px);
  background: #374151;
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  padding: 12px 16px;
  border-radius: 8px;
  white-space: normal;
  width: 260px;
  max-width: calc(100vw - 32px);
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.help-popover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #374151 transparent;
}

.help-popover--right {
  left: 0;
}

.help-popover--right::before {
  left: calc(8px - var(--arrow-offset));
  right: auto;
}

.help-popover--left {
  right: 0;
}

.help-popover--left::before {
  left: auto;
  right: calc(8px - var(--arrow-offset));
}

@media (max-width: 768px) {
  .help-icon-wrapper {
    display: inline-flex;
  }

  .section-subtitle {
    display: none;
  }
}
</style>
