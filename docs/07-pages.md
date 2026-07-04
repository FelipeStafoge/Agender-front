# 07 - Pages

## Página: Home (`src/modules/Home/index.vue`)

**Objetivo**: Dashboard principal exibindo 3 painéis de eventos futuros.

**Rota**: `/` (raiz, requer autenticação)

**Componentes utilizados**:
- `EventListPanel` (3 instâncias)

**Chamadas de API**: Nenhuma direta — `EventListPanel` internamente chama `useGetListEventsByRange` e `useGetListCalendars`.

**Estados**:
- `today`: data atual zerada
- `thirtyDaysLater`: hoje + 30 dias
- `userId`: ID do usuário logado (via `useAuth`)
- `isOwnerFilter`: função que filtra eventos onde usuário é Owner
- `isCalendarEventFilter`: função que filtra eventos com `calendarId !== null`

**Fluxo**:
```
Home monta
  ↓
Renderiza 3 EventListPanel
  ↓
Painel 1: eventos onde usuário é Owner (filterFn)
  largura 495px, altura 380px
  ↓
Painel 2: eventos de calendário (calendarId !== null) (filterFn)
  largura 495px, altura 380px
  ↓
Painel 3: todos os eventos (sem filterFn)
  largura 1000px, altura 430px
```

**Layout**: Flex column, centralizado, padding-top 150px, gap 16px entre painéis.

**Permissões**: `requiresAuth: true` — usuário precisa estar autenticado.

---

## Página: Login (`src/modules/Login/index.vue`)

**Objetivo**: Autenticação (login) e registro de novos usuários.

**Rota**: `/login` (sem autenticação)

**Componentes utilizados**: Nenhum componente externo — formulários inline.

**Chamadas de API**:
- `useLoginRequest()` — mutation `POST /auth/login`
- `useRegisterRequest()` — mutation `POST /auth/register`

**Estados:**
| Estado | Tipo | Descrição |
|---|---|---|
| `Registerform` | `reactive` | Campos: name, email, password, confirmPassword |
| `Loginform` | `reactive` | Campos: email, password |
| `registerErrors` | `reactive` | Erros de validação por campo (name, email, password, confirmPassword) |
| `loginErrors` | `reactive` | Erros de validação por campo (email, password) |
| `registerApiError` | `ref("")` | Erro retornado pela API no registro |
| `loginApiError` | `ref("")` | Erro retornado pela API no login |
| `registerMutation.isPending` | `boolean` | Loading do registro |
| `loginMutation.isPending` | `boolean` | Loading do login |

**Fluxo**:
```
Usuário acessa /login
  ↓
Renderiza dois cards lado a lado: Register | Login
  ↓
Register:
  Usuário preenche campos → blur dispara validação individual
  Erros exibidos em vermelho abaixo do campo
  ↓
  Clica "Cadastrar"
  → validaForm() checa todos os campos
  → Se inválido: mostra erros
  → Se válido: chama registerMutation.mutateAsync()
    → Sucesso: redireciona para redirect ou /
    → Erro: mostra banner de erro da API
  ↓
Login:
  Usuário preenche campos → blur dispara validação
  ↓
  Clica "Entrar"
  → validaForm() checa todos os campos
  → Se inválido: mostra erros
  → Se válido: chama loginMutation.mutateAsync()
    → Sucesso: redireciona para redirect ou /
    → Erro: mostra banner de erro da API
```

**Validação de senha (Register)**:
- ≥ 6 caracteres
- ≥ 1 maiúscula
- ≥ 1 minúscula
- ≥ 1 caractere especial (`@#$%&*_+=~!?`)
- Sem caracteres proibidos (`,.\-;:"'/\\()[]{}<>|`)

**Validação de email**: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Permissões**: Nenhuma (rota pública). Se usuário já autenticado, é redirecionado para `/`.

---

## Página: Calendar (`src/modules/Calendar/Calendar.vue`)

