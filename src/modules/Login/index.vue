<script setup lang="ts">
import { useLoginRequest } from "@/requests/login";
import { useRegisterRequest } from "@/requests/register";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const loginMutation = useLoginRequest();
const registerMutation = useRegisterRequest();
const route = useRoute();
const router = useRouter();

const activeTab = ref<"login" | "register">("login");

const switchTab = (tab: "login" | "register") => {
  activeTab.value = tab;
  clearLoginErrors();
  clearRegisterErrors();
};

const RegisterinitialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const LogininitialForm = {
  email: "",
  password: "",
};

const Registerform = reactive({ ...RegisterinitialForm });
const Loginform = reactive({ ...LogininitialForm });

const registerErrors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loginErrors = reactive({
  email: "",
  password: "",
});

const registerApiError = ref("");
const loginApiError = ref("");

const ALLOWED_SPECIAL = /[@#$%&*_+=~!?]/;
const FORBIDDEN_CHARS = /[,.\-;:"'/\\()[\]{}<>|]/;
const UPPERCASE = /[A-Z]/;
const LOWERCASE = /[a-z]/;

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const extractApiError = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Erro ao processar. Tente novamente.";
};

const validateRegisterField = (field: string) => {
  switch (field) {
    case "name":
      if (!Registerform.name.trim()) {
        registerErrors.name = "Nome é obrigatório.";
      } else {
        registerErrors.name = "";
      }
      break;

    case "email":
      if (!Registerform.email.trim()) {
        registerErrors.email = "Email é obrigatório.";
      } else if (!isValidEmail(Registerform.email)) {
        registerErrors.email = "Formato de email inválido.";
      } else {
        registerErrors.email = "";
      }
      break;

    case "password":
      if (!Registerform.password) {
        registerErrors.password = "Senha é obrigatória.";
      } else if (Registerform.password.length < 6) {
        registerErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
      } else if (!UPPERCASE.test(Registerform.password)) {
        registerErrors.password = "Pelo menos 1 letra maiúscula.";
      } else if (!LOWERCASE.test(Registerform.password)) {
        registerErrors.password = "Pelo menos 1 letra minúscula.";
      } else if (!ALLOWED_SPECIAL.test(Registerform.password)) {
        registerErrors.password = "Pelo menos 1 caractere especial (@ # $ % & * _ + = ~ ! ?).";
      } else if (FORBIDDEN_CHARS.test(Registerform.password)) {
        registerErrors.password = "Não use vírgula, ponto, hífen ou pontuação.";
      } else {
        registerErrors.password = "";
      }
      break;

    case "confirmPassword":
      if (!Registerform.confirmPassword) {
        registerErrors.confirmPassword = "Confirmação é obrigatória.";
      } else if (Registerform.confirmPassword !== Registerform.password) {
        registerErrors.confirmPassword = "As senhas não conferem.";
      } else {
        registerErrors.confirmPassword = "";
      }
      break;
  }
};

const validateRegisterForm = (): boolean => {
  validateRegisterField("name");
  validateRegisterField("email");
  validateRegisterField("password");
  validateRegisterField("confirmPassword");

  return !registerErrors.name && !registerErrors.email && !registerErrors.password && !registerErrors.confirmPassword;
};

const validateLoginField = (field: string) => {
  switch (field) {
    case "email":
      if (!Loginform.email.trim()) {
        loginErrors.email = "Email é obrigatório.";
      } else if (!isValidEmail(Loginform.email)) {
        loginErrors.email = "Formato de email inválido.";
      } else {
        loginErrors.email = "";
      }
      break;

    case "password":
      if (!Loginform.password) {
        loginErrors.password = "Senha é obrigatória.";
      } else {
        loginErrors.password = "";
      }
      break;
  }
};

const validateLoginForm = (): boolean => {
  validateLoginField("email");
  validateLoginField("password");

  return !loginErrors.email && !loginErrors.password;
};

const clearRegisterErrors = () => {
  registerErrors.name = "";
  registerErrors.email = "";
  registerErrors.password = "";
  registerErrors.confirmPassword = "";
  registerApiError.value = "";
};

const clearLoginErrors = () => {
  loginErrors.email = "";
  loginErrors.password = "";
  loginApiError.value = "";
};

const handleRegister = async () => {
  clearRegisterErrors();

  if (!validateRegisterForm()) return;

  try {
    await registerMutation.mutateAsync({
      form: {
        name: Registerform.name,
        email: Registerform.email,
        password: Registerform.password,
      },
    });

    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } catch (error) {
    registerApiError.value = extractApiError(error);
  }
};

const handleLogin = async () => {
  clearLoginErrors();

  if (!validateLoginForm()) return;

  try {
    await loginMutation.mutateAsync({
      form: {
        email: Loginform.email,
        password: Loginform.password,
      },
    });

    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } catch (error) {
    loginApiError.value = extractApiError(error);
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-modal">
      <div class="auth-tabs">
        <button
          :class="['auth-tab', { active: activeTab === 'login' }]"
          @click="switchTab('login')"
        >
          Entrar
        </button>
        <button
          :class="['auth-tab', { active: activeTab === 'register' }]"
          @click="switchTab('register')"
        >
          Cadastrar
        </button>
      </div>

      <div v-if="activeTab === 'login'" class="auth-form">
        <h2 class="auth-card-title">Entrar</h2>
        <p class="auth-card-subtitle">Acesse sua conta</p>

        <div v-if="loginApiError" class="api-error">{{ loginApiError }}</div>

        <div class="field-wrap">
          <label class="field-label">Email</label>
          <input
            v-model="Loginform.email"
            :class="['form-input', { 'form-input--error': loginErrors.email }]"
            placeholder="seu@email.com"
            @blur="validateLoginField('email')"
            @input="loginErrors.email = ''"
          />
          <span v-if="loginErrors.email" class="error-text">{{ loginErrors.email }}</span>
        </div>

        <div class="field-wrap">
          <label class="field-label">Senha</label>
          <input
            v-model="Loginform.password"
            type="password"
            :class="['form-input', { 'form-input--error': loginErrors.password }]"
            placeholder="Sua senha"
            @blur="validateLoginField('password')"
            @input="loginErrors.password = ''"
          />
          <span v-if="loginErrors.password" class="error-text">{{ loginErrors.password }}</span>
        </div>

        <button
          class="btn-primary"
          :disabled="loginMutation.isPending.value"
          @click="handleLogin"
        >
          <span v-if="loginMutation.isPending.value" class="btn-spinner"></span>
          {{ loginMutation.isPending.value ? "Entrando..." : "Entrar" }}
        </button>
      </div>

      <div v-if="activeTab === 'register'" class="auth-form">
        <h2 class="auth-card-title">Criar conta</h2>
        <p class="auth-card-subtitle">Registre-se para começar a usar</p>

        <div v-if="registerApiError" class="api-error">{{ registerApiError }}</div>

        <div class="field-wrap">
          <label class="field-label">Nome</label>
          <input
            v-model="Registerform.name"
            :class="['form-input', { 'form-input--error': registerErrors.name }]"
            placeholder="Seu nome"
            @blur="validateRegisterField('name')"
            @input="registerErrors.name = ''"
          />
          <span v-if="registerErrors.name" class="error-text">{{ registerErrors.name }}</span>
        </div>

        <div class="field-wrap">
          <label class="field-label">Email</label>
          <input
            v-model="Registerform.email"
            :class="['form-input', { 'form-input--error': registerErrors.email }]"
            placeholder="seu@email.com"
            @blur="validateRegisterField('email')"
            @input="registerErrors.email = ''"
          />
          <span v-if="registerErrors.email" class="error-text">{{ registerErrors.email }}</span>
        </div>

        <div class="field-wrap">
          <label class="field-label">Senha</label>
          <input
            v-model="Registerform.password"
            type="password"
            :class="['form-input', { 'form-input--error': registerErrors.password }]"
            placeholder="Mínimo 6 caracteres"
            @blur="validateRegisterField('password')"
            @input="registerErrors.password = ''"
          />
          <span v-if="registerErrors.password" class="error-text">{{ registerErrors.password }}</span>
        </div>

        <div class="field-wrap">
          <label class="field-label">Confirmar senha</label>
          <input
            v-model="Registerform.confirmPassword"
            type="password"
            :class="['form-input', { 'form-input--error': registerErrors.confirmPassword }]"
            placeholder="Repita a senha"
            @blur="validateRegisterField('confirmPassword')"
            @input="registerErrors.confirmPassword = ''"
          />
          <span v-if="registerErrors.confirmPassword" class="error-text">{{ registerErrors.confirmPassword }}</span>
        </div>

        <button
          class="btn-primary"
          :disabled="registerMutation.isPending.value"
          @click="handleRegister"
        >
          <span v-if="registerMutation.isPending.value" class="btn-spinner"></span>
          {{ registerMutation.isPending.value ? "Cadastrando..." : "Cadastrar" }}
        </button>
      </div>

      <p v-if="activeTab === 'login'" class="auth-switch">
        Não tem conta?
        <button class="auth-switch-btn" @click="switchTab('register')">Cadastre-se</button>
      </p>
      <p v-if="activeTab === 'register'" class="auth-switch">
        Já tem conta?
        <button class="auth-switch-btn" @click="switchTab('login')">Entrar</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  padding: 40px 20px;
}

.auth-modal {
  background: #fff;
  border-radius: 12px;
  width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.auth-tab {
  flex: 1;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.auth-tab:hover {
  color: #374151;
}

.auth-tab.active {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
}

.auth-form {
  padding: 32px 32px 24px;
}

.auth-card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.auth-card-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 28px;
}

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  padding: 0 32px 24px;
  margin: 0;
}

.auth-switch-btn {
  color: #7c3aed;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.auth-switch-btn:hover {
  color: #6d28d9;
}

@media (max-width: 768px) {
  .auth-page {
    padding: 24px 16px;
  }

  .auth-modal {
    width: 100%;
    max-width: 400px;
  }

  .auth-form {
    padding: 24px 24px 20px;
  }

  .auth-switch {
    padding: 0 24px 20px;
  }
}

.api-error {
  background: #fff5f5;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 20px;
  line-height: 1.4;
}

.field-wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.form-input--error {
  border-color: #e53e3e;
}

.form-input--error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.error-text {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1.3;
}

.btn-primary {
  width: 100%;
  padding: 12px 20px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
