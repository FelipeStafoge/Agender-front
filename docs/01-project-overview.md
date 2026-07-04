# 01 - Project Overview

## Objetivo do sistema

**Agender** é um aplicativo web de agendamento de eventos com calendários compartilhados. Permite que usuários criem eventos pessoais ou vinculados a calendários, convidem participantes e visualizem compromissos em diferentes horizontes de tempo (24h, 7 dias, 30 dias).

O slogan do sistema é "seu app de agendamento".

---

## Tecnologias utilizadas

### Framework e linguagem

| Tecnologia | Versão | Uso |
|---|---|---|
| **Vue 3** | ^3.5.32 | Framework SPA com Composition API (`<script setup lang="ts">`) |
| **TypeScript** | ~6.0.0 | Tipagem estática em todo o projeto |
| **Vite** | ^8.0.8 | Build tool e dev server |

### Bibliotecas principais

| Biblioteca | Versão | Propósito |
|---|---|---|
| `vue-router` | ^5.1.0 | Roteamento SPA (History mode) |
| `pinia` | ^3.0.4 | Gerenciamento de estado global (auth store) |
| `@tanstack/vue-query` | ^5.101.0 | Gerenciamento de estado do servidor (queries e mutations) |
| `axios` | ^1.18.0 | Cliente HTTP com interceptors para autenticação |
| `@vuepic/vue-datepicker` | ^14.0.0 | Componente de calendário/datepicker inline |
| `@ckpack/vue-color` | ^1.6.0 | Color picker (componente `Compact`) |

### Ferramentas de desenvolvimento

| Ferramenta | Uso |
|---|---|
| `vue-tsc` | Type check em arquivos `.vue` |
| `npm-run-all2` | Execução paralela de scripts (build + type-check) |
| `prettier` | Formatação de código (presente como dependência) |
| `vite-plugin-vue-devtools` | Vue DevTools integrado ao Vite |

---

## Estrutura geral do projeto

O projeto segue uma estrutura modular por feature dentro de `src/`:

```
src/
├── main.ts                 # Ponto de entrada: cria app Vue + plugins
├── App.vue                 # Root component: renderiza <router-view />
├── index.css               # Reset CSS global (*{box-sizing,margin,padding:0})
├── router/router.ts        # Configuração de rotas e guards
├── types/api.ts            # Tipos TypeScript compartilhados
├── services/http.ts        # Axios instance + interceptors (auth/refresh)
├── env.d.ts                # Declarações de tipos de ambiente (.vue modules)
│
├── layouts/                # Layouts da aplicação
│   └── DefaultVueApp.vue   # Layout autenticado (Topbar + conteúdo)
│
├── modules/                # Páginas da aplicação (roteadas)
│   ├── Home/index.vue
│   ├── Login/index.vue
│   ├── Calendar/Calendar.vue
│   └── Profile/index.vue
│
├── components/             # Componentes reutilizáveis
│   ├── Topbar/index.vue
│   ├── CalendarCard.vue
│   └── EventListPanel.vue
│
├── modals/                 # Componentes de modal (dialogs)
│   ├── NewEvent/NewEvent.vue
│   ├── NewCalendar/NewCalendar.vue
│   ├── CalendarActions/CalendarActions.vue
│   └── DayEvents/DayEvents.vue
│
├── requests/               # Chamadas de API (TanStack Query)
│   ├── login/
│   ├── register/
│   ├── Events/
│   │   ├── ListEvents/
│   │   ├── ListEventsByRange/
│   │   ├── CreateEvent/
│   │   └── getUserInfo/
│   └── Calendar/
│       ├── getListCalendar.ts
│       ├── createNewCalendar.ts
│       ├── deleteCalendar.ts
│       ├── leaveCalendar.ts
│       ├── addParticipantInCalendar.ts
│       └── removeParticipantInCalendar.ts
│
└── utils/
    ├── Authentication/auth.ts   # Pinia store de autenticação
    └── formatDate.ts            # Helper de formatação de data
```

---

## Convenções utilizadas

### Nomenclatura de arquivos

- Componentes Vue: **PascalCase** (ex: `CalendarCard.vue`, `EventListPanel.vue`)
- Páginas dentro de `modules/`: `index.vue` ou `Calendar/Calendar.vue`
- Requests/API: **camelCase** para funções exportadas (ex: `getListEvents`, `useCreateEventRequest`)
- Pastas: **PascalCase** para módulos e componentes; **camelCase** para requests

### Padrões de código

- **Composition API** com `<script setup lang="ts">` em todos os componentes
- **Tipagem estrita**: todas as props, emits e retornos de API são tipados
- **scoped CSS**: todos os componentes usam `<style scoped>`, sem framework CSS
- **Sem CSS framework**: estilização manual com CSS puro em cada componente
- **Path alias `@`**: mapeado para `src/` via Vite e tsconfig
- **Formatação de data**: padrão `dd/mm/yyyy` (via helper `formatDate`)

### Padrões de estado

- **Estado do servidor**: `@tanstack/vue-query` para todas as chamadas de API (queries e mutations)
- **Estado global**: Pinia apenas para autenticação (`useAuth` store)
- **Estado local**: `reactive()` e `ref()` para formulários e UI dentro dos componentes

### Padrões de formulário

- Formulários usam `reactive({ ...initialForm })` com um objeto `initialForm` separado
- Erros de validação em `reactive({ field: "" })` paralelo ao form
- Função `resetForm()` usa `Object.assign(form, { ...initialForm })`
- Função `validateForm()` retorna `boolean` e popula objeto de erros
- Erros de API exibidos via `ref("")` como banner de erro geral
