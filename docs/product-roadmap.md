# Product Roadmap — PharmaRep CRM

> Gerado para agente de codificação autônomo. Marque as tarefas como `- [x]` conforme concluídas.

**Status:** Aguardando início (0/18 tarefas completas)
**Fase Atual:** Phase 0 — Fundação e Autenticação

---

## Filosofia de Build

1. **Cada fase entrega algo funcional.** Nunca deixe a aplicação quebrada ao final de uma fase.
2. **Segurança primeiro.** RLS ativo antes de qualquer dado ser inserido. Não escreva código sem verificar as políticas.
3. **Responsividade tablet como prioridade.** Teste em viewport 768px após cada componente de UI.
4. **Leia apenas as seções do PRD referenciadas em cada fase** para não sobrecarregar o contexto.
5. **Supabase client server-side vs client-side são diferentes.** Use `lib/supabase/server.ts` em Server Components e `lib/supabase/client.ts` em Client Components com o pacote `@supabase/ssr`.

---

## Phase 0: Fundação e Autenticação

> **Goal:** Configurar o projeto Next.js, Tailwind, Supabase e o fluxo completo de autenticação (login, cadastro, logout, proteção de rotas).

**Seções do PRD a ler antes de começar:**
- `§ 2. Arquitetura Técnica > Stack Escolhida`
- `§ 2. Arquitetura Técnica > Estrutura do Repositório`
- `§ 2. Arquitetura Técnica > Segurança e Autenticação`
- `§ 3. Modelo de Dados > profiles`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 0. Leia as seções de referência do docs/prd.md indicadas. Comece pela TASK-001. Atualize o roadmap marcando [x] conforme conclui. Ao final, o login deve funcionar com redirecionamento para /dashboard e o logout deve limpar a sessão."

- [ ] **TASK-001** — Setup do Projeto
  Files: `package.json`, `tailwind.config.ts`, `app/globals.css`, `.env.local.example`
  Notes: Inicializar Next.js 14 com TypeScript e App Router (`npx create-next-app@latest`). Instalar todos os pacotes listados no `§ 9. Dependências` do PRD. Configurar Tailwind CSS. Criar `.env.local.example` com as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Criar `lib/supabase/client.ts` (usando `createBrowserClient` do `@supabase/ssr`) e `lib/supabase/server.ts` (usando `createServerClient` com cookies do `next/headers`).
  Verify: `npm run dev` sobe sem erros. Console não mostra erros de configuração do Supabase.

- [ ] **TASK-002** — Middleware de Proteção de Rotas
  Files: `middleware.ts`
  Notes: Criar o middleware Next.js usando o helper do `@supabase/ssr` para verificar a sessão. Rotas do grupo `(dashboard)` devem redirecionar para `/login` se não autenticado. Rotas do grupo `(auth)` devem redirecionar para `/dashboard` se já autenticado. Atualizar o `matcher` do middleware para cobrir todas as rotas protegidas.
  Verify: Acesse `/dashboard` sem estar logado e confirme o redirecionamento para `/login`.

- [ ] **TASK-003** — Tela de Login e Cadastro
  Files: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `components/auth/AuthForm.tsx`
  Notes: Criar telas de Login e Cadastro com visual limpo e profissional (fundo branco, card centralizado com logo/título do app, campos com label, botão primário azul). Login usa `supabase.auth.signInWithPassword`. Cadastro usa `supabase.auth.signUp` e após sucesso cria o registro na tabela `profiles` com `full_name`, `email` e `company`. Exibir mensagens de erro inline se credenciais inválidas ou email já cadastrado. Após login com sucesso, redirecionar para `/dashboard`.
  Verify: Cadastre uma conta, faça logout e faça login novamente — confirme o redirecionamento para `/dashboard`.

- [ ] **TASK-004** — Banco de Dados: Migrations de Fundação
  Files: `supabase/migrations/001_profiles.sql`, `supabase/migrations/002_rls_profiles.sql`
  Notes: Criar a tabela `profiles` conforme o schema do `§ 3. Modelo de Dados > profiles` do PRD. Ativar RLS na tabela `profiles`. Criar política: o usuário só lê e escreve o próprio perfil (`auth.uid() = id`). Criar trigger SQL no Supabase para inserir automaticamente um registro em `profiles` quando um novo usuário é criado em `auth.users`. Documentar os comandos no arquivo de migration.
  Verify: Cadastre um usuário e confirme via Supabase Dashboard que o registro em `profiles` foi criado automaticamente.

