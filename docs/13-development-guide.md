# 13 - Development Guide

## Como criar uma nova página

1. Crie a pasta em `src/modules/NomePagina/`
2. Crie o arquivo `index.vue` com `<script setup lang="ts">`
3. Adicione a rota em `src/router/router.ts`:
   ```ts
   import NomePagina from "@/modules/NomePagina/index.vue";
   // Dentro de children de "/":
   { path: "nome-rota", component: NomePagina, meta: { requiresAuth: true } }
   ```
4. Use `<style scoped>` para estilos locais

**Template de página:**
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
// imports de requests, types, etc.
</script>

<template>
  <div class="page-container">
    <!-- conteúdo -->
  </div>
</template>

<style scoped>
.page-container {
  /* estilos */
}
</style>
```

---

## Como criar um novo componente

1. Crie o arquivo em `src/components/NomeComponente.vue` (ou `src/components/NomeComponente/index.vue` se tiver nome composto)
2. Use `<script setup lang="ts">` com Composition API
3. Tipifique props com `defineProps<T>()` ou `withDefaults(defineProps<T>(), {})`
4. Tipifique emits com `defineEmits<{...}>()`
5. Use `<style scoped>` para estilos locais

**Template de componente:**
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import type { SomeType } from "@/types/api";

const props = withDefaults(defineProps<{
  title: string;
  items?: SomeType[];
}>(), {
  items: () => [],
});

const emit = defineEmits<{
  (e: "select", item: SomeType): void;
}>();
</script>

<template>
  <div class="component-wrapper">
    <h3>{{ title }}</h3>
  </div>
</template>

<style scoped>
.component-wrapper {
  /* estilos */
}
</style>
```

---

## Como criar uma nova chamada de API

### Para queries (GET):

1. Crie o arquivo em `src/requests/Dominio/nomeDaQuery.ts`
2. Defina a função de request pura e o hook:

```ts
import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";
import type { MeuTipo } from "@/types/api";

async function getMeuRecurso(param: string): Promise<MeuTipo[]> {
  const { data } = await http.get("/auth/endpoint", {
    params: { param },
  });
  return data.data;
}

export function useGetMeuRecurso(param: string) {
  return useQuery<MeuTipo[]>({
    queryKey: ["meuRecurso", param],
    queryFn: () => getMeuRecurso(param),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
```

### Para mutations (POST/PUT/DELETE):

```ts
import http from "@/services/http";
import { useMutation } from "@tanstack/vue-query";

type MeuParam = {
  form: {
    campo1: string;
    campo2: number;
  };
};

async function criarRecurso({ form }: MeuParam) {
  const { data } = await http.post("/auth/endpoint", form);
  return data;
}

export function useCriarRecurso() {
  return useMutation({
    mutationFn: criarRecurso,
  });
}
```

### Uso no componente:

```ts
// Query
const { data, isPending, error } = useGetMeuRecurso(param);

// Mutation
const mutation = useCriarRecurso();

const handleSubmit = async () => {
  try {
    await mutation.mutateAsync({ form: { ... } });
    queryClient.invalidateQueries({ queryKey: ["meuRecurso"] });
  } catch (error) {
    submitError.value = "Erro ao criar.";
  }
};
```

---

## Como criar um novo composable

1. Crie em `src/utils/` ou `src/composables/` (a pasta `composables/` ainda não existe)
2. Use o padrão `use` prefix:

```ts
// src/utils/useMeuComposable.ts
import { ref, computed } from "vue";

export function useMeuComposable(initialValue: string) {
  const value = ref(initialValue);
  const doubled = computed(() => value.value + value.value);

  function update(newVal: string) {
    value.value = newVal;
  }

  return { value, doubled, update };
}
```

**NOTA**: Atualmente não existem composables reutilizáveis. Os únicos "composables" são os hooks de API em `src/requests/`.

---

## Como criar uma nova store (Pinia)

1. Crie o arquivo em `src/utils/NomeStore/` ou diretamente em `src/utils/`
2. Use `defineStore` com setup function:

```ts
// src/utils/NomeStore/nomeStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useNomeStore = defineStore("nomeStore", () => {
  const items = ref<string[]>([]);

  function addItem(item: string) {
    items.value.push(item);
  }

  const itemCount = computed(() => items.value.length);

  return { items, addItem, itemCount };
});
```

3. Se precisar de persistência, use `localStorage` manualmente (não há plugin de persistência)

---

## Como criar um novo tipo

1. Adicione a interface/type em `src/types/api.ts`:

```ts
export interface MeuNovoTipo {
  id: string;
  nome: string;
  dataCriacao: string;
}
```

2. Importe onde necessário:
```ts
import type { MeuNovoTipo } from "@/types/api";
```

**NOTA**: Tipos locais (específicos de um request) são definidos no próprio arquivo de request.

---

## Como criar uma nova rota

1. Crie o componente da página em `src/modules/`
2. No `src/router/router.ts`:
   - Importe o componente
   - Adicione a rota dentro do array `children` de `/` (se autenticada) ou como rota irmã (se pública)
   - Adicione `meta: { requiresAuth: true }` se precisar de autenticação

```ts
// Se for uma rota autenticada:
{
  path: "/",
  component: () => DefaultVueApp,
  children: [
    // ... rotas existentes
    { path: "minha-rota", component: MinhaPagina, meta: { requiresAuth: true } },
  ],
}

// Se for uma rota pública:
{ path: "/minha-rota", component: MinhaPagina },
```

3. Se precisar de um novo layout, crie em `src/layouts/` e use como `component` pai

---

## Como criar um novo modal

Siga o padrão de modal existente:

```vue
<script setup lang="ts">
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();

const close = () => emit("update:visible", false);
const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      <!-- conteúdo -->
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}
</style>
```

**Uso no pai:**
```vue
<MeuModal v-model:visible="showModal" />
```

---

## Como criar um formulário com validação

Siga o Reactive Form Pattern:

```ts
const initialForm = { campo1: "", campo2: "" };
const form = reactive({ ...initialForm });
const formErrors = reactive({ campo1: "", campo2: "" });
const submitError = ref("");

const validateForm = (): boolean => {
  formErrors.campo1 = "";
  formErrors.campo2 = "";
  let valid = true;
  
  if (!form.campo1.trim()) {
    formErrors.campo1 = "Campo 1 é obrigatório";
    valid = false;
  }
  
  return valid;
};

const resetForm = () => {
  Object.assign(form, { ...initialForm });
  formErrors.campo1 = "";
  formErrors.campo2 = "";
  submitError.value = "";
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await mutation.mutateAsync({ form });
    queryClient.invalidateQueries({ queryKey: ["recurso"] });
    resetForm();
  } catch {
    submitError.value = "Erro ao processar.";
  }
};
```
