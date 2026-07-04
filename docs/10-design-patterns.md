# 10 - Design Patterns

## Padrões encontrados no projeto

### 1. Composition API com `<script setup>`

**Todos** os componentes `.vue` usam `<script setup lang="ts">`. Este é o padrão universal do projeto.

```vue
<script setup lang="ts">
import { ref, reactive, computed } from "vue";
// lógica aqui
</script>
```

---

### 2. Composable Pattern (TanStack Query hooks)

Cada endpoint da API é encapsulado em um hook/composable que retorna uma query ou mutation do TanStack Query.

**Padrão para queries:**
```ts
// requests/Events/ListEvents/listEvent.ts
async function getListEvents(): Promise<Event[]> { /* chamada HTTP */ }

export function useGetListEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getListEvents,
    staleTime: 1000 * 60 * 10,
  });
}
```

**Padrão para mutations:**
```ts
// requests/Events/CreateEvent/createEvent.ts
type CreateEventParams = { form: { ... } };

const createEventRequest = async ({ form }: CreateEventParams) => { /* POST */ };

export const useCreateEventRequest = () => {
  return useMutation({ mutationFn: createEventRequest });
};
```

---

### 3. Repository Pattern (Requests Layer)

A pasta `src/requests/` atua como camada de repositório, abstraindo as chamadas HTTP e fornecendo hooks tipados para os componentes.

```
Componente → useXxxRequest() → função request → http (axios) → API
```

---

### 4. Reactive Form Pattern

Formulários seguem um padrão consistente em todo o projeto:

```ts
// 1. Objeto inicial separado
const initialForm = { name: "", email: "" };

// 2. Form reativo
const form = reactive({ ...initialForm });

// 3. Erros paralelos ao form
const formErrors = reactive({ name: "", email: "" });

// 4. Reset reatribuindo do initial
const resetForm = () => {
  Object.assign(form, { ...initialForm });
};

// 5. Validação populando erros e retornando boolean
const validateForm = (): boolean => {
  formErrors.name = "";
  if (!form.name.trim()) { formErrors.name = "Obrigatório"; return false; }
  return true;
};

// 6. Submit com validação + try/catch
const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await mutation.mutateAsync({ form });
    resetForm();
  } catch (error) {
    submitError.value = "Mensagem de erro";
  }
};
```

Este padrão é usado em:
- `NewEvent.vue`
- `NewCalendar.vue`
- `Login/index.vue` (Register e Login)

---

### 5. Modal Pattern (v-model + overlay)

Todos os modais seguem exatamente o mesmo padrão:

```ts
// Props: visible
defineProps<{ visible: boolean }>();

// Emit: update:visible (suporta v-model)
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

// Close helper
const close = () => emit("update:visible", false);

// Overlay click to close
const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};
```

```html
<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      <!-- conteúdo -->
    </div>
  </div>
</template>
```

**Uso pelo pai:**
```html
<ModalComponent v-model:visible="showModal" />
```

---

### 6. Singleton HTTP Client

O Axios é instanciado uma única vez em `src/services/http.ts` e exportado como default. Toda a aplicação usa esta mesma instância.

---

### 7. Observer Pattern (Vue Reactivity)

O projeto usa extensivamente a reatividade do Vue:
- `watch()` para sincronizar props com estado local (ex: `CalendarCard.vue` watch bidirecional do `modelValue`)
- `computed()` para dados derivados de queries e filtros
- `watchEffect` não é usado

---

### 8. Token Refresh Queue Pattern

No interceptor de response (`http.ts`), requisições que falham com 401 durante um refresh em andamento são enfileiradas:

```ts
if (isRefreshing) {
  return new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return http(originalRequest);
  });
}
```

Isso evita que múltiplas requisições concorrentes disparem refresh simultaneamente.

---

### 9. Tab Pattern

Usado em `EventListPanel.vue` e `CalendarActions.vue`:

```ts
const activeTab = ref<"tab1" | "tab2">("tab1");

const tabs = [
  { key: "tab1" as const, label: "Label 1" },
  { key: "tab2" as const, label: "Label 2" },
];
```

```html
<div class="tabs">
  <button
    v-for="tab in tabs"
    :key="tab.key"
    :class="['tab', { active: activeTab === tab.key }]"
    @click="activeTab = tab.key"
  >
    {{ tab.label }}
  </button>
</div>

<div v-if="activeTab === 'tab1'">...</div>
<div v-if="activeTab === 'tab2'">...</div>
```

---

### 10. Calendar Map Pattern

Em `EventListPanel.vue` e `DayEvents.vue`, calendários são convertidos em um `Map<string, Calendar>` para lookup O(1):

```ts
const calendarMap = computed(() => {
  const map = new Map<string, Calendar>();
  for (const cal of calendars.value) {
    map.set(cal.id, cal);
  }
  return map;
});
```

---

## Padrões NÃO encontrados

- Container/Presentational: não há separação formal
- Factory: não utilizado
- Strategy: não utilizado
- Dependency Injection: não utilizado (Vue's provide/inject não é usado)
- Custom Directives: não utilizados
- Composables reutilizáveis além dos hooks de API: não existem
