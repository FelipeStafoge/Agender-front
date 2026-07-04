# 06 - Components

## Tabela de componentes reutilizáveis

| Nome | Descrição | Props | Onde é utilizado | Pode ser reutilizado para |
|---|---|---|---|---|
| **Topbar** | Barra superior com navegação | Nenhuma (usa store) | `DefaultVueApp.vue` | Barra de navegação de qualquer app |
| **CalendarCard** | Card de calendário com datepicker | `calendar`, `windowStart`, `windowEnd`, `modelValue` | `Calendar.vue` | Exibição de mini calendários |
| **EventListPanel** | Painel de eventos com tabs de tempo | `startDate`, `endDate`, `calendarId?`, `width?`, `maxHeight?`, `filterFn?` | `Home/index.vue` | Lista de eventos em qualquer página |
| **NewEvent** (modal) | Modal de criação de evento | `visible`, `calendarId?`, `calendarColor?`, `calendars?`, `initialDate?` | `Calendar.vue` | Criar eventos de qualquer lugar |
| **NewCalendar** (modal) | Modal de criação de calendário | `visible` | `Calendar.vue` | Criar calendários de qualquer lugar |
| **CalendarActions** (modal) | Gestão de calendário (visão geral, pessoas, edição) | `visible`, `calendar`, `events` | `Calendar.vue` | Gerenciar qualquer calendário |
| **DayEvents** (modal) | Lista eventos de um dia específico | `visible`, `events`, `calendars`, `dayDate`, `contextCalendarId` | `Calendar.vue` | Visualizar eventos de um dia |

---

## Topbar (`src/components/Topbar/index.vue`)

**Responsabilidade**: Barra de navegação superior presente em todas as páginas autenticadas.

**Props**: Nenhuma — usa `useAuth()` store e `useRouter()` / `useRoute()` diretamente.

**Eventos emitidos**: Nenhum — navegação interna via `router.push()`.

**Dependências**:
- `vue-router` (`useRouter`, `useRoute`)
- `@/utils/Authentication/auth` (`useAuth`)

**Features**:
- Ícones SVG inline para Home, Profile, Calendar, Logout
- Indicador de rota ativa (`isActive(path)`)
- Exibe `userName#userCode` do usuário logado com botão de copiar (tooltip "Copiado!")
- Botão de logout (remove token do localStorage, redireciona para `/login`)

**Estados**:
- Nav items com estado `active` (roxa quando rota atual)
- Tooltip de "Copiado!" com timeout de 1.5s

**Exemplo de uso**:
```vue
<Topbar />
```
Já é usado diretamente no layout `DefaultVueApp.vue`.

---

## CalendarCard (`src/components/CalendarCard.vue`)

**Responsabilidade**: Exibe um mini calendário (datepicker inline) associado a um `Calendar`, com marcadores de eventos.

**Props**:
```ts
defineProps<{
  calendar: Calendar;      // Dados do calendário
  windowStart: string;     // Data inicial do range (dd/mm/yyyy)
  windowEnd: string;       // Data final do range (dd/mm/yyyy)
  modelValue: Date;        // Data selecionada (v-model)
}>();
```

**Eventos emitidos**:
```ts
emit("update:modelValue", value: Date);
emit("day-click", calendar: Calendar, date: Date, dayEvents: Event[]);
emit("open-actions", calendar: Calendar, events: Event[]);
```

**Dependências**:
- `@vuepic/vue-datepicker` (`VueDatePicker`)
- `@/requests/Events/ListEventsByRange/listEventsByRange` (`useGetListEventsByRange`)
- `@/types/api` (`Event`, `Calendar`)

**Comportamento**:
- Busca eventos do calendário via `useGetListEventsByRange` com o `calendar.id`
- Converte eventos em marcadores (dots) no datepicker
- Ao clicar em um dia sem eventos: emite `day-click` (abre modal de criação)
- Ao clicar em `...`: emite `open-actions` (abre modal de gestão)
- Suporta `v-model` para data selecionada com `watch` bidirecional

**Exemplo de uso**:
```vue
<CalendarCard
  v-for="cal in calendars"
  :key="cal.id"
  v-model="calendarDates[cal.id]"
  :calendar="cal"
  :window-start="windowStart"
  :window-end="windowEnd"
  @day-click="onCalendarDayClick"
  @open-actions="onOpenCalendarActions"
/>
```

---

## EventListPanel (`src/components/EventListPanel.vue`)

**Responsabilidade**: Painel que lista eventos filtrados por período de tempo (24h, 7 dias, 30 dias) com abas.

