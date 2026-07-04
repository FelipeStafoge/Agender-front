# 15 - AI Context

## Instruções para agentes de IA

Este documento contém regras estritas para qualquer IA que for implementar funcionalidades neste projeto. Siga-as **sem exceções**.

---

## Regras fundamentais

### 1. Sempre seguir os padrões existentes

- NÃO invente novos padrões. Copie exatamente o que já existe.
- NÃO introduza bibliotecas novas sem necessidade absoluta.
- NÃO refatore código existente a menos que seja explicitamente solicitado.

### 2. Arquitetura da aplicação

```
Página (modules/) → Hook de request (requests/) → Axios (services/http.ts) → API
                         ↓
                  TanStack Query Cache → Re-renderiza componentes
                         ↓
                  Pinia Store (apenas auth)
```

- **Regras de negócio**: ficam nos componentes (validação) ou nos hooks de request (transformação)
- **Chamadas HTTP**: SEMPRE via hooks em `src/requests/`
- **Tipos**: em `src/types/api.ts` (compartilhados) ou locais no arquivo de request
- **Estado do servidor**: TanStack Query (queries e mutations)
- **Estado de autenticação**: Pinia store `useAuth`
- **Estado local de UI**: `ref()` e `reactive()` nos componentes

### 3. Quando criar uma página

- Crie em `src/modules/NomeDaPagina/index.vue`
- Use `<script setup lang="ts">` e `<style scoped>`
- Adicione rota em `src/router/router.ts`
- Se autenticada, coloque dentro do children de `/` com `meta: { requiresAuth: true }`
- Se pública, adicione como rota irmã de `/login`
- Reutilize componentes existentes (`EventListPanel`, `CalendarCard`)
- Use o layout `DefaultVueApp` para páginas autenticadas

### 4. Quando criar um componente

- Crie em `src/components/NomeComponente.vue` (ou subpasta `NomeComponente/index.vue`)
- Sempre tipifique props com `defineProps<T>()` ou `withDefaults(defineProps<T>(), {})`
- Sempre tipifique emits com `defineEmits<{...}>()`
- Sempre use `<style scoped>`
- Para modais: siga o padrão `v-model:visible` + overlay click to close

### 5. Quando criar uma chamada de API

- Crie em `src/requests/Dominio/nomeDaOperacao.ts`
- **Query (GET)**: exporte função pura `async` + hook `useGetXxx()` com `useQuery`
- **Mutation (POST/PUT/DELETE)**: exporte função pura `async` + hook `useXxxRequest()` com `useMutation`
- Sempre defina `staleTime` nas queries (5 ou 10 minutos)
- Sempre use `useMutation` com `mutationFn` para POST/PUT/DELETE
- No componente, use `mutateAsync` (não `mutate`) para poder usar await

### 6. Quando criar um formulário

- Use o **Reactive Form Pattern**:

```ts
const initialForm = { campo1: "", campo2: "" };
const form = reactive({ ...initialForm });
const formErrors = reactive({ campo1: "", campo2: "" });
const submitError = ref("");

const validateForm = (): boolean => {
  // limpa erros, valida campos, popula formErrors
  // retorna true se válido
};

const resetForm = () => {
  Object.assign(form, { ...initialForm });
  // limpa erros
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await mutation.mutateAsync({ form });
    queryClient.invalidateQueries({ queryKey: ["recurso"] });
    resetForm();
    close(); // se for modal
  } catch {
    submitError.value = "Mensagem de erro";
  }
};
```

### 7. Sistema de cores

Use **exatamente** estas cores (hard-coded, sem variáveis CSS):

| Propósito | Hex |
|---|---|
| Primário (botões, tabs ativas) | `#7c3aed` |
| Hover primário | `#6d28d9` |
| Erro | `#e53e3e` |
| Texto principal | `#1f2937` |
| Texto secundário | `#374151` / `#4a5568` |
| Texto muted | `#6b7280` / `#9ca3af` |
| Fundo de cards de evento | `#f9fafb` |
| Fundo de CalendarCard | `#eef2ff` |
| Fundo de badge | `#f3e8ff` |
| Fundo de erro | `#fff5f5` |
| Borda de input padrão | `#d1d5db` ou `#ccc` |
| Borda de tabs | `#e5e7eb` |
| Divisores | `#d0d0d0` |

