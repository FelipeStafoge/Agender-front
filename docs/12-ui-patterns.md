# 12 - UI Patterns

## Sistema de cores

**Não existe sistema de design tokens/variaveis CSS.** Todas as cores são hard-coded em cada componente. Abaixo, o mapeamento das cores usadas consistentemente:

### Cores primárias

| Nome | Hex | Uso |
|---|---|---|
| **Primary Purple** | `#7c3aed` | Botões principais, tabs ativas, tags, badges, bordas de foco |
| **Deep Purple** | `#6d28d9` | Hover de botões roxos |
| **Dark Purple** | `#5b21b6` | Cor de nav item ativo |

### Cores de fundo

| Nome | Hex/Valor | Uso |
|---|---|---|
| Background App | `linear-gradient(180deg, rgba(124,58,237,0.20), rgba(124,58,237,0.06))` | Fundo do layout e da página de login |
| White | `#ffffff` | Cards, modais, área de conteúdo |
| Light Gray | `#f9fafb` | Cards de evento, itens de lista |
| Very Light Purple | `#eef2ff` | Fundo do CalendarCard |
| Purple Badge BG | `#f3e8ff` | Background de role badge |
| Error BG | `#fff5f5` | Background de mensagens de erro |

### Cores de texto

| Nome | Hex | Uso |
|---|---|---|
| Text Dark | `#1f2937` | Nomes de eventos, títulos |
| Text Medium | `#374151` | Corpo, user code, hover de tab |
| Text Gray | `#4a5568` | Nav labels, texto central |
| Text Muted | `#6b7280` | Tabs inativas, datas de evento, descrições |
| Text Placeholder | `#9ca3af` | Empty states, placeholder de input |

### Cores de estado

| Nome | Hex | Uso |
|---|---|---|
| Error Red | `#e53e3e` | Erros de formulário, botão deletar, mensagens de erro |
| Error Border | `#fed7d7` | Borda do banner de erro |
| Success Green | `#38a169` | Não utilizado atualmente |
| Warning Orange | Não utilizado | — |

### Cores de borda

| Nome | Hex | Uso |
|---|---|---|
| Border Light | `#d1d5db` | Inputs padrão, divider line |
| Border Default | `#ccc` | Inputs em modais (estilo antigo) |
| Border Tab | `#e5e7eb` | Linha inferior das tabs |
| Border Panel | `#6bacea` | Borda do EventListPanel |
| Divider | `#d0d0d0` | Divisor central do Calendar |

---

## Espaçamentos

Não há escala de espaçamento definida. Valores usados de forma consistente:

| Valor | Uso típico |
|---|---|
| `4px` | Gap mínimo (tooltip offset) |
| `6px` | Gap entre label e input, badge padding |
| `8px` | Gap entre nav items, border-radius de cards/botões |
| `10px` | Gap entre cards, padding de tabs |
| `12px` | Border-radius de modais, padding de eventos |
| `14px` | Padding de input |
| `16px` | Gap entre seções, padding de cards de evento |
| `20px` | Padding horizontal de tabs |
| `24px` | Padding de botão action |
| `32px` | Padding interno de modais |
| `36-40px` | Padding de auth-card |
| `48px` | Gap entre cards de auth |
| `100px` | Padding lateral do layout |

---

## Border radius

| Elemento | Valor |
|---|---|
| Modais | `12px` |
| Cards (auth, events, panel) | `8px` a `12px` |
| Botões | `8px` |
| Inputs | `8px` |
| Nav items | `8px` |
| Tags/Badges | `999px` (pill) |
| Error banner | `6px` a `8px` |
| Copy icon box | `8px` |
| Tooltip | `4px` |

---

## Botões

### Botão primário (roxo)
```css
background: #7c3aed;
color: #fff;
border: none;
border-radius: 8px;
cursor: pointer;
padding: 12px 20px; /* varia: 12px 24px, 14px 24px */
font-size: 15px ou 16px;
```
Hover: `#6d28d9`
Disabled: `opacity: 0.6` ou `0.7`, `cursor: not-allowed`

Exemplos: "Entrar", "Cadastrar", "Novo Evento", "Confirmar Evento", "Adicionar"

### Botão de ação secundária (cinza)
```css
background: #6b7280;
color: #fff;
```
Exemplo: "SAIR DO CALENDÁRIO"

### Botão de perigo (vermelho)
```css
background: #e53e3e;
color: #fff;
```
Exemplos: "DELETAR CALENDÁRIO", "Remover"

### Botão small
```css
padding: 6px 12px;
font-size: 12px;
```

### Botão com spinner
```html
<button :disabled="isPending">
  <span v-if="isPending" class="btn-spinner"></span>
  {{ isPending ? "Carregando..." : "Texto" }}
</button>
```
Spinner: `16px`, borda `2px solid rgba(255,255,255,0.3)`, top color `#fff`, animação `spin 0.6s linear infinite`.

---

## Inputs

### Estilo padrão (Login page)
```css
.form-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
}
.form-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}
```

### Estilo alternativo (Modais - estilo antigo)
```css
.form-input {
  width: 70%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}
.form-input:focus {
  /* sem box-shadow */
}
```

### Input com erro
```css
.form-input--error {
  border: 1px solid #e53e3e;
}
.form-input--error:focus {
  box-shadow: 0 0 0 2px rgba(229,62,62,0.2); /* ou 3px rgba(229,62,62,0.1) */
}
```

