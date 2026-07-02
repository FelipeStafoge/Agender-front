# Backend — Adicionar filtro por range de data nos endpoints de eventos

## Contexto

Os endpoints `getListEvents` e `getCalendarEvents` atualmente retornam **todos** os eventos sem filtro de data. Para otimizar o frontend (Home com últimos 30 dias, Calendar com janela de 2 meses), é necessário adicionar os query params opcionais `startDate` e `endDate` no formato `dd/MM/yyyy`.

Se os parâmetros forem omitidos, o comportamento atual (retornar todos) é mantido.

**Banco:** SQLite  
**Provider EF Core:** Microsoft.EntityFrameworkCore.Sqlite  
O SQLite usa `SUBSTR` (1-indexed). O EF Core traduz `Substring(0, 2)` → `SUBSTR(col, 1, 2)` e `Convert.ToInt32` → `CAST(... AS INTEGER)`.

---

## Arquivo 1: `getListEvents`

**Onde:** `Controllers/EventsController.cs` (ou nome do controller que contém esse método)

```csharp
[Authorize]
[HttpGet("getListEvents")]
public async Task<IActionResult> GetListEvents(
    [FromQuery] string? startDate = null,
    [FromQuery] string? endDate = null)
{
    var accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    var user = await _context.Users.FindAsync(Guid.Parse(accountId!));

    if (user == null)
        return Unauthorized();

    var query = _context.Events
        .Where(e =>
            (e.CalendarId == null && e.Participants.Any(p => p.UserId == user.Id)) ||
            (e.CalendarId != null && e.Calendar!.CalendarParticipants.Any(p => p.UserId == user.Id)));

    if (!string.IsNullOrEmpty(startDate))
    {
        var parts = startDate.Split('/');
        var startComparable = int.Parse(parts[2]) * 10000 + int.Parse(parts[1]) * 100 + int.Parse(parts[0]);
        query = query.Where(e =>
            (Convert.ToInt32(e.Date.Substring(6, 4)) * 10000 +
             Convert.ToInt32(e.Date.Substring(3, 2)) * 100 +
             Convert.ToInt32(e.Date.Substring(0, 2))) >= startComparable);
    }

    if (!string.IsNullOrEmpty(endDate))
    {
        var parts = endDate.Split('/');
        var endComparable = int.Parse(parts[2]) * 10000 + int.Parse(parts[1]) * 100 + int.Parse(parts[0]);
        query = query.Where(e =>
            (Convert.ToInt32(e.Date.Substring(6, 4)) * 10000 +
             Convert.ToInt32(e.Date.Substring(3, 2)) * 100 +
             Convert.ToInt32(e.Date.Substring(0, 2))) <= endComparable);
    }

    var listEvents = await query
        .Include(e => e.Participants)
            .ThenInclude(p => p.User)
        .Select(e => new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Date = e.Date,
            Description = e.Description,
            Color = e.Color,
            CalendarId = e.CalendarId,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            DeletedAt = e.DeletedAt,
            Participants = e.Participants.Select(p => new ParticipantResponse
            {
                UserId = p.UserId,
                Name = p.User.Name,
                Role = p.Role,
                CreatedAt = p.CreatedAt
            }).ToList()
        })
        .ToListAsync();

    return Ok(new { data = listEvents });
}
```

### O que mudou

| Antes | Depois |
|-------|--------|
| `GetListEvents()` sem parâmetros | `GetListEvents(string? startDate, string? endDate)` |
| `_context.Events.Where(...)` direto | `var query = _context.Events.Where(...)` + `.Where()` condicionais |
| Sempre retorna todos os eventos | Filtra por range se parâmetros fornecidos |

---

## Arquivo 2: `getCalendarEvents`

**Onde:** Mesmo controller

