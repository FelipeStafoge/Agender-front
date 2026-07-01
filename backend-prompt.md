# Backend C# .NET — Implementações pendentes

## 1. Modelos/DTOs

### Calendar
- `Id` (int/guid): identificador único
- `Name` (string): nome do calendário
- `DefaultColor` (string): cor padrão em hex (#rrggbb)
- `OwnerId` (string): ID do usuário dono do calendário
- `IsPersonal` (bool): true se for o calendário pessoal do usuário
- `CreatedAt` (DateTime)

### Event (ajuste)
Adicionar campo opcional:
- `CalendarId` (int/guid?): ID do calendário ao qual o evento pertence (null para eventos sem grupo)
- Manter: `Id`, `Name`, `Date`, `Color`, `UserId` (criador)

Criar tabela/entidade `CalendarUser` para relacionar usuários a calendários de grupo:
- `CalendarId`
- `UserId`

## 2. Endpoints

### POST /auth/register (ajuste)
Ao registrar um novo usuário, **criar automaticamente um calendário pessoal** para ele com:
- Name = "Meus Eventos" (ou nome do usuário)
- DefaultColor = "#7c3aed"
- IsPersonal = true
- OwnerId = id do usuário recém-criado

### GET /auth/getListCalendars (ajuste)
Retornar **todos os calendários que o usuário pode ver**:
- O calendário pessoal do usuário (onde `OwnerId = userId`)
- Calendários de grupo onde o usuário está na `CalendarUser`
- Response: `{ data: Calendar[] }`

### POST /auth/createEvent (ajuste)
- Aceitar `calendar_id` opcional no body
- Se `calendar_id` for nulo, o evento é pessoal (sem group)
- Se `calendar_id` for informado, associar o evento àquele calendário

### GET /auth/getListEvents (ajuste)
- Retornar **todos os eventos que o usuário pode ver**:
  - Eventos pessoais do usuário (sem `calendar_id`)
  - Eventos de calendários onde o usuário participa (via CalendarUser)
- Incluir `calendar_id` no response de cada evento
- Response: `{ data: Event[] }`

## 3. Regras de negócio
- Usuário sempre vê seu calendário pessoal
- Usuário vê calendários de grupo onde foi adicionado
- Evento pode ou não ter `calendar_id`
- A cor do evento deve herdar a `DefaultColor` do calendário se `calendar_id` estiver setado
