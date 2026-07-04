# 08 - State Management

## Store utilizada

O projeto usa **Pinia** (v3.0.4) com a **Composition API syntax** (`defineStore` com setup function).

---

## Organização

Existe **apenas uma store**: `useAuth` definida em `src/utils/Authentication/auth.ts`.

Não existem outras stores. O estado do servidor (eventos, calendários) é gerenciado exclusivamente pelo **TanStack Query** (cache de queries).

---

## Estados globais

### `useAuth` store

```ts
export const useAuth = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token"));
  const user = ref<{
    account_id: string;
    userName: string;
    userCode: string;
    userEmail: string;
  } | null>(JSON.parse(localStorage.getItem("user") || "null"));
  const isAuth = ref(false);

  // ... actions e computed
});
```

**Estado persistido**: `token` e `user` são inicializados do `localStorage` e sincronizados de volta em cada mutation.

| Estado | Tipo | Persistência |
|---|---|---|
| `token` | `Ref<string \| null>` | localStorage `"token"` |
| `user` | `Ref<{ account_id, userName, userCode, userEmail } \| null>` | localStorage `"user"` |
| `isAuth` | `Ref<boolean>` | Não persistido (inicia `false`) |

---

## Actions

| Action | Parâmetros | Efeito |
|---|---|---|
| `setToken(tokenValue)` | `string` | Salva no localStorage + atualiza `token.value` |
| `setUser(userValue)` | `{ account_id, userName, userCode, userEmail }` | Salva no localStorage (JSON) + atualiza `user.value` |
| `setIsAuth(auth)` | `boolean` | Atualiza `isAuth.value` |

---

## Computed

| Computed | Retorno | Lógica |
|---|---|---|
| `isAuthenticated` | `boolean` | `token.value && user.value` (ambos truthy) |

**Uso de `isAuthenticated`**: Definido mas não é verificado no router guard atual. O guard do router verifica diretamente `localStorage.getItem("token")`.

---

## Fluxo de atualização

```
Login bem-sucedido
  ↓
loginRequest (em requests/login/index.ts)
  ↓
chama useAuth().setUser({ account_id, userName, userCode, userEmail })
  ↓
localStorage.setItem("user", JSON.stringify(userValue))
localStorage.setItem("token", data.token)
  ↓
Store atualizada (token.value, user.value)
  ↓
Router redireciona para / ou ?redirect

---

Logout
  ↓
Topbar: localStorage.removeItem("token")
  ↓
router.push("/login")
  ↓
(NOTA: não limpa localStorage "user" nem "refreshToken" no logout atual)
```

---

## Estado do servidor (TanStack Query)

Todo o estado de dados do servidor (eventos, calendários) é gerenciado pelo **TanStack Query**, não pelo Pinia.

### Queries ativas

| Query Key | Hook | staleTime | Dados |
|---|---|---|---|
| `["events"]` | `useGetListEvents()` | 10 min | `Event[]` |
| `["events", startDate, endDate, calendarId]` | `useGetListEventsByRange(...)` | 5 min | `Event[]` |
| `["listCalendar"]` | `useGetListCalendars()` | 10 min | `Calendar[]` |
| `["getUserInfo", NameWithCode]` | `useGetUserInfo(name)` | 10 min | `UserInfo` |

### Invalidação de cache

Após mutations bem-sucedidas, o cache é invalidado:
```ts
queryClient.invalidateQueries({ queryKey: ["events"] });
queryClient.invalidateQueries({ queryKey: ["listCalendar"] });
```

Isso força a refetch dos dados atualizados em todos os componentes que consomem essas queries.

---

## Estado local (componente)

Cada componente gerencia seu próprio estado de UI com `ref()` e `reactive()`:

| Tipo | Uso típico |
|---|---|
| `reactive({ ... })` | Estado de formulários e erros de validação |
| `ref(false)` | Controle de visibilidade de modais |
| `ref("")` | Mensagens de erro de API, inputs de busca |
| `ref<Date>` | Datas selecionadas em datepickers |
| `computed()` | Dados derivados, filtros, marcadores de calendário |

**Não existem composables reutilizáveis para estado de formulário** — cada componente implementa seu próprio padrão de validação e reset.