```csharp
[Authorize]
[HttpGet("getCalendarEvents")]
public async Task<IActionResult> GetCalendarEvents(
    [FromQuery] string calendarId,
    [FromQuery] string? startDate = null,
    [FromQuery] string? endDate = null)
{
    var accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (!Guid.TryParse(accountId, out var userId))
        return Unauthorized();

    if (!Guid.TryParse(calendarId, out var parsedCalendarId))
        return BadRequest(new { message = "calendarId inválido" });

    var calendar = await _context.Calendar
        .FirstOrDefaultAsync(c => c.Id == parsedCalendarId);

    if (calendar == null)
        return NotFound(new { message = "Calendário não encontrado" });

    var hasAccess = calendar.OwnerId == accountId ||
        await _context.CalendarParticipant
            .AnyAsync(cp => cp.CalendarId == parsedCalendarId && cp.UserId == userId);

    if (!hasAccess)
        return Forbid();

    var query = _context.Events
        .Where(e => e.CalendarId == parsedCalendarId);

    if (!string.IsNullOrEmpty(startDate))
    {
        var parts = startDate.Split('/');
        var startComparable = int.Parse(parts[2]) * 10000 + int.Parse(parts[1]) * 100 + int.Parse(parts[0]);
        query = query.Where(e =>
            (Convert.ToInt32(e.Date.Substring(6, 4)) * 10000 +
             Convert.ToInt32(e.Date.Substring(3, 2)) * 100 +
             Convert.ToInt32(e.Date.Substring(0, 2))) >= startComparable);
    }

    if (!string.IsNullOrEmpty(endDate))
    {
        var parts = endDate.Split('/');
        var endComparable = int.Parse(parts[2]) * 10000 + int.Parse(parts[1]) * 100 + int.Parse(parts[0]);
        query = query.Where(e =>
            (Convert.ToInt32(e.Date.Substring(6, 4)) * 10000 +
             Convert.ToInt32(e.Date.Substring(3, 2)) * 100 +
             Convert.ToInt32(e.Date.Substring(0, 2))) <= endComparable);
    }

    var listEvents = await query
        .Include(e => e.Participants)
            .ThenInclude(p => p.User)
        .Select(e => new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Date = e.Date,
            Description = e.Description,
            Color = e.Color,
            CalendarId = e.CalendarId,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            DeletedAt = e.DeletedAt,
            Participants = e.Participants.Select(p => new ParticipantResponse
            {
                UserId = p.UserId,
                Name = p.User.Name,
                Role = p.Role,
                CreatedAt = p.CreatedAt
            }).ToList()
        })
        .ToListAsync();

    return Ok(new { data = listEvents });
}
```

### O que mudou

| Antes | Depois |
|-------|--------|
| `GetCalendarEvents(string calendarId)` | `GetCalendarEvents(string calendarId, string? startDate, string? endDate)` |
| Query direta no `Where` | Query condicional com range opcional |

---

## Como a filtragem por data funciona

O campo `Date` está como `string` no formato `dd/MM/yyyy`. Comparação alfabética falha (`"01/02/2026" < "02/01/2026"`). Solução: extrair ano, mês, dia e converter para inteiro comparável:

```
ano * 10000 + mes * 100 + dia
```

Exemplo: `01/02/2026` → `2026 * 10000 + 2 * 100 + 1` = `20260201`

### Tradução para SQLite

| C# | SQLite |
|----|--------|
| `e.Date.Substring(6, 4)` | `SUBSTR("Date", 7, 4)` |
| `e.Date.Substring(3, 2)` | `SUBSTR("Date", 4, 2)` |
| `e.Date.Substring(0, 2)` | `SUBSTR("Date", 1, 2)` |
| `Convert.ToInt32(...)` | `CAST(... AS INTEGER)` |

### Compatibilidade

- `startDate` e `endDate` são opcionais (`string?`)
- Se ambos forem `null`/vazios, os blocos `if` são pulados e o comportamento é idêntico ao atual
- `calendarId` continua obrigatório no `GetCalendarEvents`

---

## Teste rápido após aplicar

```bash
# Eventos pessoais nos próximos 30 dias
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5024/api/auth/getListEvents?startDate=03/07/2026&endDate=02/08/2026"

# Eventos de um calendário específico no próximo mês
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5024/api/auth/getCalendarEvents?calendarId=<id>&startDate=01/07/2026&endDate=31/07/2026"

# Sem parâmetros — comportamento original (todos os eventos)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5024/api/auth/getListEvents"
```