---

## Phase 1: Layout Principal e Navegação

> **Goal:** Criar o layout base do dashboard com Sidebar (desktop), BottomNav (mobile/tablet), Header e roteamento entre seções.

**Seções do PRD a ler antes de começar:**
- `§ 8. UI/UX — design.md > Layout`
- `§ 6. Requisitos Funcionais > FR-001`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 1. Leia as seções de referência do docs/prd.md e docs/design.md indicadas. Comece pela TASK-005. Ao final, a navegação entre todas as telas deve funcionar em desktop e tablet."

- [ ] **TASK-005** — Componentes de Layout: Sidebar e BottomNav
  Files: `app/(dashboard)/layout.tsx`, `components/layout/Sidebar.tsx`, `components/layout/BottomNav.tsx`, `components/layout/Header.tsx`
  Notes: Criar o layout do grupo `(dashboard)` com Sidebar fixa de `240px` à esquerda em desktop (>= 768px) e BottomNav fixa na parte inferior em mobile (< 768px). A Sidebar exibe: logo/nome do app, itens de navegação com ícone e label (Dashboard, HCPs, Visitas, Pipeline, Estoque, Estatísticas, Configurações), avatar do usuário e botão de logout na parte inferior. O BottomNav exibe apenas ícones + label curto para as 5 principais rotas. O Header exibe o título da página atual e o avatar do usuário com menu de dropdown (perfil, sair). Usar `clsx` e `tailwind-merge` para classes condicionais. Itens ativos com fundo azul claro e texto azul (conforme design.md).
  Verify: Navegue entre as rotas no desktop e tablet — Sidebar e BottomNav destacam o item ativo corretamente.

- [ ] **TASK-006** — Componentes de UI Base
  Files: `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Select.tsx`, `components/ui/Badge.tsx`, `components/ui/Card.tsx`, `components/ui/Modal.tsx`, `components/ui/BottomSheet.tsx`, `components/ui/Toast.tsx`
  Notes: Criar os componentes de UI reutilizáveis conforme os tokens de design do `design.md`. Button aceita variantes `primary`, `secondary`, `danger`, `ghost` e prop `loading`. Input com label, placeholder, mensagem de erro e ícone opcional. Select estilizado (sem biblioteca, HTML nativo estilizado com Tailwind). Badge aceita variante `success`, `warning`, `danger`, `info`, `neutral`. Card com `shadow-sm`, borda sutil, cantos arredondados. Modal com overlay escuro e animação de entrada. BottomSheet desliza de baixo para cima em mobile/tablet com overlay. Toast aparece no canto superior direito com auto-dismiss após 3 segundos.
  Verify: Renderize cada componente numa página de teste `/dev` e confirme o visual correto em mobile e desktop.

---

## Phase 2: Gestão de HCPs

> **Goal:** CRUD completo de médicos com listagem, busca, filtros, cadastro, edição e perfil detalhado.

**Seções do PRD a ler antes de começar:**
- `§ 3. Modelo de Dados > hcps`
- `§ 5. User Stories > Epic: Gestão de HCPs`
- `§ 6. Requisitos Funcionais > FR-002`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 2. Leia as seções de referência indicadas. Comece pela TASK-007. Ao final, deve ser possível cadastrar, editar, buscar e ver o perfil de um médico."

- [ ] **TASK-007** — Banco de Dados: Tabelas de HCPs e Produtos
  Files: `supabase/migrations/003_hcps.sql`, `supabase/migrations/004_products.sql`
  Notes: Criar as tabelas `hcps` e `products` conforme o schema completo do `§ 3. Modelo de Dados` do PRD. Ativar RLS em ambas. Criar políticas RLS: `auth.uid() = user_id` para todas as operações (SELECT, INSERT, UPDATE, DELETE). Criar índices em `hcps.user_id`, `hcps.specialty`, `hcps.potential` para performance de filtros.
  Verify: Insira um HCP via Supabase Studio com o `user_id` correto e confirme que ele aparece apenas para aquele usuário.

