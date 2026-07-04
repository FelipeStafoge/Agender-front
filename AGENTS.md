# AGENTS.md

## Restrições absolutas

- NUNCA use framework CSS (Tailwind, Bootstrap etc.) — o projeto usa CSS puro com `<style scoped>`
- NUNCA acesse `http` (axios) diretamente em componentes — use hooks de `src/requests/`
- NUNCA crie stores Pinia para dados do servidor — use TanStack Query (`useQuery` / `useMutation`)
- NUNCA use `any` — tipifique com `unknown` ou o tipo correto
- NUNCA use biblioteca de ícones — use SVGs inline com `viewBox="0 0 24 24"`
- NUNCA introduza novas dependências sem necessidade explícita
- NUNCA crie estilos globais — apenas `src/index.css` (reset) e `<style scoped>`
- NUNCA altere o formato de data (`dd/mm/yyyy`) — use o helper `formatDate` de `src/utils/formatDate.ts`
- NUNCA refatore código existente a menos que explicitamente solicitado

## Convenções de código

- Todo componente usa `<script setup lang="ts">` com Composition API
- Props tipadas com `defineProps<T>()` ou `withDefaults(defineProps<T>(), {})`
- Emits tipados com `defineEmits<{...}>()`
- Imports usam path alias `@/` (ex: `import { useAuth } from "@/utils/Authentication/auth"`)
- Tipos usam `import type` quando são apenas tipos
- Arquivos de componente: PascalCase (`CalendarCard.vue`) ou `index.vue` dentro de pasta PascalCase
- Hooks de query: prefixo `useGet` + Recurso (`useGetListEvents`, `useGetListCalendars`)
- Hooks de mutation: prefixo `use` + Verbo + Recurso + `Request` (`useCreateEventRequest`, `useDeleteCalendarRequest`)
- Handlers: prefixo `handle` + Ação (`handleSubmit`, `handleLogin`, `handleCreateEvent`)
- Eventos emitidos: kebab-case no template (`@day-click`, `@update:model-value`)

## Onde colocar cada coisa

| O que | Onde |
|---|---|
| Páginas | `src/modules/NomePagina/index.vue` |
| Componentes reutilizáveis | `src/components/NomeComponente.vue` |
| Modais | `src/modals/NomeModal/NomeModal.vue` |
| Chamadas de API | `src/requests/Dominio/nomeOperacao.ts` |
| Tipos compartilhados | `src/types/api.ts` |
| Tipos locais de request | No próprio arquivo de request |
| Stores Pinia | `src/utils/` (apenas auth atualmente) |
| Helpers/utilitários | `src/utils/` |
| Layouts | `src/layouts/` |

## Padrão de formulário (Reactive Form Pattern)

```ts
const initialForm = { campo1: "", campo2: "" };
const form = reactive({ ...initialForm });
const formErrors = reactive({ campo1: "", campo2: "" });
const submitError = ref("");

const validateForm = (): boolean => {
  // zera erros, valida cada campo, popula formErrors
  // retorna true se tudo válido
};

const resetForm = () => {
  Object.assign(form, { ...initialForm });
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await mutation.mutateAsync({ form });
    queryClient.invalidateQueries({ queryKey: ["recurso"] });
    resetForm();
    close();
  } catch {
    submitError.value = "Erro ao processar.";
  }
};
```

## Padrão de modal

```ts
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: "update:visible", value: boolean): void }>();
const close = () => emit("update:visible", false);
const onOverlayClick = (e: MouseEvent) => { if (e.target === e.currentTarget) close(); };
```
Uso no pai: `<MeuModal v-model:visible="showModal" />`

## Padrão de request (API)

### Query (GET)
```ts
import http from "@/services/http";
import { useQuery } from "@tanstack/vue-query";
import type { MeuTipo } from "@/types/api";

async function getMeuRecurso(): Promise<MeuTipo[]> {
  const { data } = await http.get("/auth/endpoint");
  return data.data;
}

export function useGetMeuRecurso() {
  return useQuery<MeuTipo[]>({
    queryKey: ["meuRecurso"],
    queryFn: getMeuRecurso,
    staleTime: 1000 * 60 * 10,
  });
}
```

