import { createRouter, createWebHistory } from "vue-router";
import Home from "@/modules/Home/index.vue";
import Calendar from "@/modules/Calendar/Calendar.vue";
import Login from "@/modules/Login/index.vue";
import Profile from "@/modules/Profile/index.vue";
import DefaultVueApp from "@/layouts/DefaultVueApp.vue";

const routes = [
  {
    path: "/",
    component: DefaultVueApp,
    children: [
      {
        path: "",
        component: Home,
        meta: { requiresAuth: true },
      },
      {
        path: "calendar",
        component: Calendar,
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        component: Profile,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const userAuthenticated = localStorage.getItem("user");

  if (!userAuthenticated) {
    // refaz chamada pra puxar infos do usuario
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
