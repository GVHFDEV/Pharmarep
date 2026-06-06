---
version: 1.0
name: pharmarep-design
description: Design system profissional em Light Mode para o PharmaRep CRM. Inspirado em ferramentas SaaS modernas como Linear, Vercel e Attio. Fundo neutro claro, superfícies brancas, acentos em azul royal e sombras sutis com toque azulado. Responsivo com foco prioritário em tablet (768px–1024px).

colors:
  # Fundo e Superfícies
  background: "#f0f4f8"           # Fundo geral da aplicação — cinza azulado muito claro
  surface: "#ffffff"              # Cards, painéis, modais — branco puro
  surface-2: "#f8fafc"            # Superfície secundária — seções internas de cards
  border: "#dde3ea"               # Bordas gerais — cinza azulado sutil
  border-focus: "#3b82f6"         # Borda de input em foco

  # Texto
  text-primary: "#0f172a"         # Texto principal — quase preto azulado
  text-secondary: "#475569"       # Texto secundário, labels
  text-muted: "#94a3b8"           # Texto terciário, placeholders
  text-on-accent: "#ffffff"       # Texto sobre fundo accent

  # Accent — Azul Royal (principal CTA e navegação)
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  accent-light: "#eff6ff"         # Fundo de item ativo na sidebar
  accent-light-border: "#bfdbfe"  # Borda de item ativo

  # Sombras com toque azulado
  shadow-sm: "0 1px 3px 0 rgba(37, 99, 235, 0.06), 0 1px 2px -1px rgba(0,0,0,0.04)"
  shadow-md: "0 4px 12px -2px rgba(37, 99, 235, 0.10), 0 2px 4px -2px rgba(0,0,0,0.05)"
  shadow-lg: "0 8px 24px -4px rgba(37, 99, 235, 0.14), 0 4px 8px -4px rgba(0,0,0,0.06)"
  shadow-drawer: "-4px 0 20px -2px rgba(37, 99, 235, 0.12)"
  shadow-bottom-sheet: "0 -4px 20px -2px rgba(37, 99, 235, 0.10)"

  # Semânticas
  success: "#16a34a"
  success-light: "#f0fdf4"
  success-border: "#bbf7d0"

  warning: "#d97706"
  warning-light: "#fffbeb"
  warning-border: "#fde68a"

  danger: "#dc2626"
  danger-light: "#fef2f2"
  danger-border: "#fecaca"

  info: "#0ea5e9"
  info-light: "#f0f9ff"
  info-border: "#bae6fd"

  neutral: "#64748b"
  neutral-light: "#f1f5f9"
  neutral-border: "#cbd5e1"

typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: "700"
    lineHeight: "1.15"
    letterSpacing: "-0.025em"
  h1:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: "600"
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: "600"
    lineHeight: "1.4"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.55"
  body-medium:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "1.55"
  small:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "1.45"
  caption:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.4"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0.01em"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

rounded:
  xs: "3px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"

breakpoints:
  mobile: "< 768px"
  tablet: "768px – 1024px"       # Foco principal do layout
  desktop: "> 1024px"

layout:
  sidebar-width: "240px"         # Desktop
  sidebar-collapsed: "64px"      # Tablet (apenas ícones)
  bottom-nav-height: "64px"      # Mobile
  header-height: "56px"
  content-max-width: "1280px"
  content-padding-desktop: "32px"
  content-padding-tablet: "20px"
  content-padding-mobile: "16px"