- [ ] **TASK-008** — Listagem e Busca de HCPs
  Files: `app/(dashboard)/hcps/page.tsx`, `components/hcps/HcpCard.tsx`, `hooks/useHcps.ts`
  Notes: Tela de listagem de HCPs em grid de cards (2 colunas em tablet, 3 em desktop, 1 em mobile). Cada card exibe: nome, especialidade, CRM, badge de potencial (1=verde, 2=amarelo, 3=cinza), badge de categoria, badge de curva de adoção e botão de ver perfil. Implementar busca por nome (debounce de 300ms) e filtros dropdown por especialidade, potencial e categoria (filtros aplicados no server-side via query Supabase). Paginação com 20 itens por página e botão "Carregar mais". Botão flutuante (+) no canto inferior direito para novo HCP. O hook `useHcps` encapsula as queries Supabase com loading e error state.
  Verify: Cadastre 3 HCPs com potenciais diferentes, use o filtro de potencial e confirme que apenas os corretos aparecem.

- [ ] **TASK-009** — Formulário de Cadastro e Edição de HCP
  Files: `app/(dashboard)/hcps/new/page.tsx`, `components/hcps/HcpForm.tsx`, `lib/validations/hcp.ts`
  Notes: Formulário completo com todos os campos do modelo `hcps`. Usar `react-hook-form` com schema `zod` para validação (CRM obrigatório, CPF com 11 dígitos, email válido, celular obrigatório). Formatação automática de CPF (000.000.000-00) e telefones ((00) 00000-0000) via `onChange`. O campo `potential` usa botões de seleção visual (1, 2, 3) em vez de dropdown. O campo `adoption_curve` usa um Select. Em mobile/tablet, o formulário ocupa tela cheia. Em desktop, usa um layout de 2 colunas. O mesmo componente `HcpForm` é reutilizado na edição (recebe `defaultValues`). Após salvar, redirecionar para a listagem com toast de sucesso.
  Verify: Tente salvar com CRM vazio — veja o erro de validação. Salve corretamente e confirme o redirecionamento.

- [ ] **TASK-010** — Perfil Detalhado do HCP
  Files: `app/(dashboard)/hcps/[id]/page.tsx`, `components/hcps/HcpProfile.tsx`
  Notes: Página de perfil com: header com nome, especialidade e badges de potencial/categoria. Seção de dados de contato (telefones, email, endereço). Seção de dados comerciais (curva de adoção, notas). Aba ou seção "Histórico de Visitas" listando as últimas 10 visitas com data, status e avaliação. Aba "Pipeline" mostrando em qual estágio o HCP está. Botões de ação: Editar, Nova Visita (pré-preenchendo o HCP), Inativar. Em tablet: layout de 2 painéis (dados à esquerda, histórico à direita). Em mobile: abas deslizáveis.
  Verify: Acesse o perfil de um HCP — dados completos visíveis, histórico de visitas (mesmo que vazio) renderizado.

---

## Phase 3: Visitas e Agenda

> **Goal:** Agendar visitas, visualizar a agenda no calendário e registrar o resultado completo da visita.

**Seções do PRD a ler antes de começar:**
- `§ 3. Modelo de Dados > visits, visit_products`
- `§ 5. User Stories > Epic: Visitas`
- `§ 6. Requisitos Funcionais > FR-003`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 3. Leia as seções indicadas. Comece pela TASK-011. Ao final, o ciclo completo de agendar → completar uma visita deve funcionar."

- [ ] **TASK-011** — Banco de Dados: Visitas e Produtos da Visita
  Files: `supabase/migrations/005_visits.sql`, `supabase/migrations/006_visit_products.sql`
  Notes: Criar tabelas `visits` e `visit_products` conforme o schema do PRD. RLS na tabela `visits`: `auth.uid() = user_id`. RLS em `visit_products`: acesso via join com `visits` onde `user_id = auth.uid()` — usar policy com subquery: `EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid())`. Criar índices em `visits.user_id`, `visits.hcp_id`, `visits.scheduled_at`, `visits.status`.
  Verify: Confirme via Supabase Studio que as políticas RLS estão ativas e corretas.

