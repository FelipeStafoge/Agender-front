# 11 - Coding Standards

## Nome de arquivos

| Tipo | Convenção | Exemplos |
|---|---|---|
| Componentes Vue | **PascalCase** | `CalendarCard.vue`, `Topbar/index.vue`, `EventListPanel.vue` |
| Módulos/Páginas | `index.vue` ou `Nome/Nome.vue` | `Login/index.vue`, `Calendar/Calendar.vue` |
| Modais | `Nome/Nome.vue` | `NewEvent/NewEvent.vue`, `DayEvents/DayEvents.vue` |
| Requests (hooks) | **camelCase** | `listEventsByRange.ts`, `getListCalendar.ts` |
| Services | **camelCase** | `http.ts` |
| Types | **camelCase** | `api.ts` |
| Utils | **camelCase** | `formatDate.ts` |
| Pastas de requests | **PascalCase** para domínios | `Events/`, `Calendar/` |
| Config files | lowercase com hífen | `vite.config.ts`, `tsconfig.json` |

---

## Nome de componentes

- PascalCase para nome do componente: `CalendarCard`, `EventListPanel`, `NewEvent`
- Nome descritivo que indica função: `CalendarActions`, `DayEvents`
- Subpastas quando o componente tem nome composto: `Topbar/index.vue`

## Nome de hooks/composables

- **Queries**: prefixo `useGet` + nome do recurso + descritivo:
  - `useGetListEvents()`
  - `useGetListEventsByRange()`
  - `useGetListCalendars()`
  - `useGetUserInfo()`
- **Mutations**: prefixo `use` + verbo + recurso + `Request`:
  - `useLoginRequest()`
  - `useRegisterRequest()`
  - `useCreateEventRequest()`
  - `useCreateCalendarRequest()`
  - `useDeleteCalendarRequest()`
  - `useLeaveCalendarRequest()`
  - `useAddParticipantInCalendar()`
  - `useRemoveParticipantInCalendar()`

---

## Nome de variáveis

| Contexto | Convenção | Exemplos |
|---|---|---|
| Estado reativo | **camelCase** | `date`, `showModal`, `activeTab` |
| Formulários | sufixo `Form` camelCase | `Registerform`, `Loginform`, `newEventForm` |
| Inicial de formulário | prefixo `initial` PascalCase | `RegisterinitialForm`, `newEventInitialForm` |
| Erros de formulário | sufixo `Errors` camelCase | `registerErrors`, `formErrors` |
| Erro de API | sufixo `ApiError` ou `Error` | `registerApiError`, `submitError` |
| Booleans | prefixo `is` ou `show` ou `has` | `isAuth`, `isPending`, `showCreateEventModal`, `isOwner` |
| Refs de elemento | camelCase com `ref` se explícito | Não utilizado (sem template refs) |

---

## Nome de funções

| Tipo | Convenção | Exemplos |
|---|---|---|
| Handlers de evento | prefixo `handle` + ação | `handleLogin`, `handleRegister`, `handleCreateEvent`, `handleDelete` |
| Event handlers | prefixo `on` + evento | `onOverlayClick`, `onCalendarDayClick`, `onMainDayClick`, `onDayClick` |
| Validação | prefixo `validate` + escopo | `validateForm`, `validateRegisterField`, `validateLoginForm` |
| Reset | prefixo `reset` + escopo | `resetForm`, `clearRegisterErrors` |
| Close | `close` | `close` (padrão em todos os modais) |
| Requests (função pura) | camelCase descritivo | `getListEvents`, `createEventRequest`, `loginRequest` |

---

## Convenções de import

- **Path alias `@/`** para tudo dentro de `src/`:
  ```ts
  import { useAuth } from "@/utils/Authentication/auth";
  import type { Event } from "@/types/api";
  ```
- **Import de tipos**: usa `import type` quando só tipo é necessário:
  ```ts
  import type { Event, Calendar } from "@/types/api";
  ```
- **Ordem de imports** (observada no código):
  1. Vue core (`vue`, `vue-router`)
  2. Bibliotecas externas (`@tanstack/vue-query`, `axios`, `@vuepic/vue-datepicker`)
  3. Imports internos (`@/requests/...`, `@/types/...`, `@/utils/...`)
- **Extensão nos imports**: `.ts` é explicitamente incluído em alguns imports de router:
  ```ts
  import router from "./router/router.ts";
  import { useAuth } from "./utils/Authentication/auth.ts";
  ```

---

## Convenções de export

- **Requests**: export nomeado para a função pura + export nomeado para o hook
  ```ts
  export const getListCalendars = async () => { ... };
  export const useGetListCalendars = () => { ... };
  ```
- **Store**: export nomeado
  ```ts
  export const useAuth = defineStore("auth", () => { ... });
  ```
- **HTTP client**: export default
  ```ts
  export default http;
  ```
- **Utils**: export nomeado
  ```ts
  export const formatDate = (date) => { ... };
  ```
- **Componentes**: export default via `<script setup>` (implícito no SFC)

---

## Uso de async/await

- Todas as funções de request usam `async/await` com `try/catch` no componente chamador
- `mutateAsync` é usado (não `mutate`) para aguardar a promise:
  ```ts
  await loginMutation.mutateAsync({ form });
  ```

## Tratamento de erros

```ts
// Padrão consistente em todos os submits:
try {
  await mutation.mutateAsync({ form });
  queryClient.invalidateQueries({ queryKey: [...] });
  resetForm();
  close();
} catch (error) {
  submitError.value = "Mensagem amigável";
}
```

No Login, erro da API é extraído:
```ts
const extractApiError = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return "Erro ao processar. Tente novamente.";
};
```

---

## Tipagem

- **Todas as props** são tipadas com `defineProps<T>()` ou `withDefaults(defineProps<T>(), {})`
- **Todos os emits** são tipados com `defineEmits<{...}>()`
- **Retornos de query/mutation** são tipados com genéricos: `useQuery<Event[]>({...})`
- **Parâmetros de request** têm tipos locais definidos: `type CreateEventParams = { ... }`
- **Sem `any`** — usa `unknown` ou tipos específicos quando possível
- Exceção: `@ckpack/vue-color` payload usa `any` pois a lib não exporta tipos
- `noUncheckedIndexedAccess: true` no tsconfig força verificações em acessos de array/objeto

---

## Organização dos arquivos

Dentro de um componente `.vue`:

```
<script setup lang="ts">
  // 1. Imports
  // 2. Props / Emits
  // 3. Stores / Router
  // 4. Reactive state (form, errors, refs)
  // 5. Constants (regex, initialForms)
  // 6. Computed
  // 7. Watchers
  // 8. Validation functions
  // 9. Handler functions
  // 10. Reset functions
</script>

<template>
  <!-- markup -->
</template>

<style scoped>
  /* local styles */
</style>
```

Dentro de um arquivo de request `.ts`:

```
// 1. Imports
// 2. Types locais (se houver)
// 3. Função de request pura (async)
// 4. Hook exportado (useQuery ou useMutation)
```