components:
  # Botões
  button-primary:
    bg: "{colors.accent}"
    bgHover: "{colors.accent-hover}"
    text: "{colors.text-on-accent}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    fontSize: "{typography.body-medium.fontSize}"
    shadow: "{shadow-sm}"
  button-secondary:
    bg: "{colors.surface}"
    bgHover: "{colors.surface-2}"
    text: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    bg: "transparent"
    bgHover: "{colors.accent-light}"
    text: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  button-danger:
    bg: "{colors.danger}"
    bgHover: "#b91c1c"
    text: "{colors.text-on-accent}"
    rounded: "{rounded.md}"
    padding: "8px 16px"

  # Cards
  card:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "{shadow-sm}"
    hoverShadow: "{shadow-md}"
    transition: "box-shadow 150ms ease, transform 150ms ease"
    hoverTransform: "translateY(-1px)"

  # Inputs
  input:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    borderFocus: "1px solid {colors.border-focus}"
    text: "{colors.text-primary}"
    placeholder: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    fontSize: "{typography.body.fontSize}"
    shadow: "inset 0 1px 2px rgba(0,0,0,0.04)"

  # Labels de formulário
  form-label:
    text: "{colors.text-secondary}"
    fontSize: "{typography.label.fontSize}"
    fontWeight: "{typography.label.fontWeight}"
    marginBottom: "6px"

  # Badges de Potencial do HCP
  badge-potential-1:                # Alto potencial
    bg: "{colors.success-light}"
    border: "1px solid {colors.success-border}"
    text: "{colors.success}"
    label: "Potencial 1"
  badge-potential-2:                # Médio potencial
    bg: "{colors.warning-light}"
    border: "1px solid {colors.warning-border}"
    text: "{colors.warning}"
    label: "Potencial 2"
  badge-potential-3:                # Baixo potencial
    bg: "{colors.neutral-light}"
    border: "1px solid {colors.neutral-border}"
    text: "{colors.neutral}"
    label: "Potencial 3"

  # Badges de Status de Visita
  badge-visit-scheduled:
    bg: "{colors.info-light}"
    text: "{colors.info}"
    label: "Agendada"
  badge-visit-completed:
    bg: "{colors.success-light}"
    text: "{colors.success}"
    label: "Concluída"
  badge-visit-cancelled:
    bg: "{colors.neutral-light}"
    text: "{colors.neutral}"
    label: "Cancelada"
  badge-visit-rescheduled:
    bg: "{colors.warning-light}"
    text: "{colors.warning}"
    label: "Reagendada"

  # Badges de Avaliação da Visita
  badge-rating-great:
    bg: "{colors.success-light}"
    text: "{colors.success}"
    icon: "😊"
    label: "Ótima"
  badge-rating-good:
    bg: "{colors.info-light}"
    text: "{colors.info}"
    icon: "👍"
    label: "Boa"
  badge-rating-neutral:
    bg: "{colors.neutral-light}"
    text: "{colors.neutral}"
    icon: "😐"
    label: "Neutra"
  badge-rating-bad:
    bg: "{colors.danger-light}"
    text: "{colors.danger}"
    icon: "😞"
    label: "Ruim"

  # Badges de Curva de Adoção
  badge-adoption-innovator:
    bg: "#fdf4ff"
    text: "#9333ea"
    label: "Inovador"
  badge-adoption-early-adopter:
    bg: "{colors.accent-light}"
    text: "{colors.accent}"
    label: "Early Adopter"
  badge-adoption-early-majority:
    bg: "{colors.info-light}"
    text: "{colors.info}"
    label: "Maioria Inicial"
  badge-adoption-late-majority:
    bg: "{colors.warning-light}"
    text: "{colors.warning}"
    label: "Maioria Tardia"
  badge-adoption-laggard:
    bg: "{colors.neutral-light}"
    text: "{colors.neutral}"
    label: "Retardatário"

  # Sidebar Navigation
  sidebar:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    width: "{layout.sidebar-width}"
    shadow: "{shadow-sm}"
  sidebar-item:
    bg: "transparent"
    bgHover: "{colors.surface-2}"
    text: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    gap: "10px"
  sidebar-item-active:
    bg: "{colors.accent-light}"
    border: "1px solid {colors.accent-light-border}"
    text: "{colors.accent}"
    fontWeight: "500"
    rounded: "{rounded.md}"
    padding: "8px 12px"

  # Bottom Navigation (mobile)
  bottom-nav:
    bg: "{colors.surface}"
    borderTop: "1px solid {colors.border}"
    height: "{layout.bottom-nav-height}"
    shadow: "{shadow-bottom-sheet}"
  bottom-nav-item-active:
    text: "{colors.accent}"
    indicatorBg: "{colors.accent}"
    indicatorHeight: "2px"

  # Header
  header:
    bg: "{colors.surface}"
    borderBottom: "1px solid {colors.border}"
    height: "{layout.header-height}"
    padding: "0 {spacing.lg}"

  # Modal
  modal:
    bg: "{colors.surface}"
    overlay: "rgba(15, 23, 42, 0.5)"
    rounded: "{rounded.xl}"
    shadow: "{shadow-lg}"
    padding: "{spacing.lg}"
    maxWidthSm: "400px"
    maxWidthMd: "560px"
    maxWidthLg: "720px"

  # Bottom Sheet (mobile/tablet)
  bottom-sheet:
    bg: "{colors.surface}"
    rounded-top: "16px 16px 0 0"
    shadow: "{shadow-bottom-sheet}"
    handle-bg: "{colors.border}"
    handle-width: "36px"
    handle-height: "4px"
    maxHeight: "90vh"

  # Toast
  toast:
    success-bg: "{colors.success-light}"
    success-border: "{colors.success-border}"
    success-text: "{colors.success}"
    error-bg: "{colors.danger-light}"
    error-border: "{colors.danger-border}"
    error-text: "{colors.danger}"
    warning-bg: "{colors.warning-light}"
    warning-border: "{colors.warning-border}"
    warning-text: "{colors.warning}"
    rounded: "{rounded.lg}"
    shadow: "{shadow-md}"
    padding: "12px 16px"

  # Kanban Pipeline
  kanban-column:
    bg: "{colors.surface-2}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    minWidth: "280px"
    padding: "{spacing.md}"
  kanban-column-header:
    fontSize: "{typography.body-medium.fontSize}"
    fontWeight: "600"
    color: "{colors.text-primary}"
    paddingBottom: "{spacing.sm}"
  kanban-card:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    shadow: "{shadow-sm}"
    hoverShadow: "{shadow-md}"

  # Estoque — alerta de nível baixo
  inventory-row-alert:
    bg: "{colors.danger-light}"
    border-left: "3px solid {colors.danger}"

  # Gráficos (Recharts)
  chart-colors:
    primary: "{colors.accent}"
    secondary: "#60a5fa"
    success: "{colors.success}"
    warning: "{colors.warning}"
    danger: "{colors.danger}"
    neutral: "{colors.neutral}"
  chart-tooltip:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    shadow: "{shadow-md}"
    rounded: "{rounded.md}"
