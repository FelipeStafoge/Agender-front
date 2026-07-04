# 14 - Best Practices

## Práticas realmente utilizadas no projeto

### Tipagem

- **Sempre tipar respostas da API** — todos os hooks `useQuery<T>()` e `useMutation()` têm tipos genéricos
- **Sempre tipar props** com `defineProps<T>()` ou `withDefaults(defineProps<T>(), {})`
- **Sempre tipar emits** com `defineEmits<{...}>()`
- **Usar `import type`** para imports exclusivamente de tipo
- **Evitar `any`** — usar `unknown` quando o tipo não é conhecido

### Organização de código

- **Nunca acessar API diretamente na página** — sempre passar pelos hooks em `src/requests/`
- **Manter estado do servidor no TanStack Query** — não duplicar no Pinia ou localStorage
- **Manter estado de autenticação no Pinia** — única store global
- **Usar `reactive()` para formulários** — não `ref()` para objetos de formulário
- **Inicializar formulários com um objeto separado** (`initialForm`) para facilitar reset
- **Manter erros de validação em objeto paralelo ao formulário** — `formErrors` com mesmas chaves

### Componentes

- **Sempre reutilizar componentes existentes** — `EventListPanel`, `CalendarCard`, etc.
- **Sempre usar `<style scoped>`** — nunca estilos globais (exceto `index.css`)
- **Componentes modais seguem o padrão v-model** — `v-model:visible`
- **Fechar modal ao clicar no overlay** — `onOverlayClick` padrão
- **Nomes de eventos com kebab-case no template** — `@update:model-value`, `@day-click`

### API / Requests

- **Sempre usar hooks do TanStack Query** — `useQuery` para GET, `useMutation` para POST/PUT/DELETE
- **Sempre definir `staleTime` nas queries** — tipicamente 5 ou 10 minutos
- **Invalidar cache após mutations** — `queryClient.invalidateQueries({ queryKey: [...] })`
- **Usar `mutateAsync` (não `mutate`)** — para poder usar try/catch com await
- **Extrair mensagem de erro da API** — `error.response?.data?.message`

### Padrões de submit

- **Validar antes de submeter** — `if (!validateForm()) return`
- **Usar try/catch no submit** — capturar erro e mostrar mensagem
- **Resetar formulário após sucesso** — `resetForm()` + `close()` para modais
- **Desabilitar botão durante loading** — `:disabled="mutation.isPending.value"`
- **Mostrar texto de loading no botão** — `{{ isPending ? "Criando..." : "Confirmar" }}`

### Estilo

- **Seguir o sistema de cores existente** — `#7c3aed` para roxo primário, `#e53e3e` para erro
- **Usar os mesmos border-radius** — `8px` botões/inputs, `12px` modais/cards
- **Usar as mesmas fontes e tamanhos** — `13px` labels, `14px` inputs, `15px` botões
- **Não usar framework CSS** — estilização manual com scoped CSS
- **Não usar variáveis CSS** — valores hard-coded (padrão atual do projeto)
- **Ícones são SVGs inline** — não usar bibliotecas de ícones

### Formatação de data

- **Sempre usar `formatDate` do helper** — `src/utils/formatDate.ts`
- **Formato padrão**: `dd/mm/yyyy`
- **Para parse**: split por `/` e criar `new Date(year, month-1, day)`

### Navegação

- **Usar `router.push()` para navegação programática** — não `<a href>`
- **Verificar `requiresAuth` no meta da rota** — adicionar para páginas protegidas
- **Redirecionar com `?redirect=` no login** — `query: { redirect: to.fullPath }`

### Autenticação

- **Ler token do localStorage** — `localStorage.getItem("token")`
- **Persistir dados do usuário no localStorage** — `localStorage.setItem("user", JSON.stringify(...))`
- **Anexar token via interceptor do Axios** — não manualmente em cada request
- **Refresh token é automático** — via interceptor de response

### Performance

- **Não há lazy loading de rotas** — todos os componentes importados estaticamente
- **Stale time nas queries** — reduz refetchs desnecessários (5-10 min)
- **Não há memoização explícita** — Vue reactivity + computed são suficientes

### Tratamento de estados da UI

- **Sempre tratar loading** — `v-if="isPending"` com mensagem "Carregando..."
- **Sempre tratar erro** — `v-else-if="error"` com mensagem de erro
- **Sempre tratar empty state** — `v-if="items.length === 0"` com mensagem contextual
- **Sempre tratar erro de API no submit** — banner de erro geral acima do formulário

### Segurança

- **Tokens no localStorage** — (padrão atual, sem httpOnly cookies)
- **Limpar token no logout** — `localStorage.removeItem("token")`
- **Verificar token no guard do router** — `beforeEach`
- **Não expor secrets no código** — `VITE_API_URL` via variável de ambiente

### O que NÃO fazer

- Não criar estilos diferentes dos existentes — manter consistência visual
- Não duplicar lógica de formulário — seguir o Reactive Form Pattern
- Não acessar `http` diretamente nos componentes — usar hooks de request
- Não usar `any` quando o tipo é conhecido
- Não criar stores Pinia para dados que podem ser queries do TanStack Query
- Não usar CSS global (exceto reset em `index.css`)
- Não usar bibliotecas de componentes UI — não faz parte do padrão do projeto
- Não criar novos patterns de modal — seguir o padrão v-model + overlay existente
