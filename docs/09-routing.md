# 09 - Routing

## Configuração

Arquivo: `src/router/router.ts`

- **Modo**: History (`createWebHistory`)
- **Lazy loading**: Não utilizado (todos os componentes importados estaticamente)

---

## Todas as rotas

| Path | Componente | Layout | Auth | Descrição |
|---|---|---|---|---|
| `/` | `Home` | `DefaultVueApp` | Sim (`requiresAuth: true`) | Dashboard |
| `/calendar` | `Calendar` | `DefaultVueApp` | Sim (`requiresAuth: true`) | Calendário |
| `/profile` | `Profile` | `DefaultVueApp` | Sim (`requiresAuth: true`) | Perfil |
| `/login` | `Login` | Nenhum (standalone) | Não | Login/Register |

### Estrutura das rotas

```ts
const routes = [
  {
    path: "/",
    component: () => DefaultVueApp,  // Layout wrapper (não lazy)
    children: [
      { path: "", component: Home, meta: { requiresAuth: true } },
      { path: "calendar", component: Calendar, meta: { requiresAuth: true } },
      { path: "profile", component: Profile, meta: { requiresAuth: true } },
    ],
  },
  { path: "/login", component: Login },
];
```

---

## Layout utilizado

| Layout | Rotas |
|---|---|
| `DefaultVueApp.vue` | `/`, `/calendar`, `/profile` |
| Nenhum | `/login` |

O `DefaultVueApp` renderiza `<Topbar />` + `<router-view />` dentro de um container com fundo gradiente roxo e área de conteúdo branca.

---

## Guards

### `beforeEach` global

```ts
router.beforeEach((to) => {
  const token = localStorage.getItem("token");

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
```

**Lógica:**
1. Se rota requer auth (`meta.requiresAuth`) e não há token → redireciona para `/login?redirect=...`
2. Se está em `/login` e já tem token → redireciona para `/`

**Origem do token**: `localStorage.getItem("token")` — setado no login/register.

**NOTA**: Existe código comentado/incompleto no guard sobre verificar `userAuthenticated` do localStorage:
```ts
const userAuthenticated = localStorage.getItem("user");
if (!userAuthenticated) {
  // refaz chamada pra puxar infos do usuario
}
```
Este trecho está presente mas não implementado (comentário vazio).

---

## Autenticação

- **Tipo**: Token-based (Bearer)
- **Armazenamento**: localStorage
  - `token` — access token
  - `refreshToken` — refresh token
  - `user` — dados do usuário (JSON)
- **Renovação**: Automática via interceptor de response do Axios

### Fluxo de refresh token

```
Requisição falha com 401
  ↓
Interceptor verifica se NÃO é rota de auth
  ↓
Tenta POST /auth/refresh com refreshToken
  ↓
Sucesso → atualiza token, reexecuta requisição original
  ↓
Falha → limpa localStorage, redireciona para /login
  ↓
Requisições concorrentes são enfileiradas durante o refresh
```

Rotas excluídas do refresh: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/profile`

---

## Permissões

Não existe sistema de roles/permissões além de:
- `requiresAuth: true` no meta da rota → verifica existência de token
- `isOwner` computed no `CalendarActions.vue` → verifica se `participant.role === "Owner"` para o usuário atual

---

## Lazy loading

**Não utilizado.** Todos os componentes são importados estaticamente no topo do arquivo `router.ts`:

```ts
import Home from "@/modules/Home/index.vue";
import Calendar from "@/modules/Calendar/Calendar.vue";
import Login from "@/modules/Login/index.vue";
import Profile from "@/modules/Profile/index.vue";
import DefaultVueApp from "@/layouts/DefaultVueApp.vue";
```