---

# PharmaRep CRM — Design System

## Visão Geral

O design do PharmaRep CRM segue uma filosofia de **clareza profissional**: dados comerciais precisam ser lidos rapidamente, sem distrações visuais. O fundo usa um cinza levemente azulado (`#f0f4f8`) que, combinado com as superfícies brancas e sombras com toque azul, cria uma atmosfera limpa e moderna — sem parecer genérico.

O objetivo central é que um representante farmacêutico consiga usar o app com uma mão, num tablet, enquanto espera na recepção do consultório.

---

## Layout e Responsividade

O layout usa o padrão de duas colunas clássico de SaaS adaptado para três breakpoints:

### Desktop (> 1024px)
Sidebar fixa de `240px` à esquerda com logo, navegação completa (ícone + texto), avatar e botão de logout na base. Área de conteúdo à direita com padding de `32px` e largura máxima de `1280px` centralizada.

### Tablet (768px – 1024px) — Foco Principal
Sidebar colapsada mostrando apenas ícones (`64px`). Hover expande temporariamente com labels. Área de conteúdo ocupa o restante da tela com padding de `20px`. Modais são substituídos por Bottom Sheets que sobem da parte inferior da tela, mais ergonômico para toque. Grids de cards usam 2 colunas.

### Mobile (< 768px)
Sidebar escondida. BottomNav fixa na parte inferior com 5 ícones principais. Área de conteúdo com padding de `16px`. Formulários ocupam tela cheia. Grids de cards usam 1 coluna.

---

## Sistema de Cores

A paleta gira em torno de **azul royal como cor de ação** (`#2563eb`) e **cores semânticas** para comunicar rapidamente o estado de leads, visitas e estoque:

- **Fundo (`#f0f4f8`)**: Cinza levemente azulado que contrasta perfeitamente com os cards brancos.
- **Superfície (`#ffffff`)**: Cards e painéis elevam visualmente sobre o fundo.
- **Accent (`#2563eb`)**: Botões primários, navegação ativa, links e indicadores de progresso.
- **Sombras azuladas**: `rgba(37, 99, 235, 0.06–0.14)` criam profundidade sem peso visual.
- **Potencial 1/2/3**: Verde/Amarelo/Cinza para hierarquizar médicos por prioridade.
- **Status de Visita**: Azul=Agendada, Verde=Concluída, Cinza=Cancelada, Amarelo=Reagendada.

---

## Tipografia

Fonte nativa do sistema (`system-ui`) para máxima performance e consistência entre dispositivos. A hierarquia tem 8 níveis:

- **`display`** (32px/700): Títulos de telas de login e landing.
- **`h1`** (24px/600): Título principal de cada página do dashboard.
- **`h2`** (20px/600): Título de seções dentro de uma página.
- **`h3`** (16px/600): Sub-seções, títulos de cards.
- **`body`** (14px/400): Texto corrido, valores de campos.
- **`body-medium`** (14px/500): Valores de destaque, nomes de HCPs nos cards.
- **`caption`** (12px/400): Datas, IDs, informações secundárias.
- **`label`** (12px/500): Labels de formulário, cabeçalhos de colunas de tabela.

