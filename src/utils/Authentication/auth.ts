import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuth = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token"));
  const user = ref<{
    account_id: string;
    userName: string;
    userCode: string;
    userEmail: string;
  } | null>(JSON.parse(localStorage.getItem("user") || "null"));
  const isAuth = ref(false);

  const setToken = (tokenValue: string) => {
    localStorage.setItem("token", tokenValue);
    token.value = tokenValue;
  };

  const setUser = (userValue: {
    account_id: string;
    userName: string;
    userCode: string;
    userEmail: string;
  }) => {
    localStorage.setItem("user", JSON.stringify(userValue));
    user.value = userValue;
  };

  const isAuthenticated = computed(() => {
    return token.value && user.value;
  });

  const setIsAuth = (auth: boolean) => {
    isAuth.value = auth;
  };

  return {
    getUser: user,
    setToken,
    setUser,
    isAuthenticated,
    setIsAuth,
  };
});