### Select
```css
.form-select {
  width: 70%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}
```

### Textarea
```css
.form-textarea {
  width: 70%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}
```

### Field wrap (label + input + error)
```css
.field-wrap {
  width: 70%; /* modais */ /* ou sem width fixo (Login) */
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151; /* ou #666 */
  margin-bottom: 6px;
}
```

---

## Tabelas

**Não existem tabelas no projeto.** Dados tabulares são renderizados como listas de cards/items.

---

## Cards

### Card de evento (em listas)
```css
background: #f9fafb;
border-radius: 8px;
padding: 16px;
display: flex;
flex-direction: column;
gap: 6px;
```

### Card de calendário (CalendarCard)
```css
background: #eef2ff;
border-radius: 8px;
padding: 3px;
```

### Card de autenticação (Login)
```css
background: #fff;
border-radius: 12px;
padding: 40px 36px;
width: 380px;
box-shadow: 0 4px 24px rgba(0,0,0,0.08);
```

---

## Modal

**Padrão universal para todos os modais:**

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  position: relative;
  /* dimensões variam por modal:
     NewEvent/NewCalendar: padding: 32px, max-width: 500px, width: 90%
     CalendarActions/DayEvents: padding: 10px, width: 1000px, height: 700px
  */
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666; /* ou #6b7280 */
}
```

---

## Drawer

**Não encontrado.** O projeto não utiliza drawers/sidebars.

---

## Toast

**Não encontrado.** Notificações são implementadas como banners inline (api-error) ou tooltips (Copiado!).

---

## Loading

### Loading de página/componente
```html
<div v-if="isPending">Carregando...</div>
```
Texto simples, centralizado, cor `#9ca3af`.

### Loading de botão
- Botão desabilitado + texto alterado ("Criando...", "Entrando...", "Saindo...")
- Spinner animado opcional (apenas no Login)

### Skeleton
**Não encontrado.** Não há skeleton screens.

---

## Empty State

```html
<div class="empty-state">
  Nenhum evento neste calendário.
</div>
```
```css
.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
}
```

Variações:
- "Nenhum evento nas próximas 24 horas." (EventListPanel)
- "Nenhum evento nos próximos 7 dias."
- "Nenhum evento nos próximos 30 dias."
- "Nenhum participante neste calendário."

---

## Responsividade

**Não implementada.** O projeto é projetado para desktop (largura fixa, sem media queries). Valores de referência:
- Layout: `padding: 0 100px`
- Home: `width: 1000px`, painéis `495px` cada
- Auth cards: `380px` cada
- Modais: `max-width: 500px` ou `width: 1000px`

---

## Dark mode

**Não encontrado.** O projeto usa apenas tema claro.

---

## Biblioteca UI utilizada

**Nenhuma.** O projeto não usa Vuetify, Element Plus, PrimeVue, Bootstrap ou qualquer biblioteca de componentes UI. Todo o CSS é escrito manualmente com `<style scoped>`.

---

## Fontes e tipografia

| Uso | Tamanho | Peso |
|---|---|---|
| Título de card auth | `22px` | `600` |
| Título de modal | `18px` | `600` |
| Texto "Agender:" na Topbar | `18px` | `500` |
| Botões | `15px` a `16px` | `500` a `600` |
| Nomes de eventos | `15px` | `600` |
| Inputs, tabs, corpo | `14px` | `400` a `500` |
| Nav labels, user code, descrições | `13px` | `500` |
| Badges, tags | `11px` a `12px` | `500` a `600` |
| Erros | `12px` a `13px` | `400` |

**Font family**: Não especificada — usa a padrão do browser.

---

## Tags / Badges

### Calendar tag (evento)
```html
<span class="calendar-tag" :style="{ backgroundColor: color + '1a', color: color }">
  <span class="calendar-dot" :style="{ backgroundColor: color }"></span>
  {{ name }}
</span>
```
```css
.calendar-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.calendar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
```

### Role badge (Owner/Member)
```html
<span class="role-badge">{{ role === 'Owner' ? 'Dono' : 'Membro' }}</span>
```
```css
.role-badge {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 600;
  background: #f3e8ff;
  padding: 2px 8px;
  border-radius: 999px;
}
```

---

## Transições

Uso consistente de `transition` em elementos interativos:
```css
transition: color 0.2s, border-color 0.2s, background-color 0.2s;
```

Aplicado em: nav items, tabs, botões, inputs (border-color).

---

## Sombras

| Elemento | Box Shadow |
|---|---|
| Auth card | `0 4px 24px rgba(0,0,0,0.08)` |
| Input focus | `0 0 0 3px rgba(124,58,237,0.1)` |
| Input error focus | `0 0 0 3px rgba(229,62,62,0.1)` ou `0 0 0 2px rgba(229,62,62,0.2)` |

---

## Ícones

**Nenhuma biblioteca de ícones.** Todos os ícones são SVGs inline desenhados manualmente nos templates:

- Home: casa com telhado
- Profile: pessoa + círculo
- Calendar: calendário com linhas
- Logout: porta com seta
- Copy: dois retângulos sobrepostos

Atributos padrão dos SVGs:
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
```
Tamanho: `width: 20px; height: 20px`