---

## Componentes Principais

### HCP Card
Card branco com borda sutil, cantos de `12px` e hover com leve elevação e sombra azulada. Conteúdo: nome do médico em `body-medium`, especialidade em `caption` com cor `text-secondary`, badge de potencial (colorido), badge de categoria, badge de curva de adoção. Rodapé com data da última visita e botão ghost de ver perfil.

### Visit Card
Card com borda esquerda colorida conforme o status (azul=agendada, verde=concluída). Exibe: nome do HCP, data/horário em destaque, badge de status, local e botão de ações (→ registrar resultado, editar, cancelar).

### Sidebar Item
Item de navegação com ícone Lucide de `18px` e label. Estado padrão: texto `text-secondary`, fundo transparente. Estado ativo: fundo `accent-light`, borda `accent-light-border`, texto `accent` em `body-medium`. Transição `150ms ease` no background.

### Bottom Sheet
Componente crítico para tablet e mobile. Sobe com animação `translateY` da base da tela. Handle pill cinza no topo. Overlay semitransparente. `border-radius: 16px 16px 0 0`. Conteúdo com `max-height: 90vh` e scroll interno. Fechar com swipe para baixo ou toque no overlay.

### Kanban Card
Card menor com nome do HCP, especialidade em caption, badge de prioridade e ícone de arrastar. Botões de seta (← →) no hover para mover entre colunas sem drag & drop. Borda esquerda colorida conforme prioridade (alta=vermelho, média=amarelo, baixa=cinza).

### Badge de Potencial
Três variantes claramente distintas:
- **Potencial 1**: Fundo verde claro, texto verde escuro, ícone de chama 🔥 opcional.
- **Potencial 2**: Fundo amarelo claro, texto âmbar.
- **Potencial 3**: Fundo cinza claro, texto cinza.

### Alert de Estoque Baixo
Linha da tabela de estoque com `background: danger-light` e `border-left: 3px solid danger`. Badge de alerta vermelho com ícone de triângulo. Visível imediatamente sem precisar scrollar.

---

## Elevação e Profundidade

Três níveis de sombra com toque azulado para hierarquia visual clara:

- **`shadow-sm`**: Cards da listagem de HCPs e visitas em estado normal.
- **`shadow-md`**: Cards em hover, tooltips, dropdowns.
- **`shadow-lg`**: Modais e painéis flutuantes.
- **`shadow-drawer`**: Sidebar lateral que sobrepõe o conteúdo em tablet.
- **`shadow-bottom-sheet`**: Bottom sheet que sobe da base da tela.

---

## Padrões de Formulário

Todos os formulários seguem:
1. Label em `label` (12px/500) acima do campo com espaço de `6px`.
2. Input com borda `border` em repouso, `border-focus` (azul) em foco com `box-shadow` sutil interno.
3. Mensagem de erro em `caption` vermelho abaixo do campo, com ícone de exclamação.
4. Campos obrigatórios com asterisco vermelho no label.
5. Botão primário à direita, botão secundário à esquerda no rodapé.
6. Em tablet/mobile: botões ocupam largura total (`w-full`).

---

## Do's e Don'ts

### Do's
- **Use sombras com toque azul** para manter a consistência da identidade visual.
- **Separe visualmente potencial 1/2/3** — é a informação mais crítica para o representante priorizar o dia.
- **Mostre badges de status nas visitas** — o representante precisa saber de relance o que ainda não fez.
- **Use Bottom Sheet no tablet** em vez de Modal — é muito mais ergonômico para toque.
- **Mostre alertas de estoque baixo de forma impossível de ignorar** — cor de fundo + borda lateral.
- **Loading skeleton** em todos os carregamentos de lista — nunca uma tela em branco.

### Don'ts
- **Não use temas escuros** — o representante usa o app com luz do dia, muitas vezes ao ar livre.
- **Não use cores neon ou gradientes vibrantes** — o contexto é profissional e médico.
- **Não esconda o potencial do HCP** — é a principal informação de priorização, deve estar sempre visível.
- **Não use mais de 3 ações por card** — mantenha os cards limpos, detalhes ficam no perfil.
- **Não use drag & drop no MVP** — botões de seta são mais confiáveis em touch e mais rápidos de implementar.
- **Não sobreponha o BottomNav com conteúdo** — sempre aplicar `padding-bottom: 64px` na área de conteúdo em mobile.
