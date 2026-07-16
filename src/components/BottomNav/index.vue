<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, ref, watch } from "vue";

const router = useRouter();
const route = useRoute();
const { getUser } = useAuth();

const drawerOpen = ref(false);
const copied = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const copyUserCode = () => {
  const code = `${getUser?.userName}#${getUser?.userCode}`;
  navigator.clipboard?.writeText(code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
};

watch(
  () => route.path,
  () => {
    closeDrawer();
  },
);

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

const isActive = (path: string) => route.path === path;

const navItems = computed(() => [
  {
    path: "/",
    label: "Home",
    icon: "home",
    active: isActive("/"),
    action: () => router.push("/"),
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: "calendar",
    active: isActive("/calendar"),
    action: () => router.push("/calendar"),
  },
  {
    path: "/profile",
    label: "Profile",
    icon: "profile",
    active: isActive("/profile"),
    action: () => router.push("/profile"),
  },
]);
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.path"
      :class="['bottom-nav-item', { active: item.active }]"
      @click="item.action"
    >
      <svg
        v-if="item.icon === 'home'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <svg
        v-if="item.icon === 'calendar'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <svg
        v-if="item.icon === 'profile'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span class="nav-label">{{ item.label }}</span>
    </button>

    <button class="bottom-nav-item more-btn" @click="drawerOpen = true">
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
      <span class="nav-label">Mais</span>
    </button>
  </nav>

  <Transition name="drawer">
    <div v-if="drawerOpen" class="drawer-overlay" @click="closeDrawer">
      <div class="drawer" @click.stop>
        <div class="drawer-handle"></div>

        <div class="drawer-user">
          <svg
            class="drawer-user-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="drawer-user-code">{{ getUser?.userName }}#{{ getUser?.userCode }}</span>
          <button class="drawer-copy-btn" @click="copyUserCode">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span v-if="copied" class="copied-tooltip">Copiado!</span>
          </button>
        </div>

        <button class="drawer-logout-btn" @click="logout">
          <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 900;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  min-width: 64px;
}

.bottom-nav-item:hover {
  color: #7c3aed;
}

.bottom-nav-item.active {
  color: #7c3aed;
}

.more-btn {
  color: #6b7280;
}

.more-btn:hover {
  color: #7c3aed;
}

.icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
}

.drawer {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 8px 20px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.drawer-handle {
  width: 36px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 8px auto 20px;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

.drawer-user-icon {
  width: 28px;
  height: 28px;
  color: #7c3aed;
  flex-shrink: 0;
}

.drawer-user-code {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  word-break: break-all;
  flex: 1;
}

.drawer-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
  color: #6b7280;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.drawer-copy-btn .icon {
  width: 18px;
  height: 18px;
}

.drawer-copy-btn:hover {
  border-color: rgba(124, 58, 237, 0.5);
  color: #7c3aed;
}

.copied-tooltip {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: #374151;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.drawer-logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 0;
  border: none;
  background: transparent;
  color: #e53e3e;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.drawer-logout-btn:hover {
  color: #c53030;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>
