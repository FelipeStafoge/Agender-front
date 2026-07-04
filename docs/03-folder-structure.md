# 03 - Folder Structure

## Raiz do projeto

```
agender/
├── index.html              # HTML entry point
├── package.json            # Dependências e scripts
├── vite.config.ts          # Configuração do Vite
├── tsconfig.json           # Raiz dos tsconfigs
├── tsconfig.app.json       # TS config para código da app
├── tsconfig.node.json      # TS config para tooling (Vite)
├── env.d.ts                # Declarações de ambiente (.vue)
├── .env                    # Variáveis de ambiente (VITE_API_URL)
├── .gitignore
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── public/
│   └── favicon.ico
├── docs/                   # Documentação do projeto
└── src/                    # Código fonte
```

---

## `src/` — Código fonte

### `src/main.ts`
**Ponto de entrada da aplicação.** Cria a instância Vue, registra plugins (Pinia, VueQuery, Router) e monta no elemento `#app`.

```ts
createApp(App).use(createPinia()).use(VueQueryPlugin).use(router).mount("#app");
```

### `src/App.vue`
**Componente raiz.** Importa o reset CSS global e renderiza `<router-view />`.

### `src/index.css`
**Reset CSS global.** Aplica `box-sizing: border-box`, `margin: 0`, `padding: 0` a todos os elementos.

---

### `src/router/`
**Configuração de rotas.** Arquivo único `router.ts` contendo:
- Definição de rotas com layout aninhado
- Meta `requiresAuth` para proteção
- `beforeEach` guard verificando token no localStorage

### `src/types/`
**Tipos TypeScript compartilhados.** Arquivo único `api.ts` com interfaces para:
- `Participant`
- `Event`
- `Calendar`
- `UserInfo`

### `src/services/`
**Serviços de infraestrutura.** Arquivo único `http.ts` com:
- Configuração do Axios (base URL, headers)
- Interceptor de request (injeta Bearer token)
- Interceptor de response (refresh token automático com queue de requisições)

### `src/utils/`
**Utilitários e stores.**

| Arquivo | Descrição |
|---|---|
| `formatDate.ts` | Helper que converte `Date | string` para `dd/mm/yyyy` |
| `Authentication/auth.ts` | Pinia store `useAuth` — armazena token, dados do usuário, `isAuthenticated` computed |

### `src/layouts/`
**Layouts da aplicação.**

| Arquivo | Descrição |
|---|---|
| `DefaultVueApp.vue` | Layout padrão para páginas autenticadas: topbar + área de conteúdo centralizada com fundo gradiente roxo |

### `src/modules/`
**Páginas da aplicação.** Cada subpasta contém o componente de uma rota.

| Pasta | Rota | Auth |
|---|---|---|
| `Home/index.vue` | `/` | Sim |
| `Login/index.vue` | `/login` | Não |
| `Calendar/Calendar.vue` | `/calendar` | Sim |
| `Profile/index.vue` | `/profile` | Sim |

Pastas existentes mas vazias (sem conteúdo): `Dashboard/`, `Events/`, `Invites/`, `Participants/`, `Settings/`, `Teams/`

### `src/components/`
**Componentes reutilizáveis.**

| Arquivo | Descrição |
|---|---|
| `Topbar/index.vue` | Barra superior com navegação, logout e info do usuário |
| `CalendarCard.vue` | Card de calendário com datepicker inline e eventos marcados |
| `EventListPanel.vue` | Painel de lista de eventos com abas de tempo (24h/7d/30d) |

Pastas existentes mas vazias: `layout/`, `ui/`

### `src/modals/`
**Componentes de modal/dialog.**

| Arquivo | Descrição |
|---|---|
| `NewEvent/NewEvent.vue` | Modal para criar novo evento |
| `NewCalendar/NewCalendar.vue` | Modal para criar novo calendário |
| `CalendarActions/CalendarActions.vue` | Modal de gestão de calendário (tabs: visão geral, pessoas, edição) |
| `DayEvents/DayEvents.vue` | Modal listando eventos de um dia específico |

### `src/requests/`
**Chamadas de API.** Organizado por domínio.

```
requests/
├── login/index.ts                          # POST /auth/login
├── register/index.ts                       # POST /auth/register
├── Events/
│   ├── ListEvents/listEvent.ts             # GET /auth/getListEvents
│   ├── ListEventsByRange/listEventsByRange.ts  # GET /auth/getListEvents + /auth/getCalendarEvents
│   ├── CreateEvent/createEvent.ts          # POST /auth/createEvent
│   └── getUserInfo/getUserInfo.ts          # GET /auth/getUserInfo
└── Calendar/
    ├── getListCalendar.ts                  # GET /auth/getListCalendar
    ├── createNewCalendar.ts                # POST /auth/createCalendar
    ├── deleteCalendar.ts                   # DELETE /auth/deleteCalendar/:id
    ├── leaveCalendar.ts                    # POST /auth/leaveCalendar/:id
    ├── addParticipantInCalendar.ts         # POST /auth/addParticipantInCalendar/:id
    └── removeParticipantInCalendar.ts      # DELETE /auth/removeParticipantInCalendar/:id/:userId
```