**Props**:
```ts
withDefaults(defineProps<{
  startDate: string;           // Data inicial
  endDate: string;             // Data final
  calendarId?: string | null;  // Filtrar por calendário específico
  width?: string;              // Largura do painel (default: "600px")
  maxHeight?: string;          // Altura máxima (default: "430px")
  filterFn?: (event: Event) => boolean;  // Filtro customizado adicional
}>(), {
  calendarId: null,
  width: "600px",
  maxHeight: "430px",
  filterFn: undefined,
});
```

**Eventos emitidos**: Nenhum.

**Dependências**:
- `@/requests/Events/ListEventsByRange/listEventsByRange` (`useGetListEventsByRange`)
- `@/requests/Calendar/getListCalendar` (`useGetListCalendars`)
- `@/types/api` (`Event`, `Calendar`)

**Estados**:
| Estado | Renderização |
|---|---|
| `isPending` | "Carregando..." |
| `error` | "Erro ao carregar eventos" (vermelho) |
| `filteredEvents.length === 0` | Mensagem contextual por tab |
| Dados carregados | Lista de eventos |

**Tabs**:
- **24H**: eventos nas próximas 24 horas
- **7 Dias**: eventos nos próximos 7 dias
- **30 Dias**: eventos nos próximos 30 dias

**Features**:
- Cada evento mostra nome, data, tag do calendário (com cor e dot), e descrição
- Tags de calendário com cor translúcida (`color + '1a'`) de fundo
- `filterFn` opcional aplicado após filtro de data (usado na Home para filtrar "Seus eventos" e "Eventos de calendário")

**Exemplo de uso**:
```vue
<!-- Home: eventos do usuário como Owner -->
<EventListPanel
  :start-date="today"
  :end-date="thirtyDaysLater"
  width="495px"
  max-height="380px"
  :filter-fn="isOwnerFilter"
/>

<!-- Home: eventos de calendário -->
<EventListPanel
  :start-date="today"
  :end-date="thirtyDaysLater"
  width="495px"
  max-height="380px"
  :filter-fn="isCalendarEventFilter"
/>

<!-- Home: todos os eventos (sem filtro) -->
<EventListPanel
  :start-date="today"
  :end-date="thirtyDaysLater"
  width="1000px"
  max-height="430px"
/>
```

---

## NewEvent Modal (`src/modals/NewEvent/NewEvent.vue`)

**Responsabilidade**: Modal para criar um novo evento.

**Props**:
```ts
withDefaults(defineProps<{
  visible: boolean;
  calendarId?: string | number | null;
  calendarColor?: string;
  calendars?: Calendar[];
  initialDate?: Date | null;
}>(), {
  calendarId: null,
  calendarColor: "#7c3aed",
  calendars: () => [],
  initialDate: null,
});
```

**Eventos emitidos**:
```ts
emit("update:visible", value: boolean);
```

**Dependências**:
- `@vuepic/vue-datepicker` (`VueDatePicker`)
- `@ckpack/vue-color` (`Compact`)
- `@/requests/Events/CreateEvent/createEvent` (`useCreateEventRequest`)
- `@/requests/Events/getUserInfo/getUserInfo` (`getUserInfo`)
- `@tanstack/vue-query` (`useQueryClient`)
- `@/utils/formatDate` (`formatDate`)
- `@/types/api` (`Calendar`)

**Estados**:
| Estado | Descrição |
|---|---|
| Formulário | `reactive` com campos name, date, description, color, users_ids |
| Erros de campo | `reactive` name, date, color |
| Erro de submit | `ref("")` — banner vermelho geral |
| Erro de busca de usuário | `ref("")` — usuário não encontrado |
| Loading | `createEvent.isPending.value` desabilita botão |
| Calendário bloqueado | Se `calendarId` prop informada, dropdown de calendário fica disabled |

**Comportamento**:
- Ao abrir (`visible = true`): inicializa data e cor conforme props
- Validação: nome obrigatório, data obrigatória, cor obrigatória
- Busca de usuário: input `Nome#ID`, chama `getUserInfo`, adiciona ao array `users_ids`
- Ao criar com sucesso: invalida queries `["events"]`, reseta form, fecha modal
- Ao criar com erro: exibe banner "Erro ao criar evento. Tente novamente."

**Exemplo de uso**:
```vue
<NewEventModal
  v-model:visible="showCreateEventModal"
  :calendar-id="selectedCalendarId"
  :calendar-color="selectedCalendarColor"
  :calendars="calendars"
  :initial-date="selectedCalendarDate"
/>
```

