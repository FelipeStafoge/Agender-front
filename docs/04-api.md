# 04 - API

## Configuração HTTP

- **Base URL**: `http://localhost:5024/api` (definido em `.env` como `VITE_API_URL`)
- **Cliente HTTP**: Axios, instância exportada de `src/services/http.ts`
- **Headers**: `Content-Type: application/json` em todas as requisições
- **Autenticação**: Bearer token injetado via interceptor de request
- **Refresh token**: automático no interceptor de response para erros 401

---

## Endpoints de Autenticação

### POST /auth/login

**Descrição**: Autentica o usuário e retorna tokens + dados do perfil.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Resposta:**
```json
{
  "token": "string",
  "refreshToken": "string",
  "data": {
    "account_id": "string",
    "userCode": "string",
    "email": "string",
    "userName": "string"
  }
}
```

**Tipo usado**: Type local `LoginParams` em `src/requests/login/index.ts`

**Tela que consome**: `src/modules/Login/index.vue` (formulário de Login)

---

### POST /auth/register

**Descrição**: Registra um novo usuário.

**Body:**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Resposta:**
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

**Tipo usado**: Type local `RegisterParams` em `src/requests/register/index.ts`

**Tela que consome**: `src/modules/Login/index.vue` (formulário de Register)

---

### POST /auth/refresh

**Descrição**: Renova o token de acesso usando refresh token.

**Body:**
```json
{ "refreshToken": "string" }
```

**Resposta:**
```json
{
  "token": "string"
}
```

**Chamado por**: Interceptor de response em `src/services/http.ts` (automático)

---

## Endpoints de Eventos

### GET /auth/getListEvents

**Descrição**: Lista todos os eventos do usuário. Aceita filtros opcionais `startDate` e `endDate`.

**Query params:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `startDate` | string (`dd/mm/yyyy`) | Não | Data inicial do filtro |
| `endDate` | string (`dd/mm/yyyy`) | Não | Data final do filtro |

**Tipo de resposta**: `Event[]` (definido em `src/types/api.ts`)

**Resposta:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "date": "dd/mm/yyyy",
      "description": "string | null",
      "color": "#7c3aed",
      "calendarId": "string | null",
      "createdAt": "string",
      "updatedAt": "string | null",
      "deletedAt": "string | null",
      "participants": [
        {
          "userId": "string",
          "name": "string",
          "role": "Owner | Member",
          "createdAt": "string"
        }
      ]
    }
  ]
}
```

**Hooks:**
- `useGetListEvents()` — sem filtro, `staleTime: 10min`
- `useGetListEventsByRange(startDate, endDate, calendarId?)` — com filtro de data e calendário opcional, `staleTime: 5min`

**Telas que consomem:**
- `src/modules/Profile/index.vue` (via `useGetListEvents`)
- `src/modules/Home/index.vue` (via `useGetListEventsByRange`)
- `src/components/EventListPanel.vue` (via `useGetListEventsByRange`)
- `src/modules/Calendar/Calendar.vue` (via `useGetListEventsByRange`)
- `src/components/CalendarCard.vue` (via `useGetListEventsByRange`)

---

### GET /auth/getCalendarEvents

**Descrição**: Lista eventos de um calendário específico com filtro de data.

**Query params:**
| Parâmetro | Tipo | Obrigatório |
|---|---|---|
| `calendarId` | string | Sim |
| `startDate` | string | Sim |
| `endDate` | string | Sim |

**Tipo de resposta**: `Event[]`

**Hook**: `useGetListEventsByRange(startDate, endDate, calendarId)` — quando `calendarId` é informado, usa este endpoint ao invés de `/auth/getListEvents`

**Telas que consomem**: `CalendarCard.vue` (indiretamente via `useGetListEventsByRange`)

---

### POST /auth/createEvent

**Descrição**: Cria um novo evento.

**Body:**
```json
{
  "name": "string",
  "date": "dd/mm/yyyy",
  "description": "string | null",
  "color": "string",
  "users_ids": "string[]",
  "calendar_id": "string | number | null"
}
```

**Tipo**: `CreateEventParams` em `src/requests/Events/CreateEvent/createEvent.ts`

**Hook**: `useCreateEventRequest()` — mutation

**Tela que consome**: `src/modals/NewEvent/NewEvent.vue`

---

### GET /auth/getUserInfo

**Descrição**: Busca informações de um usuário por `NameWithCode`.

**Query params:**
| Parâmetro | Tipo | Obrigatório |
|---|---|---|
| `NameWithCode` | string | Sim |

**Tipo de resposta**: `UserInfo`

```json
{
  "name": "string",
  "email": "string",
  "id": "string",
  "userCode": "string",
  "createdAt": "string",
  "updatedAt": "string | null",
  "deletedAt": "string | null"
}
```

**Hook**: `useGetUserInfo(NameWithCode)` — query com `enabled: !!NameWithCode`

**Função direta**: `getUserInfo({ NameWithCode })` — usada sem hook em modais para busca sob demanda

**Telas que consomem:**
- `NewEvent.vue` (adicionar participantes)
- `NewCalendar.vue` (adicionar participantes)
- `CalendarActions.vue` (adicionar participantes)

---

## Endpoints de Calendário

### GET /auth/getListCalendar

**Descrição**: Lista todos os calendários do usuário.

**Tipo de resposta**: `Calendar[]`

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "date": "string[]",
      "color": "string",
      "createdAt": "string",
      "updatedAt": "string | null",
      "deletedAt": "string | null",
      "participants": [
        {
          "userId": "string",
          "name": "string",
          "role": "Owner | Member",
          "createdAt": "string"
        }
      ]
    }
  ]
}
```

**Hook**: `useGetListCalendars()` — `staleTime: 10min`

**Telas que consomem:**
- `Calendar.vue`
- `EventListPanel.vue`
- `CalendarCard.vue` (indiretamente)

---

### POST /auth/createCalendar

**Descrição**: Cria um novo calendário.

**Body:**
```json
{
  "name": "string",
  "DefaultColor": "string",
  "users_ids": "string[]"
}
```

**Tipo**: `CreateCalendarParams` em `src/requests/Calendar/createNewCalendar.ts`

**Hook**: `useCreateCalendarRequest()` — mutation

**Tela que consome**: `NewCalendar.vue`

---

### DELETE /auth/deleteCalendar/:calendarId

**Descrição**: Deleta um calendário (apenas Owner).

**Hook**: `useDeleteCalendarRequest()` — mutation

**Tela que consome**: `CalendarActions.vue`

---

### POST /auth/leaveCalendar/:calendarId

**Descrição**: Sai de um calendário (remove participação).

**Hook**: `useLeaveCalendarRequest()` — mutation

**Tela que consome**: `CalendarActions.vue`

---

### POST /auth/addParticipantInCalendar/:calendarId

**Descrição**: Adiciona participante a um calendário.

**Body:**
```json
{ "userId": "string" }
```

**Tipo**: `AddParticipantParams` em `src/requests/Calendar/addParticipantInCalendar.ts`

**Hook**: `useAddParticipantInCalendar()` — mutation

**Tela que consome**: `CalendarActions.vue`

---

### DELETE /auth/removeParticipantInCalendar/:calendarId/:userId

**Descrição**: Remove participante de um calendário.

**Hook**: `useRemoveParticipantInCalendar()` — mutation

**Tela que consome**: `CalendarActions.vue`