**Objetivo**: Visão completa de calendário com datepicker principal, mini calendários e modais.

**Rota**: `/calendar` (requer autenticação)

**Componentes utilizados:**
- `VueDatePicker` (datepicker principal)
- `CalendarCard` (um por calendário, máx 6)
- `NewEventModal`
- `NewCalendarModal`
- `CalendarActionsModal`
- `DayEventsModal`

**Chamadas de API:**
- `useGetListEventsByRange(windowStart, windowEnd)` — eventos no range do mês
- `useGetListCalendars()` — lista de calendários do usuário

**Estados**:
| Estado | Tipo | Descrição |
|---|---|---|
| `date` | `ref(new Date())` | Data selecionada no datepicker principal |
| `calendarDates` | `ref<Record>` | Datas ativas por calendário |
| `markers` | `computed` | Marcadores de eventos no datepicker principal |
| `showCreateEventModal` | `ref(false)` | Controle do modal NewEvent |
| `showCreateAgenderModal` | `ref(false)` | Controle do modal NewCalendar |
| `showCalendarActions` | `ref(false)` | Controle do modal CalendarActions |
| `showDayEventsModal` | `ref(false)` | Controle do modal DayEvents |
| `selectedCalendarId` | `ref` | Calendário selecionado para criação de evento |
| `selectedCalendarColor` | `ref` | Cor do calendário selecionado |
| `selectedCalendarDate` | `ref` | Data selecionada para criação de evento |
| `selectedDayEvents` | `ref([])` | Eventos do dia clicado |
| `selectedDayEventsDate` | `ref` | Data do dia clicado |
| `selectedDayEventsContextCalendarId` | `ref` | Contexto do calendário ao abrir DayEvents |

**Fluxo**:
```
Calendar monta
  ↓
Layout: painel esquerdo (datepicker + botão Novo Evento) | divisor | painel direito (grid de calendários)
  ↓
Datepicker principal:
  - Mostra dots nos dias com eventos
  - Clicar em dia com eventos → abre DayEventsModal
  - Clicar em dia vazio → abre NewEventModal (pessoal)
  ↓
Botão "Novo Evento" → abre NewEventModal (pessoal)
  ↓
Botão "Novo Calendário" → abre NewCalendarModal
  ↓
Grid de CalendarCard (máx 6):
  - Cada card tem seu próprio datepicker com eventos
  - Clicar em dia → dispara onCalendarDayClick
    - Se tem eventos → abre DayEventsModal com contexto
    - Se vazio → abre NewEventModal vinculado ao calendário
  - Clicar "..." → abre CalendarActionsModal
```

**Layout**:
- Container flex, altura `calc(100vh - 64px)`
- Painel esquerdo: centralizado vertical e horizontalmente
- Divisor: linha vertical `1px solid #d0d0d0`
- Painel direito: scroll vertical, grid 2 colunas de CalendarCards

**Permissões**: `requiresAuth: true`

---

## Página: Profile (`src/modules/Profile/index.vue`)

**Objetivo**: Exibir eventos do usuário logado.

**Rota**: `/profile` (requer autenticação)

**Componentes utilizados**: Nenhum — renderização inline.

**Chamadas de API**:
- `useGetListEvents()` — todos os eventos do usuário

**Estados**:
| Estado | Renderização |
|---|---|
| `isPending` | "Carregando..." |
| `error` | "Erro ao carregar" |
| Dados | Lista de cards de evento |

**Fluxo**:
```
Profile monta → chama useGetListEvents()
  ↓
Loading → "Carregando..."
  ↓
Erro → "Erro ao carregar"
  ↓
Sucesso → renderiza lista de eventos
  Cada evento mostra:
    - Nome (strong)
    - Data
    - Descrição (se houver)
    - Participantes (nome + role badge "Dono" / "Membro")
```

**Layout**: Lista vertical simples com separadores (`border-bottom: 1px solid #eee`).

**Permissões**: `requiresAuth: true`