### Mutation (POST/PUT/DELETE)
```ts
type MeuParams = { form: { campo1: string; campo2: string } };

async function criarRecurso({ form }: MeuParams) {
  const { data } = await http.post("/auth/endpoint", form);
  return data;
}

export function useCriarRecurso() {
  return useMutation({ mutationFn: criarRecurso });
}
```

## Padrão de rota

Rotas autenticadas: dentro de `children` de `/` com `meta: { requiresAuth: true }`.
Rotas públicas: como rota irmã de `/login` (ex: `{ path: "/login", component: Login }`).

## Tratamento de estados da UI

```html
<div v-if="isPending">Carregando...</div>
<div v-else-if="error">Erro ao carregar</div>
<div v-else-if="!data.length">Mensagem de empty state</div>
<div v-else><!-- dados --></div>
```

Botão com loading:
```html
<button :disabled="mutation.isPending.value">
  {{ mutation.isPending.value ? 'Carregando...' : 'Confirmar' }}
</button>
```

## Design System

### Cores (hard-coded, sem variáveis CSS)

| Propósito | Hex |
|---|---|
| Primário (botões, tabs) | `#7c3aed` |
| Hover primário | `#6d28d9` |
| Erro | `#e53e3e` |
| Texto principal | `#1f2937` |
| Texto secundário | `#374151` |
| Texto muted | `#6b7280` |
| Texto placeholder | `#9ca3af` |
| Fundo cards evento | `#f9fafb` |
| Fundo CalendarCard | `#eef2ff` |
| Fundo badge | `#f3e8ff` |
| Fundo erro | `#fff5f5` |
| Borda input | `#d1d5db` |
| Borda tabs | `#e5e7eb` |
| Divisores | `#d0d0d0` |

### Border radius

| Elemento | Valor |
|---|---|
| Modais | `12px` |
| Cards | `8px` a `12px` |
| Botões e inputs | `8px` |
| Badges/tags | `999px` |

### Tipografia

| Elemento | Tamanho | Peso |
|---|---|---|
| Títulos | `18px`–`22px` | `600` |
| Botões | `15px`–`16px` | `500`–`600` |
| Inputs | `14px` | `400` |
| Labels | `13px` | `500` |
| Corpo | `13px`–`14px` | `400`–`500` |
| Erros | `12px` | `400` |

### Espaçamentos comuns

`4px` (gap mínimo), `6px` (label-input), `8px` (gap nav-items, border-radius), `10px` (padding input/tabs), `12px` (padding eventos), `16px` (gap seções, padding cards), `24px`–`32px` (padding modais), `100px` (padding lateral do layout).

### Inputs

```css
.form-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  outline: none;
}
.form-input:focus { border-color: #7c3aed; }
.form-input--error { border-color: #e53e3e; }
```

### Botão primário

```css
background: #7c3aed;
color: #fff;
padding: 12px 20px;
border-radius: 8px;
border: none;
cursor: pointer;
/* hover: #6d28d9 */
/* disabled: opacity 0.6, cursor not-allowed */
```

### Modal

```css
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #fff; border-radius: 12px; position: relative; }
.close-btn { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
```

## Autenticação

- Token em `localStorage.getItem("token")` — injetado via interceptor do Axios
- Refresh token automático no interceptor de response (401)
- Store Pinia `useAuth` em `src/utils/Authentication/auth.ts` para dados do usuário
- Guard no router: `beforeEach` verifica `requiresAuth` no meta da rota
- Logout: `localStorage.removeItem("token")` + `router.push("/login")`

## Checklist de finalização

- [ ] `<script setup lang="ts">`
- [ ] Props e emits tipados
- [ ] `<style scoped>`
- [ ] API via hooks em `requests/`
- [ ] Formulários: Reactive Form Pattern
- [ ] Loading, erro e empty state tratados
- [ ] Cores e tamanhos seguem as tabelas acima
- [ ] `vue-tsc --build` sem erros no novo código
