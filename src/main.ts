import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.ts";
import { createPinia } from "pinia";
import { useAuth } from "./utils/Authentication/auth.ts";
import { VueQueryPlugin } from "@tanstack/vue-query";

createApp(App).use(createPinia()).use(VueQueryPlugin).use(router).mount("#app");
