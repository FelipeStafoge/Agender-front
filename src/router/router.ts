import { createRouter, createWebHistory } from "vue-router";
import Home from "@/modules/Home/index.vue";
import Calendar from "@/components/CalendarSelect/index.vue";
import Login from "@/modules/Login/index.vue";
import Profile from "@/modules/Profile/index.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: "/calendar",
      component: Calendar,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      component: Login,
    },
    {
      path: "/profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const userAuthenticated = localStorage.getItem("user");
  if (!userAuthenticated) {
    //refaz chamada pra puxar infos do usuario
  }

  if (to.meta.requiresAuth && !token) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.path === "/login" && token) {
    return "/";
  }
});

export default router;