- [ ] **TASK-012** — Agenda de Visitas com Lista e Calendário
  Files: `app/(dashboard)/visits/page.tsx`, `components/visits/VisitCard.tsx`, `components/visits/VisitCalendar.tsx`, `hooks/useVisits.ts`
  Notes: Tela de visitas com alternância entre visualização de Lista e Calendário (botão de toggle no header). **Lista:** Cards de visitas agrupados por data (Hoje, Amanhã, Esta Semana, Próximas). Cada card: nome do HCP, horário, local, status badge (agendada=azul, concluída=verde, cancelada=cinza), botão de ações rápidas. **Calendário:** Grade mensal simples em CSS puro mostrando pontos coloridos nos dias com visitas. Clicar no dia mostra as visitas daquele dia num painel lateral (desktop) ou BottomSheet (tablet/mobile). Filtros no topo: Todas / Hoje / Esta Semana / Pendentes / Concluídas. Botão (+) para nova visita.
  Verify: Agende visitas em datas diferentes e confirme que aparecem no calendário e na lista corretamente.

- [ ] **TASK-013** — Formulário de Nova Visita e Registro de Resultado
  Files: `app/(dashboard)/visits/new/page.tsx`, `components/visits/VisitForm.tsx`, `components/visits/VisitResult.tsx`, `lib/validations/visit.ts`
  Notes: **Nova Visita:** Formulário com campo de busca de HCP (autocomplete que busca no Supabase com debounce), data, horário, local e notas opcionais. Validação: HCP e data obrigatórios. **Resultado da Visita:** Ao clicar em "Registrar Resultado" num card de visita agendada, abrir Modal (desktop) ou BottomSheet (tablet/mobile) com: toggle de Status (Concluída/Cancelada/Reagendada), seleção de Avaliação com ícones visuais (ótima=emoji verde, boa=azul, neutra=cinza, ruim=vermelho), textarea de notas livres, seção de Produtos Propagandeados (checkboxes com os produtos cadastrados + campo de quantidade de amostras por produto). Salvar atualiza `visits` e insere/atualiza `visit_products`. Descontar do estoque as amostras entregues (chamar update em `inventory`).
  Verify: Registre resultado de uma visita com 2 produtos. Confirme que o status mudou e o estoque reduziu.

---

## Phase 4: Pipeline, Estoque e Dashboard

> **Goal:** Implementar o Kanban de pipeline de relacionamento, o controle de estoque de amostras e o dashboard de métricas.

**Seções do PRD a ler antes de começar:**
- `§ 3. Modelo de Dados > pipeline_deals, inventory`
- `§ 6. Requisitos Funcionais > FR-004, FR-005, FR-006`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 4. Leia as seções indicadas. Comece pela TASK-014. Ao final, pipeline, estoque e dashboard devem estar funcionais com dados reais do Supabase."

- [ ] **TASK-014** — Banco de Dados: Pipeline e Estoque
  Files: `supabase/migrations/007_pipeline.sql`, `supabase/migrations/008_inventory.sql`
  Notes: Criar tabelas `pipeline_deals` e `inventory` conforme o PRD. RLS em ambas com `auth.uid() = user_id`. Para `inventory`, criar um trigger SQL que desconta automaticamente do estoque quando `visit_products` é inserido (opcional — pode ser feito no client com transação Supabase se o trigger for complexo demais). Criar constraint UNIQUE em `inventory(user_id, product_id)` para evitar duplicatas.
  Verify: Confirme as políticas RLS e a constraint UNIQUE via Supabase Studio.

- [ ] **TASK-015** — Pipeline Kanban
  Files: `app/(dashboard)/pipeline/page.tsx`, `components/pipeline/KanbanBoard.tsx`
  Notes: Board Kanban horizontal com 6 colunas: Prospecção, Primeiro Contato, Visita Agendada, Em Relacionamento, Convertido, Perdido. Cada coluna tem cabeçalho com nome e contador de cards. Cards exibem: nome do HCP, especialidade, badge de prioridade (alta=vermelho, média=amarelo, baixa=cinza) e data esperada de fechamento. Botões de seta (← →) nos cards para mover entre colunas — atualizar no Supabase via `updateDeal`. Em mobile/tablet, colunas com scroll horizontal. Botão (+) em cada coluna para adicionar novo deal (abre BottomSheet/Modal com busca de HCP, título e prioridade).
  Verify: Mova um card de "Prospecção" para "Primeiro Contato" e confirme a mudança no Supabase.

- [ ] **TASK-016** — Estoque de Amostras
  Files: `app/(dashboard)/inventory/page.tsx`, `components/inventory/StockTable.tsx`
  Notes: Tabela com colunas: Produto, Quantidade Atual, Unidade, Mínimo Configurável, Última Atualização, Ações. Linhas com quantidade abaixo do mínimo têm fundo vermelho claro e badge de alerta. Ações por linha: (+) entrada de estoque (Modal com campo de quantidade), editar mínimo. Seção separada para gerenciar os produtos cadastrados (nome, categoria, ativo/inativo). O CRUD de produtos pode ser um Modal simples na mesma página.
  Verify: Cadastre um produto, defina estoque e mínimo. Registre uma visita com amostras — confirme que o estoque reduziu.

