# 05 - Types

## Arquivo de tipos

Todos os tipos compartilhados estão em um único arquivo: `src/types/api.ts` (40 linhas).

---

## Interfaces

### `Participant`

Representa um participante de evento ou calendário.

```ts
export interface Participant {
  userId: string;
  name: string;
  role: "Owner" | "Member";
  createdAt: string;
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `userId` | `string` | ID do usuário |
| `name` | `string` | Nome do participante |
| `role` | `"Owner" \| "Member"` | Papel: dono ou membro |
| `createdAt` | `string` | Data de entrada |

**Onde é usado:**
- `Event.participants` — participantes de um evento
- `Calendar.participants` — participantes de um calendário
- `Home/index.vue` — filtro `isOwnerFilter` verifica `role === "Owner"`
- `CalendarActions.vue` — exibe e gerencia participantes
- `Profile/index.vue` — renderiza lista de participantes de eventos

---

### `Event`

Representa um evento no sistema.

```ts
export interface Event {
  id: string;
  name: string;
  date: string;
  description: string | null;
  color: string;
  calendarId: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  participants: Participant[];
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único |
| `name` | `string` | Nome do evento |
| `date` | `string` | Data no formato `dd/mm/yyyy` |
| `description` | `string \| null` | Descrição opcional |
| `color` | `string` | Cor hexadecimal (ex: `#7c3aed`) |
| `calendarId` | `string \| null` | ID do calendário associado (`null` = evento pessoal) |
| `createdAt` | `string` | Timestamp de criação |
| `updatedAt` | `string \| null` | Timestamp de atualização |
| `deletedAt` | `string \| null` | Soft delete timestamp |
| `participants` | `Participant[]` | Lista de participantes |

**Onde é usado:**
- Retorno de `useGetListEvents()`, `useGetListEventsByRange()`
- `Home/index.vue` — tipagem do parâmetro `filterFn`
- `Calendar.vue` — tipagem de `selectedDayEvents`, `selectedCalendarEvents`
- `CalendarCard.vue` — tipagem de eventos do calendário
- `EventListPanel.vue` — renderização da lista de eventos
- `DayEvents.vue` — tipagem da prop `events`
- `CalendarActions.vue` — tipagem da prop `events`
- `Profile/index.vue` — iteração sobre eventos do usuário
- `NewEvent.vue` — não usa diretamente, mas cria eventos com a mesma estrutura

---

### `Calendar`

Representa um calendário compartilhado.

```ts
export interface Calendar {
  id: string;
  name: string;
  date: string[];
  color?: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  participants: Participant[];
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único |
| `name` | `string` | Nome do calendário |
| `date` | `string[]` | Array de datas associadas |
| `color` | `string` (opcional) | Cor hexadecimal |
| `createdAt` | `string` | Timestamp de criação |
| `updatedAt` | `string \| null` | Timestamp de atualização |
| `deletedAt` | `string \| null` | Soft delete timestamp |
| `participants` | `Participant[]` | Participantes do calendário |

**Onde é usado:**
- Retorno de `useGetListCalendars()`
- `Calendar.vue` — listagem e seleção de calendários
- `CalendarCard.vue` — prop `calendar` para renderização do card
- `EventListPanel.vue` — construção de `calendarMap` para tags
- `DayEvents.vue` — prop `calendars` para resolver nomes de calendário
- `CalendarActions.vue` — prop `calendar` para gestão
- `NewEvent.vue` — prop `calendars` para dropdown de seleção

---

### `UserInfo`

Representa dados públicos de um usuário.

```ts
export interface UserInfo {
  name: string;
  email: string;
  id: string;
  userCode: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | `string` | Nome do usuário |
| `email` | `string` | Email |
| `id` | `string` | ID do usuário |
| `userCode` | `string` | Código único (usado para busca: `Nome#Código`) |
| `createdAt` | `string` | Timestamp de criação |
| `updatedAt` | `string \| null` | Timestamp de atualização |
| `deletedAt` | `string \| null` | Soft delete timestamp |

**Onde é usado:**
- Retorno de `getUserInfo()` / `useGetUserInfo()`
- `NewEvent.vue` — resultado da busca de usuário para adicionar como participante
- `NewCalendar.vue` — idem
- `CalendarActions.vue` — idem

---

## Tipos locais (não exportados do `api.ts`)

### Auth Store User

Definido em `src/utils/Authentication/auth.ts`:

```ts
{
  account_id: string;
  userName: string;
  userCode: string;
  userEmail: string;
}
```

### Parâmetros de request

Cada arquivo em `src/requests/` define tipos locais para os parâmetros:

| Request | Tipo local |
|---|---|
| `login/index.ts` | `LoginParams { form: { email, password } }` |
| `register/index.ts` | `RegisterParams { form: { name, email, password } }` |
| `Events/CreateEvent/createEvent.ts` | `CreateEventParams { form: { name, date, description?, color, users_ids, calendar_id? } }` |
| `Calendar/createNewCalendar.ts` | `CreateCalendarParams { form: { name, DefaultColor, users_ids } }` |
| `Calendar/addParticipantInCalendar.ts` | `AddParticipantParams { calendarId, userId }` |
| `Calendar/removeParticipantInCalendar.ts` | `RemoveParticipantParams { calendarId, userId }` |

---

## Relacionamentos

```
UserInfo (usuário do sistema)
    │
    ├── Participant (vincula UserInfo a Event/Calendar com role)
    │       │
    │       ├── Event.participants[]
    │       └── Calendar.participants[]
    │
    ├── Event (pertence a um usuário, pode ter calendarId)
    │       └── calendarId → Calendar.id (nullable)
    │
    └── Calendar (criado por um Owner, contém membros)
            └── Event.calendarId pode referenciar Calendar.id
```

**Nota:** `UserInfo` e o tipo de usuário armazenado na store Pinia (`{ account_id, userName, userCode, userEmail }`) são conceitualmente a mesma entidade mas usam campos com nomes diferentes (`id` vs `account_id`).
