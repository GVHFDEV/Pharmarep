# PRD — PharmaRep CRM

## 1. Visão Geral

### Resumo do Produto
PharmaRep CRM é uma plataforma web focada em representantes farmacêuticos para organizar a carteira de médicos (HCPs), agendar e registrar visitas, controlar os produtos propagandeados, gerenciar estoque de amostras e visualizar métricas de performance comercial em tempo real.

### Objetivo
Substituir planilhas e cadernos por uma plataforma responsiva, segura e intuitiva — com foco especial em tablets, que é o dispositivo principal em campo. O MVP entrega o ciclo completo: cadastrar médico → agendar visita → registrar resultado → acompanhar métricas.

### Diferencial de Mercado
CRMs genéricos não entendem o fluxo do representante farmacêutico: curvas de adoção, categorização de HCPs por potencial, controle de amostras por produto e agenda de visitas com histórico de relacionamento. O PharmaRep foi desenhado do zero para este fluxo.

### Momento Mágico
O representante abre o app no tablet antes de entrar no consultório, vê o perfil completo do médico (potencial, última visita, produtos em destaque), conclui a visita com dois toques e já vê o próximo HCP na agenda do dia.

### Critérios de Sucesso do MVP
- Cadastro completo de HCPs com todos os campos regulatórios.
- Agendamento de visitas vinculado ao calendário do HCP.
- Registro de resultado da visita (concluída, avaliação, produtos propagandeados).
- Dashboard com métricas básicas de visitas e médicos.
- Controle de estoque de amostras.
- Login seguro com Supabase Auth.
- Interface responsiva com foco em tablet (768px–1024px).

---

## 2. Arquitetura Técnica

### Visão Geral
Aplicação web full-stack usando Next.js no frontend e backend (API Routes / Server Actions) com Supabase como banco de dados PostgreSQL gerenciado, autenticação e storage. Tudo rodando na nuvem, acessível de qualquer dispositivo com navegador.

```
Browser (React / Next.js App Router)
    │
    ├── Server Components (SSR / RSC) → Supabase DB (PostgreSQL)
    ├── Client Components (interatividade) → Supabase Realtime (opcional)
    ├── API Routes (Next.js) → Supabase Auth / Storage
    └── Middleware (proteção de rotas autenticadas)
```

### Stack Escolhida
| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, rotas protegidas via middleware, Server Actions |
| Linguagem | TypeScript | Tipagem robusta e segurança em produção |
| Estilo | Tailwind CSS | Produtividade alta, responsividade nativa, fácil manutenção por IA |
| Banco de Dados | Supabase (PostgreSQL) | Auth integrado, RLS nativo, tempo real, storage |
| Autenticação | Supabase Auth | Email/senha, sessão JWT, proteção de rotas |
| ORM/Query | Supabase JS Client (`@supabase/supabase-js`) | Integração direta com RLS e Auth |
| Ícones | Lucide React | Consistente, leve, tree-shakable |
| Formulários | React Hook Form + Zod | Validação robusta e type-safe |
| Datas | date-fns | Leve e completo para manipulação de datas |
| Gráficos | Recharts | Componentes React nativos, fácil de customizar |

### Estrutura do Repositório
```
project-root/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Tela de login
│   │   └── register/page.tsx       # Tela de cadastro
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout com Sidebar
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── hcps/
│   │   │   ├── page.tsx            # Lista de HCPs
│   │   │   ├── [id]/page.tsx       # Perfil do HCP
│   │   │   └── new/page.tsx        # Cadastro de novo HCP
│   │   ├── visits/
│   │   │   ├── page.tsx            # Lista e calendário de visitas
│   │   │   ├── [id]/page.tsx       # Detalhe da visita
│   │   │   └── new/page.tsx        # Nova visita
│   │   ├── pipeline/page.tsx       # Pipeline Kanban
│   │   ├── inventory/page.tsx      # Estoque de amostras
│   │   ├── stats/page.tsx          # Estatísticas avançadas
│   │   └── settings/page.tsx       # Configurações de conta
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Estilos globais / Tailwind
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Sidebar desktop
│   │   ├── BottomNav.tsx           # Navegação mobile/tablet
│   │   └── Header.tsx              # Cabeçalho com breadcrumb e avatar
│   ├── hcps/
│   │   ├── HcpCard.tsx             # Card do médico na listagem
│   │   ├── HcpForm.tsx             # Formulário de cadastro/edição
│   │   ├── HcpProfile.tsx          # Perfil completo do HCP
│   │   └── AdoptionCurveTag.tsx    # Badge de curva de adoção
│   ├── visits/
│   │   ├── VisitCard.tsx           # Card de visita
│   │   ├── VisitForm.tsx           # Formulário de nova visita
│   │   ├── VisitCalendar.tsx       # Calendário de visitas
│   │   └── VisitResult.tsx         # Formulário de resultado
│   ├── pipeline/
│   │   └── KanbanBoard.tsx         # Board Kanban com colunas
│   ├── inventory/
│   │   └── StockTable.tsx          # Tabela de estoque
│   ├── stats/
│   │   ├── VisitChart.tsx          # Gráfico de visitas
│   │   └── HcpStats.tsx            # Métricas de HCPs
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx         # Bottom sheet para mobile/tablet
│   │   └── Toast.tsx
│   └── auth/
│       └── AuthGuard.tsx           # Proteção de rotas no client
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client (browser)
│   │   ├── server.ts               # Supabase client (server)
│   │   └── middleware.ts           # Supabase middleware helper
│   ├── validations/
│   │   ├── hcp.ts                  # Schema Zod do HCP
│   │   └── visit.ts                # Schema Zod da visita
│   └── utils/
│       ├── formatters.ts           # Formatação de telefone, CPF, data
│       └── constants.ts            # Constantes do domínio
├── hooks/
│   ├── useHcps.ts
│   ├── useVisits.ts
│   ├── useInventory.ts
│   └── useUser.ts
├── types/
│   └── index.ts                    # Tipos TypeScript globais
├── middleware.ts                   # Proteção de rotas Next.js
└── supabase/
    └── migrations/                 # Migrations SQL do banco
```

