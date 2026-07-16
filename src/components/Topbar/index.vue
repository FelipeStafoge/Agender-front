<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/utils/Authentication/auth";
import { computed, ref, watch } from "vue";

const router = useRouter();
const route = useRoute();
const { getUser } = useAuth();

const copied = ref(false);
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

watch(
  () => route.path,
  () => {
    closeDrawer();
  },
);

const copyUserCode = () => {
  const code = `${getUser?.userName}#${getUser?.userCode}`;
  navigator.clipboard?.writeText(code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
};

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
    path: "/profile",
    label: "Profile",
    icon: "profile",
    active: isActive("/profile"),
    action: () => router.push("/profile"),
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: "calendar",
    active: isActive("/calendar"),
    action: () => router.push("/calendar"),
  },
]);
</script>

<template>
  <div class="topbar">
    <button class="hamburger-btn" @click="drawerOpen = true">
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <div class="nav-items">
      <div
        v-for="item in navItems"
        :key="item.path"
        :class="['nav-item', { active: item.active }]"
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
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>

    <span class="center-text">Agender: seu app de agendamento</span>
    <span class="center-text-mobile">Agender</span>

    <div class="right-section">
      <div class="nav-item logout-item" @click="logout">
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
        <span class="nav-label">Logout</span>
      </div>
      <span class="user-code">{{ getUser?.userName }}#{{ getUser?.userCode }}</span>
      <div class="copy-icon-box" @click="copyUserCode">
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
        <span v-if="copied" class="tooltip">Copiado!</span>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="drawerOpen" class="drawer-overlay" @click="closeDrawer">
        <nav class="drawer" @click.stop>
          <div class="drawer-header">
            <span class="drawer-title">Agender</span>
            <button class="drawer-close" @click="closeDrawer">
              <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

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
              {{ copied ? "Copiado!" : "Copiar" }}
            </button>
          </div>

          <div class="drawer-nav">
            <div
              v-for="item in navItems"
              :key="item.path"
              :class="['drawer-nav-item', { active: item.active }]"
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
              <span>{{ item.label }}</span>
            </div>
          </div>

          <div class="drawer-footer">
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
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.topbar {
  width: 100%;
  height: 50px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 100px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1.5px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  color: #4a5568;
  background: rgba(255, 255, 255, 0.85);
}

.nav-item:hover {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.95);
}

.nav-item.active {
  border-color: rgba(124, 58, 237, 0.6);
  background: rgba(255, 255, 255, 0.95);
  color: #5b21b6;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.center-text {
  font-size: 18px;
  font-weight: 500;
  color: #4a5568;
}

.center-text-mobile {
  display: none;
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
}

.logout-item {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(255, 255, 255, 0.85);
}

.logout-item:hover {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(255, 255, 255, 0.95);
}

.user-code {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 12px;
  border-radius: 8px;
}

.copy-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 2px;
  border: 1.5px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  transition: border-color 0.2s, background-color 0.2s;
  color: #6b7280;
  position: relative;
}

.tooltip {
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
  z-index: 10;
}

.hamburger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  color: #4a5568;
  transition: border-color 0.2s, background-color 0.2s;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.95);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
}

.drawer {
  width: 280px;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.12);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
}

.drawer-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.drawer-user-icon {
  width: 32px;
  height: 32px;
  color: #7c3aed;
  flex-shrink: 0;
}

.drawer-user-code {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  word-break: break-all;
}

.drawer-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #7c3aed;
  background: transparent;
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  margin-left: auto;
}

.drawer-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0;
  gap: 4px;
  overflow-y: auto;
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.2s, color 0.2s;
}

.drawer-nav-item:hover {
  background: #f3f4f6;
}

.drawer-nav-item.active {
  background: #f3e8ff;
  color: #7c3aed;
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.drawer-logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
  color: #e53e3e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.drawer-logout-btn:hover {
  border-color: rgba(239, 68, 68, 0.5);
  background: #fff5f5;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(-100%);
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
  }

  .nav-items {
    display: none;
  }

  .center-text {
    display: none;
  }

  .center-text-mobile {
    display: block;
  }

  .right-section {
    display: none;
  }

  .nav-label {
    font-size: 12px;
  }
}
</style>