---

## NewCalendar Modal (`src/modals/NewCalendar/NewCalendar.vue`)

**Responsabilidade**: Modal para criar um novo calendário.

**Props**:
```ts
defineProps<{ visible: boolean }>();
```

**Eventos emitidos**:
```ts
emit("update:visible", value: boolean);
```

**Dependências**:
- `@ckpack/vue-color` (`Compact`)
- `@/requests/Calendar/createNewCalendar` (`useCreateCalendarRequest`)
- `@/requests/Events/getUserInfo/getUserInfo` (`getUserInfo`)
- `@tanstack/vue-query` (`useQueryClient`)

**Estados**:
| Estado | Descrição |
|---|---|
| Formulário | `reactive` com name, DefaultColor, users_ids |
| Erros de campo | `reactive` name, DefaultColor |
| Erro de submit | `ref("")` |
| Erro de busca de usuário | `ref("")` |

**Comportamento**:
- Similar ao NewEvent, mas sem data e com `DefaultColor`
- Validação: nome obrigatório, cor obrigatória
- Ao criar: invalida queries `["events"]`, reseta, fecha

**Exemplo de uso**:
```vue
<NewCalendarModal v-model:visible="showCreateAgenderModal" />
```

---

## CalendarActions Modal (`src/modals/CalendarActions/CalendarActions.vue`)

**Responsabilidade**: Modal com 3 abas para gestão de calendário: Visão Geral, Pessoas, Edição.

**Props**:
```ts
defineProps<{
  visible: boolean;
  calendar: Calendar | null;
  events: Event[];
}>();
```

**Eventos emitidos**:
```ts
emit("update:visible", value: boolean);
```

**Dependências**:
- `@/requests/Calendar/leaveCalendar` (`useLeaveCalendarRequest`)
- `@/requests/Calendar/deleteCalendar` (`useDeleteCalendarRequest`)
- `@/requests/Calendar/addParticipantInCalendar` (`useAddParticipantInCalendar`)
- `@/requests/Calendar/removeParticipantInCalendar` (`useRemoveParticipantInCalendar`)
- `@/requests/Events/getUserInfo/getUserInfo` (`getUserInfo`)
- `@/utils/Authentication/auth` (`useAuth`)

**Abas**:
| Aba | Conteúdo |
|---|---|
| **Visão Geral** | Lista de eventos do calendário (ou "Nenhum evento") |
| **Pessoas** | Lista de participantes + input para adicionar (se Owner) + botão remover (se Owner) |
| **Edição** | Botões: "SAIR DO CALENDÁRIO" (cinza) e "DELETAR CALENDÁRIO" (vermelho, só Owner) |

**Estados**:
| Estado | Descrição |
|---|---|
| `submitError` | Erro geral (banner) |
| `addError` | Erro ao adicionar participante (404, 400, 403 tratados separadamente) |
| `userSearchError` | Usuário não encontrado |
| `isOwner` computed | Verifica se usuário atual é Owner do calendário |
| Loading por ação | `isPending` individual por mutation |

**Exemplo de uso**:
```vue
<CalendarActionsModal
  v-model:visible="showCalendarActions"
  :calendar="selectedCalendar"
  :events="selectedCalendarEvents"
/>
```

---

## DayEvents Modal (`src/modals/DayEvents/DayEvents.vue`)

**Responsabilidade**: Modal que lista os eventos de um dia específico, com botão para criar novo evento.

**Props**:
```ts
defineProps<{
  visible: boolean;
  events: Event[];
  calendars: Calendar[];
  dayDate: Date | null;
  contextCalendarId: string | null;
}>();
```

**Eventos emitidos**:
```ts
emit("update:visible", value: boolean);
emit("create-event");  // Ao clicar no botão "Criar Evento"
```

**Dependências**:
- `@/types/api` (`Event`, `Calendar`)

**Estados**: Apenas renderização condicional (sem estados internos além das props).

**Comportamento**:
- Constrói `calendarMap` para resolver nome/cor de cada calendário
- Exibe cada evento com nome, tag do calendário (com cor) e descrição
- Botão "Criar Evento" emite evento que é tratado pela `Calendar.vue`

**Exemplo de uso**:
```vue
<DayEventsModal
  v-model:visible="showDayEventsModal"
  :events="selectedDayEvents"
  :calendars="calendars"
  :day-date="selectedDayEventsDate"
  :context-calendar-id="selectedDayEventsContextCalendarId"
  @create-event="handleCreateFromDayEvents"
/>
```