### 8. Border radius

| Elemento | Valor |
|---|---|
| Modais | `12px` |
| Cards | `8px` a `12px` |
| Botões | `8px` |
| Inputs | `8px` |
| Tags/Badges | `999px` |

### 9. Fontes e tamanhos

| Elemento | Tamanho | Peso |
|---|---|---|
| Títulos | `18px` a `22px` | `600` |
| Botões | `15px` a `16px` | `500` a `600` |
| Inputs | `14px` | `400` |
| Labels | `13px` | `500` |
| Texto corpo | `13px` a `14px` | `400` a `500` |
| Erros | `12px` a `13px` | `400` |

### 10. Padrões de código

- **Nomes de arquivo de componente**: PascalCase (`CalendarCard.vue`)
- **Nomes de hooks**: `useGet` + Recurso para queries, `use` + Verbo + Recurso + `Request` para mutations
- **Nomes de handlers**: `handle` + Ação (`handleSubmit`, `handleLogin`)
- **Nomes de eventos emitidos**: kebab-case no template (`@day-click`, `@update:model-value`)
- **Imports**: use path alias `@/` sempre
- **Tipos**: use `import type` quando só tipo é necessário

### 11. Tratamento de estados

SEMPRE trate estes estados em componentes que usam queries:
```html
<div v-if="isPending">Carregando...</div>
<div v-else-if="error">Erro ao carregar</div>
<div v-else-if="!data.length">Mensagem de empty state</div>
<div v-else><!-- dados --></div>
```

Para submits:
```html
<button :disabled="mutation.isPending.value">
  {{ mutation.isPending.value ? 'Carregando...' : 'Confirmar' }}
</button>
<p v-if="submitError" class="error-text">{{ submitError }}</p>
```

### 12. O que NUNCA fazer

- NUNCA use framework CSS (Bootstrap, Tailwind) — o projeto usa CSS puro
- NUNCA crie estilos globais (exceto reset em `index.css`)
- NUNCA acesse `http` (axios) diretamente nos componentes — use hooks de `requests/`
- NUNCA use `any` quando o tipo é conhecido
- NUNCA duplique lógica de formulário — siga o Reactive Form Pattern
- NUNCA crie stores Pinia para dados do servidor — use TanStack Query
- NUNCA use bibliotecas de ícones — use SVGs inline
- NUNCA mude o formato de data (`dd/mm/yyyy`) — use o helper `formatDate`
- NUNCA crie variantes de estilo diferentes — mantenha consistência com o existente

### 13. Checklist antes de finalizar

- [ ] O componente usa `<script setup lang="ts">`
- [ ] Props e emits estão tipados
- [ ] O estilo usa `<style scoped>`
- [ ] Chamadas de API passam pelos hooks em `requests/`
- [ ] Formulários seguem o Reactive Form Pattern
- [ ] Loading, erro e empty state estão tratados
- [ ] Cores e tamanhos seguem as tabelas acima
- [ ] Nomes de arquivos, funções e variáveis seguem as convenções
- [ ] O código não introduz novas dependências
- [ ] `vue-tsc --build` passa sem erros no novo código

### 14. Referência rápida de arquivos

| O que | Onde |
|---|---|
| Tipos compartilhados | `src/types/api.ts` |
| HTTP client | `src/services/http.ts` |
| Auth store | `src/utils/Authentication/auth.ts` |
| Formatação de data | `src/utils/formatDate.ts` |
| Rotas | `src/router/router.ts` |
| Layout autenticado | `src/layouts/DefaultVueApp.vue` |
| Páginas | `src/modules/` |
| Componentes | `src/components/` + `src/modals/` |
| Chamadas de API | `src/requests/` |
