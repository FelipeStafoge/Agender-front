import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuth = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token"));
  const user = ref("");
  const isAuth = ref(false);

  const setToken = (tokenValue: string) => {
    localStorage.setItem("token", tokenValue);
    token.value = tokenValue;
  };

  const setUser = (userValue: string) => {
    localStorage.setItem("user", userValue);
    user.value = userValue;
  };

  const isAuthenticated = computed(() => {
    return token.value && user.value;
  });

  const setIsAuth = (auth: boolean) => {
    isAuth.value = auth;
  };

  return {
    setToken,
    setUser,
    isAuthenticated,
    setIsAuth,
  };
});