- [ ] **TASK-017** — Dashboard de Métricas
  Files: `app/(dashboard)/page.tsx`, `components/stats/VisitChart.tsx`, `components/stats/HcpStats.tsx`
  Notes: Dashboard com: **Cards de Resumo** (4 cards em grid): Total de HCPs Ativos, Visitas no Mês, Visitas Concluídas no Mês, Pendentes Hoje. **Gráfico de Barras** (Recharts `BarChart`): visitas por semana nas últimas 4 semanas, cores azul/verde para concluídas vs agendadas. **Gráfico de Rosca** (Recharts `PieChart`): distribuição de HCPs por potencial (1=verde, 2=amarelo, 3=cinza). **Ranking Top 5 HCPs** mais visitados no mês (lista com avatar e contador). **Top 3 Produtos** mais propagandeados no mês. Todos os dados carregados via Server Component com queries Supabase (múltiplas queries em paralelo com `Promise.all`). Exibir skeleton loading enquanto carrega.
  Verify: Com pelo menos 5 visitas registradas, confirme que os gráficos e rankings refletem os dados reais.

---

## Phase 5: Configurações e Polish Final

> **Goal:** Implementar configurações de conta, polish de responsividade, tratamento de erros e validações finais.

**Seções do PRD a ler antes de começar:**
- `§ 6. Requisitos Funcionais > FR-007`
- `§ 7. Casos de Borda e Tratamento de Erros`
- `§ 6. Requisitos Não-Funcionais > Responsividade`

**Prompt da fase para o agente:**
> "Leia docs/product-roadmap.md e encontre a Phase 5. Esta é a fase de acabamento. Siga a TASK-018 e ao final faça testes completos em viewport 768px (tablet) e 375px (mobile). Remova todos os console.log de debug."

- [ ] **TASK-018** — Configurações de Conta e Polish Final
  Files: `app/(dashboard)/settings/page.tsx`
  Notes: Tela de Configurações com 3 seções: **Perfil** (editar nome, empresa, região — com upload de avatar para Supabase Storage, exibindo preview). **Segurança** (form separado para alterar senha: campo de nova senha + confirmação com validação Zod mínimo 8 caracteres, chama `supabase.auth.updateUser`). **Dados** (exibe um resumo: total de HCPs, visitas e produtos cadastrados). Revisar responsividade em todas as telas: sidebar se colapsa corretamente, BottomNav não sobrepõe conteúdo (padding-bottom na área principal), formulários usam tela cheia em mobile sem overflow horizontal. Verificar todos os casos de borda do `§ 7` do PRD. Garantir que Toast de sucesso/erro aparece em todas as ações importantes. Verificar que o middleware redireciona corretamente em todos os cenários de sessão expirada.
  Verify: Teste o fluxo completo: criar conta → cadastrar 3 HCPs → agendar 3 visitas → registrar resultados → checar dashboard → alterar senha → logout → login novamente. Sem erros no console.

---

## Guia para o Agente de Código

### Padrões de Código Obrigatórios
1. **Sempre usar TypeScript estrito.** Sem `any`, sem `@ts-ignore` sem comentário explicando o motivo.
2. **Server Components por padrão.** Marcar com `"use client"` apenas quando necessário (hooks, eventos, state).
3. **Supabase Server Client em Server Components.** Nunca usar o client browser em Server Components.
4. **Erros do Supabase sempre tratados.** Toda query deve desestruturar `{ data, error }` e tratar o erro.
5. **Funções de formatação centralizadas.** CPF, telefone e datas sempre formatados via `lib/utils/formatters.ts`.
6. **Nunca expor dados de outros usuários.** Confiar no RLS, mas também filtrar por `user_id` nas queries como segunda camada.

### Checklist de Fim de Fase
- [ ] Aplicação compila sem erros (`npm run build`).
- [ ] Nenhum `console.log` de debug no código.
- [ ] Testado em viewport 768px (tablet).
- [ ] RLS verificado para todas as tabelas novas da fase.
- [ ] Checkboxes do roadmap atualizados.