### Segurança e Autenticação
- Supabase Auth com email e senha.
- JWT gerenciado pelo Supabase automaticamente via cookies HttpOnly.
- **Row Level Security (RLS)** ativo em todas as tabelas: cada representante só vê seus próprios dados.
- Middleware Next.js redireciona rotas protegidas para `/login` se não autenticado.
- Variáveis de ambiente para chaves do Supabase (nunca expostas no client-side além da `anon key`).

---

## 3. Modelo de Dados

### Entidades Principais

#### `profiles` (extensão do Supabase Auth)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  company TEXT,              -- Laboratório/empresa
  region TEXT,               -- Região de atuação
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `hcps` (Healthcare Professionals — médicos)
```sql
CREATE TABLE hcps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  crm TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  mobile_phone TEXT,
  landline_phone TEXT,
  specialty TEXT NOT NULL,   -- Ex: Cardiologista, Clínico Geral
  category TEXT,             -- Ex: A, B, C ou Ouro, Prata, Bronze
  potential INTEGER CHECK (potential IN (1, 2, 3)),  -- 1=alto, 2=médio, 3=baixo
  adoption_curve TEXT CHECK (adoption_curve IN (
    'Inovador', 'Early Adopter', 'Maioria Inicial',
    'Maioria Tardia', 'Retardatário'
  )),
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_city TEXT,
  clinic_state TEXT,
  clinic_zip TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `products` (produtos farmacêuticos)
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,             -- Ex: Cardiovascular, Antibiótico
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `visits` (visitas aos HCPs)
```sql
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hcp_id UUID REFERENCES hcps(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'completed', 'cancelled', 'rescheduled'
  )),
  rating TEXT CHECK (rating IN ('great', 'good', 'neutral', 'bad')),
  notes TEXT,                -- Registro livre de como foi a visita
  duration_minutes INTEGER,  -- Duração estimada em minutos
  location TEXT,             -- Local (consultório, hospital, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `visit_products` (produtos propagandeados por visita)
```sql
CREATE TABLE visit_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  samples_delivered INTEGER DEFAULT 0,
  notes TEXT
);
```

#### `inventory` (estoque de amostras)
```sql
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'unidades',
  min_quantity INTEGER DEFAULT 5,   -- Alerta de estoque baixo
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### `pipeline_deals` (oportunidades de relacionamento)
```sql
CREATE TABLE pipeline_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hcp_id UUID REFERENCES hcps(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'prospeccao' CHECK (stage IN (
    'prospeccao', 'primeiro_contato', 'visita_agendada',
    'em_relacionamento', 'convertido', 'perdido'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  expected_close TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
Ativar RLS em todas as tabelas e criar políticas para que cada `user_id` só leia e escreva os próprios registros. Exemplo para `hcps`:
```sql
ALTER TABLE hcps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own HCPs"
  ON hcps FOR ALL USING (auth.uid() = user_id);
```
Repetir o mesmo padrão para `visits`, `products`, `inventory`, `pipeline_deals` e `visit_products` (via join com `visits`).

---

## 4. User Stories

### Epic: Gestão de HCPs
**US-001:** Como representante, quero cadastrar um médico com todos os campos (CRM, CPF, especialidade, potencial) para ter sua ficha completa no sistema.
**US-002:** Como representante, quero filtrar e buscar médicos por nome, especialidade, potencial e categoria para encontrar rapidamente quem preciso visitar.
**US-003:** Como representante, quero ver o perfil completo do médico com histórico de visitas e produtos propagandeados.

### Epic: Visitas
**US-004:** Como representante, quero agendar uma visita para um médico em uma data e horário específicos.
**US-005:** Como representante, quero marcar uma visita como concluída e registrar como foi (avaliação + notas + produtos propagandeados + amostras entregues).
**US-006:** Como representante, quero ver minha agenda do dia no formato de lista ou calendário para planejar o roteiro.

### Epic: Pipeline
**US-007:** Como representante, quero ver meus HCPs organizados em estágios de relacionamento no Kanban para saber onde concentrar esforço.

### Epic: Estoque
**US-008:** Como representante, quero registrar quanto de cada produto tenho em estoque para controlar amostras.
**US-009:** Como representante, quero receber alerta visual quando um produto estiver abaixo do estoque mínimo.

### Epic: Métricas
**US-010:** Como representante, quero ver quantas visitas fiz por semana/mês, por médico e por produto em gráficos simples.

### Epic: Conta
**US-011:** Como usuário, quero criar conta com email e senha, atualizar meu perfil e alterar minha senha.

---

## 5. Requisitos Funcionais

**FR-001: Autenticação**
- P0 — Login com email e senha via Supabase Auth.
- Cadastro de nova conta com nome completo, email, senha e empresa.
- Redefinição de senha por email (fluxo nativo do Supabase).
- Logout seguro com limpeza de sessão.

**FR-002: Cadastro de HCP**
- P0 — Formulário completo com: nome, CRM, CPF, email, celular, telefone fixo, clínica, endereço completo, especialidade, categoria, potencial (1/2/3) e curva de adoção.
- Formatação automática de CPF e telefone no input.
- Edição e inativação de HCPs (soft delete — campo `active = false`).
- Busca e filtros por especialidade, categoria, potencial.

**FR-003: Agenda e Visitas**
- P0 — Agendar visita com data, horário, HCP e local.
- Visualização de agenda em lista (padrão) e calendário mensal.
- Registrar resultado da visita: status, avaliação (ótima/boa/neutra/ruim), notas livres, produtos propagandeados, amostras entregues.
- Histórico de visitas por HCP na tela de perfil.

**FR-004: Pipeline Kanban**
- P1 — Board com 6 colunas: Prospecção, Primeiro Contato, Visita Agendada, Em Relacionamento, Convertido, Perdido.
- Cards com nome do HCP, especialidade e indicador de prioridade.
- Mover card entre colunas com botão rápido (seta) — drag & drop como melhoria futura.

**FR-005: Estoque de Amostras**
- P1 — Tabela de produtos com quantidade atual, unidade e mínimo configurável.
- Ação de entrada (recebimento) e saída manual (desconto automático ao registrar amostras entregues na visita).
- Indicador visual de alerta quando abaixo do mínimo.

**FR-006: Dashboard e Estatísticas**
- P1 — Cards de resumo: total de HCPs ativos, visitas do mês, visitas concluídas, visitas pendentes.
- Gráfico de barras: visitas por semana (últimas 4 semanas).
- Gráfico de rosca: distribuição de HCPs por potencial (1/2/3).
- Ranking dos 5 HCPs mais visitados.
- Top 3 produtos mais propagandeados no mês.

**FR-007: Configurações de Conta**
- P1 — Editar nome, empresa e região.
- Alterar senha (confirmar senha atual + nova senha + confirmação).
- Upload de avatar (Supabase Storage).

---

## 6. Requisitos Não-Funcionais

### Performance
- Carregamento inicial do dashboard em menos de 2 segundos (com SSR do Next.js).
- Listas com paginação server-side (20 itens por página) para não sobrecarregar o client.
- Otimistic UI nas ações de mover pipeline e concluir visita.

### Segurança
- RLS ativo em 100% das tabelas — sem exceções.
- Senhas gerenciadas pelo Supabase Auth (bcrypt, nunca armazenadas em texto puro).
- CPF e dados sensíveis de HCPs só visíveis para o representante dono do registro.
- HTTPS obrigatório em produção (Vercel garante por padrão).

### Responsividade
- Mobile (< 768px): navegação por BottomNav, formulários em tela cheia, bottom sheet para detalhes.
- Tablet (768px–1024px): sidebar colapsável + conteúdo principal. Layout principal.
- Desktop (> 1024px): sidebar expandida + conteúdo principal com colunas extras.

### Acessibilidade
- Contraste mínimo WCAG AA em todos os textos.
- Labels em todos os campos de formulário.
- Foco de teclado visível em componentes interativos.

---

## 7. Casos de Borda e Tratamento de Erros

| Cenário | Comportamento Esperado |
|---|---|
| HCP com CRM duplicado | Exibir erro de validação antes de salvar |
| Visita agendada no passado | Permitir, mas exibir aviso amarelo |
| Estoque abaixo do mínimo | Badge vermelha na tabela e alerta no dashboard |
| Token de sessão expirado | Redirecionar para login automaticamente (middleware) |
| Erro de rede no Supabase | Toast de erro com opção de tentar novamente |
| CPF com formato inválido | Bloqueio no formulário com mensagem de erro inline |

---

## 8. Fora do Escopo do MVP

- Integração com WhatsApp ou email real.
- App mobile nativo (iOS/Android).
- Sincronização com Google Calendar ou Outlook.
- Multi-usuário por laboratório (gestão de equipe).
- Metas e cotas por período.
- Relatórios exportáveis em PDF/Excel.
- Notificações push.
- Drag & drop no Kanban (melhoria futura — no MVP usar botões).

---

## 9. Dependências e Pacotes

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x"
  }
}
```
