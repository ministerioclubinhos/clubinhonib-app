# 📊 Módulo de Estatísticas - Frontend

> **Sistema Completo de Análise de Dados - Clubinho NIB**  
> Versão 2.6.0 | Status de Crianças e Data de Entrada | Integrado com Período Letivo GLOBAL | Atualizado em 15/11/2024

⭐ **NOVO v2.6.0**: Estatísticas agora consideram apenas crianças ATIVAS e respeitam data de entrada!

⭐ **CRÍTICO**: Apenas crianças ativas (`isActive = true`) são listadas e semanas anteriores à entrada não são contabilizadas!

---

## ⚠️ INTEGRAÇÃO COM MÓDULO DE CONTROLE

Este módulo de **Estatísticas** trabalha em conjunto com o **Módulo de Controle** (`club-control`):

### Divisão de Responsabilidades

| Módulo           | Responsabilidade                                            |
| ---------------- | ----------------------------------------------------------- |
| **Statistics**   | 📊 Análises históricas, tendências, gráficos, rankings      |
| **Club-Control** | 🎯 Painel em tempo real, períodos GLOBAIS, exceções GLOBAIS |

### ⚠️ INTEGRAÇÃO CRÍTICA: Período Letivo GLOBAL (v2.4.0)

O **Módulo de Controle** gerencia configurações GLOBAIS que **AFETAM DIRETAMENTE** as estatísticas:

#### Período Letivo GLOBAL ⭐ CRÍTICO

- **UM período por ano** para TODOS os clubes
- Definido na tabela `academic_periods`
- **Estatísticas RESPEITAM o período**: semanas fora = não geram alertas
- **Métricas ajustadas**: `weeksExpected` considera apenas período ativo
- **Taxa de frequência correta**: calculada sobre semanas ativas, não ano inteiro
- Primeira semana do período = "Semana 1" do ano letivo

**Exemplo Real:**

```typescript
// Período: 05/02/2024 a 15/12/2024 (40 semanas ativas)
// Clube lançou pagela em 38 semanas

✅ attendanceRate = 95% (38/40) - CORRETO!
❌ SEM período: 73% (38/52) - ERRADO!
```

#### Exceções GLOBAIS

- **UMA exceção por data** afeta TODOS os clubes daquele dia da semana
- Definido na tabela `weekday_exceptions`
- Campo `isRecurrent`: feriados que se repetem anualmente
- **Semanas com exceção NÃO contam** como faltantes
- **Estatísticas ignoram** exceções no cálculo de regularidade

### Endpoints Relacionados

| Estatísticas                      | Controle                       | Propósito                                |
| --------------------------------- | ------------------------------ | ---------------------------------------- |
| `/statistics/attendance/club/:id` | `/club-control/check/club/:id` | Análise histórica vs verificação pontual |
| `/statistics/attendance/week`     | `/club-control/check/week`     | Tendências vs status atual               |
| `/statistics/clubs`               | `/club-control/dashboard`      | Performance vs completude                |

---

## 📋 Visão Geral

### Funcionalidades Principais

```
✅ 3 Visões Completas (Crianças, Clubes, Professores)
✅ 2 Análises de Frequência (Clube, Semanal)
✅ Sistema de Detecção de Semanas Faltantes
✅ Respeita Período Letivo GLOBAL ⭐ v2.4.0
✅ Integrado com Exceções GLOBAIS ⭐ v2.4.0
✅ Métricas Ajustadas (weeksExpected, attendanceRate) ⭐ v2.4.0
✅ Charts Ricos com Recharts
✅ 29+ Tipos de Filtros
✅ Paginação e Ordenação
✅ Distribuições para Gráficos
✅ React Query para Cache
```

---

## 📁 Estrutura de Arquivos

```
src/features/statistics/
├── api.ts                              # API service e tipos (29 filtros)
├── hooks.ts                            # React Query hooks (9 hooks)
├── StatisticsPage.tsx                  # Página principal com tabs
├── components/
│   ├── index.ts                        # Exportações
│   ├── OverviewSummaryCards.tsx        # Cards de resumo
│   ├── StatisticsFilters.tsx           # Filtros avançados
│   ├── QuickFilters.tsx                # Filtros rápidos
│   ├── WeekMonthSummary.tsx            # Resumo semanal/mensal
│   ├── AdvancedPagelasChart.tsx        # Gráfico de pagelas
│   ├── AcceptedChristsTimeChart.tsx    # Gráfico de decisões
│   ├── DemographicDistributions.tsx    # Distribuições demográficas
│   ├── GeographicAnalysis.tsx          # Análise geográfica
│   ├── RadarComparisonChart.tsx        # Comparação radar
│   ├── TeacherPerformanceChart.tsx     # Performance professores
│   ├── RetentionFunnelChart.tsx        # Funil de retenção
│   ├── ActivitiesComparisonChart.tsx   # Comparação atividades
│   ├── ChildrenListView.tsx            # Lista crianças ⭐ NOVO
│   ├── ClubsListView.tsx               # Lista clubes ⭐ NOVO
│   ├── TeachersListView.tsx            # Lista professores ⭐ NOVO
│   ├── ClubAttendanceTimeline.tsx      # Timeline frequência ⭐ NOVO
│   └── WeeklyAttendanceGrid.tsx        # Grid semanal ⭐ NOVO
├── README.md                           # Este arquivo
├── INTEGRATION_GUIDE.md                # Guia de integração
├── RICH_CHARTS_GUIDE.md                # Guia de gráficos
├── COMPLETE_IMPLEMENTATION.md          # Implementação completa
└── VISUAL_GUIDE.md                     # Guia visual
```

---

## 🎯 Funcionalidades Detalhadas

### 1. 📊 Painel Geral (Tab "Geral")

- **Cards de Resumo**: Overview geral do sistema
- **Resumo Semanal/Mensal**: Últimas 6 semanas/meses com gráficos
- **Gráfico de Pagelas**: Evolução temporal (linha, área, barra)
- **Gráfico de Decisões**: Aceitaram vs Reconciliados

### 2. 👥 Análise Demográfica (Tab "Demográfico")

- **Distribuição por Gênero**: Gráfico de pizza
- **Distribuição por Idade**: Gráfico de barras
- **Comparação Radar**: Múltiplas métricas
- **Tempo de Participação**: Análise de retenção

### 3. 🗺️ Análise Geográfica (Tab "Geografia")

- **Top 10 Cidades**: Gráfico de barras
- **Tabela Detalhada**: Cidade, estado, crianças, presença

### 4. 🎯 Insights (Tab "Insights")

- **Top Crianças Engajadas**: Ranking com engagement score
- **Ranking de Clubes**: Performance e presença

### 5. 👨‍🏫 Professores (Tab "Professores")

- **Performance**: Top professores por effectiveness score

### 6. 🔁 Retenção (Tab "Retenção")

- **Funil de Retenção**: Visualização de etapas

### 7. 🎨 Atividades (Tab "Atividades")

- **Comparação**: Presença, meditação, versículo

### 8. 👶 Crianças (Tab "Crianças") ⭐ NOVO

- **Lista Completa**: Tabela com 24 filtros
- **Paginação**: Navegação entre páginas
- **Ordenação**: Por engagement, presença, nome
- **Distribuições**: Gráficos demográficos e geográficos

### 9. 🏫 Clubes (Tab "Clubes") ⭐ NOVO

- **Lista Completa**: Todos os clubes com performance
- **Filtro por Coordenador**: Ver apenas seus clubes
- **Medals**: 🥇🥈🥉 para top 3
- **Performance Score**: Cálculo automático

### 10. 👨‍🏫 Professores (Tab "Professores") ⭐ NOVO

- **Lista Completa**: Effectiveness score
- **Crianças Ensinadas**: Total e ativas
- **Decisões Alcançadas**: Métricas de impacto

### 11. 📅 Frequência (Tab "Frequência") ⭐ NOVO

- **Timeline de Clube**: Análise anual semana a semana
- **Detecção de Semanas Faltantes**: Automática
- **Alertas**: Critical, Warning, Info
- **Grid Semanal**: Todos os clubes em uma semana
- **Respeita Períodos e Exceções GLOBAIS**
- **Paginação Completa** ⭐ v2.5.0: Timeline e missingWeeks paginadas

---

## 🔌 API Endpoints Utilizados

### Backend: `/statistics`

```typescript
// Visões Completas (3)
GET /statistics/children         // 24 filtros
GET /statistics/clubs            // 13 filtros
GET /statistics/teachers         // 14 filtros

// Análise de Frequência (2) ⭐ NOVO - Paginação v2.5.0
GET /statistics/attendance/club/:id  // Timeline anual (page, limit)
GET /statistics/attendance/week      // Grid semanal (page, limit)

// Chart Data (3)
GET /statistics/pagelas/charts
GET /statistics/accepted-christs/charts
GET /statistics/insights

// Dashboard (2)
GET /statistics/overview
```

### Backend: `/club-control` (Estrutura GLOBAL)

```typescript
// Períodos Letivos GLOBAIS
GET /club-control/periods              // Listar todos
GET /club-control/periods/:year        // Buscar por ano
POST /club-control/periods             // Criar período global

// Exceções GLOBAIS
GET /club-control/exceptions           // Listar todas
GET /club-control/exceptions/:date     // Buscar por data
POST /club-control/exceptions          // Criar exceção global

// Verificação em Tempo Real (por clube)
GET /club-control/check/club/:clubId   // Verificar clube
GET /club-control/check/week           // Verificar todos
GET /club-control/dashboard            // Dashboard atual
```

---

## 🎨 Hooks Disponíveis

### Estatísticas

```typescript
usePagelasChartData(filters)           // Dados de pagelas
useAcceptedChristsChartData(filters)   // Dados de decisões
useOverview()                          // Dashboard geral
useInsights(filters)                   // Rankings

// Visões Completas ⭐ NOVO
useChildren(filters)                   // Lista crianças (24 filtros)
useClubs(filters)                      // Lista clubes (13 filtros)
useTeachers(filters)                   // Lista professores (14 filtros)

// Análise de Frequência ⭐ NOVO - Paginação v2.5.0
useClubAttendance(clubId, { year, page?, limit? })      // Timeline de clube (paginação)
useWeeklyAttendance({ year, week, page?, limit? })      // Grid semanal (paginação)
```

### Controle (GLOBAL)

```typescript
// Períodos GLOBAIS
useAcademicPeriods(); // Listar todos períodos
usePeriodByYear(year); // Buscar por ano

// Exceções GLOBAIS
useWeekdayExceptions(params); // Listar exceções
useExceptionByDate(date); // Buscar por data

// Verificação
useControlDashboard(); // Dashboard tempo real
useWeekCheck(year, week); // Verificar semana
useClubCheck(clubId, year, week); // Verificar clube
```

---

## 🎛️ Sistema de Filtros

### Filtros Globais (aplicados a todos)

```typescript
year: number; // Ano específico
startDate: string; // Data inicial
endDate: string; // Data final
groupBy: 'day' | 'week' | 'month' | 'year'; // Agrupamento
```

### Filtros Geográficos

```typescript
city: string; // Cidade
state: string; // Estado (UF)
district: string; // Bairro
```

### Filtros Demográficos

```typescript
gender: 'M' | 'F'; // Gênero
minAge: number; // Idade mínima
maxAge: number; // Idade máxima
ageGroup: string; // Faixa etária
```

### Filtros de Entidade

```typescript
clubId: string; // Clube específico
teacherId: string; // Professor específico
coordinatorId: string; // Coordenador ⭐
weekday: string; // Dia da semana
```

### Filtros de Atividade

```typescript
minPagelas: number; // Mínimo de pagelas
minPresenceRate: number; // Taxa mínima (%)
minEngagementScore: number; // Score mínimo
hasDecision: boolean; // Tem decisão?
decisionType: 'ACCEPTED' | 'RECONCILED';
isActive: boolean; // Ativo (30 dias)
```

### Paginação e Ordenação

```typescript
page: number; // Página atual
limit: number; // Itens por página (max: 100)
sortBy: string; // Campo de ordenação
sortOrder: 'ASC' | 'DESC'; // Ordem
```

---

## 💡 Exemplos de Uso

### 1. Coordenador vê seus clubes

```typescript
const { data } = useClubs({
  coordinatorId: userId,
  sortBy: 'performanceScore',
  sortOrder: 'DESC',
});
```

### 2. Ver crianças de um clube

```typescript
const { data } = useChildren({
  clubId: selectedClub,
  isActive: true,
  page: 1,
  limit: 20,
});
```

### 3. Análise de frequência de clube

```typescript
const { data } = useClubAttendance(clubId, {
  year: 2024,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

// Retorna:
// - weeksWithPagela, weeksMissing
// - missingWeeks com datas específicas
// - alerts automáticos
// - timeline semana a semana
```

### 4. Ver status semanal de todos clubes

```typescript
const { data } = useWeeklyAttendance({
  year: 2024,
  week: 45,
});

// Retorna:
// - Lista de todos os clubes
// - Status: ok, missing, vacation, inactive
// - Summary com taxas
```

### 5. Verificar períodos letivos GLOBAIS

```typescript
const { data: periods } = useAcademicPeriods();
// Retorna todos os períodos cadastrados

const { data: period2024 } = usePeriodByYear(2024);
// Retorna período específico de 2024
```

### 6. Verificar exceções GLOBAIS

```typescript
const { data: exceptions } = useWeekdayExceptions({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
// Retorna todas as exceções do ano

const { data: exception } = useExceptionByDate('2024-11-15');
// Retorna exceção específica
```

---

## 🎨 Componentes Principais

### StatisticsPage

- Gerencia tabs e filtros globais
- Integra todos os sub-componentes
- Estado de filtros compartilhado

### ChildrenListView ⭐

- Tabela rica com 24 filtros
- Paginação e ordenação
- Engagement score visual
- Chips de status

### ClubsListView ⭐

- Performance score com cores
- Medals para top 3
- Filtro por coordenador
- Distribuições geográficas

### TeachersListView ⭐

- Effectiveness score
- Crianças ensinadas
- Decisões alcançadas
- Filtros múltiplos

### ClubAttendanceTimeline ⭐

- Timeline anual semana a semana
- Detecção automática de faltantes
- Alertas coloridos
- Progress bar de completude

### WeeklyAttendanceGrid ⭐

- Grid de todos os clubes
- Status visual (ok/missing/vacation)
- Navegação de semanas
- Summary cards

---

## 🚀 Como Funciona a Integração

### Fluxo Completo

```
1. Admin cadastra Período Letivo GLOBAL
   POST /club-control/periods
   {
     "year": 2024,
     "startDate": "2024-02-05",
     "endDate": "2024-12-15"
   }
   ✅ Vale para TODOS os clubes

2. Admin cadastra Exceções GLOBAIS
   POST /club-control/exceptions
   {
     "exceptionDate": "2024-11-15",
     "reason": "Feriado Nacional",
     "isRecurrent": true
   }
   ✅ Afeta TODOS os clubes daquele dia da semana

3. Estatísticas respeitam configurações globais
   GET /statistics/attendance/club/uuid?year=2024
   ✅ Considera apenas semanas ativas
   ✅ Ignora semanas com exceções
   ✅ Gera alertas para semanas faltantes

4. Painel de Controle mostra tempo real
   GET /club-control/dashboard
   ✅ Status atual de cada clube
   ✅ Crianças sem pagela
   ✅ Alertas imediatos
```

---

## 📊 Regras de Negócio Implementadas

### 1. Períodos Letivos (GLOBAL) ⭐ CRÍTICO v2.4.0

- ✅ Um período por ano para TODOS
- ✅ **Semanas fora do período NÃO geram alertas**
- ✅ **Métricas ajustadas**: `weeksExpected` = só semanas ativas
- ✅ **Taxa de frequência correta**: sobre período letivo, não ano inteiro
- ✅ Primeira semana = "Semana 1" do ano letivo
- ✅ Estatísticas só consideram período ativo

**Impacto:**

- Antes: `attendanceRate = 73%` (38 pagelas em 52 semanas do ano)
- Agora: `attendanceRate = 95%` (38 pagelas em 40 semanas do período) ✅

### 2. Exceções (GLOBAL) ⭐ CRÍTICO v2.4.0

- ✅ Uma exceção por data para TODOS
- ✅ Se 15/11 é quarta, TODOS clubes de quarta não funcionam
- ✅ `isRecurrent=true` para feriados anuais
- ✅ **Exceções NÃO contam** como semanas faltantes
- ✅ **Estatísticas ignoram** exceções no `weeksExpected`
- ✅ **Não penalizam** clubes em feriados/eventos

**Exemplo:**

- Período: 40 semanas ativas
- Exceções: 5 feriados
- `weeksExpected = 35` (40 - 5 exceções) ✅

### 3. Funcionamento Semanal

- ✅ Clubes funcionam 1x por semana
- ✅ Segunda a Sábado (NUNCA domingo)
- ✅ Semana sem pagela = "semana furada"
- ✅ Detectado automaticamente pelo sistema

### 4. Sistema de Alertas

- ✅ **Info**: Informações gerais
- ✅ **Warning**: 1-3 semanas faltantes
- ✅ **Critical**: 4+ semanas ou < 50% frequência
- ✅ Gerados automaticamente

### 5. Status de Crianças ⭐ CRÍTICO v2.6.0

- ✅ **Apenas crianças ATIVAS** (`isActive = true`) são listadas nas estatísticas
- ✅ Crianças inativas (`isActive = false`) **NUNCA** aparecem nas estatísticas
- ✅ Isso garante que apenas crianças realmente ativas sejam consideradas
- ✅ Evita que crianças que saíram do clube gerem indicadores negativos incorretos

**Impacto:**

- Antes: Estatísticas incluíam crianças inativas (dados incorretos)
- Agora: Apenas crianças ativas são consideradas (dados precisos) ✅

### 6. Data de Entrada (joinedAt) ⭐ CRÍTICO v2.6.0

- ✅ Crianças que entraram no meio do ano **NÃO** são contabilizadas em semanas anteriores
- ✅ Semanas são consideradas apenas para crianças que já tinham entrado
- ✅ Se `joinedAt` é NULL, considera como se sempre estivesse no clube
- ✅ Lógica aplicada automaticamente na análise de frequência

**Exemplo:**

- Criança entrou em 15/06/2024
- Verificação na semana de 10/05/2024 (antes da entrada)
- ✅ Criança **NÃO** aparece na lista de faltantes
- ✅ Criança **NÃO** gera indicador negativo
- ✅ Total de crianças considera apenas as que já tinham entrado

**Impacto:**

- Antes: Crianças eram contabilizadas desde o início do ano (injusto)
- Agora: Apenas semanas após a entrada são consideradas (justo) ✅

---

## 🎯 Métricas Calculadas

### Engagement Score (Crianças)

```
= (presença × 0.30) + (meditação × 0.35) + (versículo × 0.35)
Faixa: 0-100
```

### Performance Score (Clubes)

```
= (presença × 0.30) + (meditação × 0.30) + (atividade × 0.20) + (decisões × 0.20)
Faixa: 0-100
```

### Effectiveness Score (Professores)

```
= (presença × 0.40) + (meditação × 0.30) + (decisões × 0.30)
Faixa: 0-100
```

### Attendance Rate (Clubes)

```
= (semanas com pagela / semanas esperadas) × 100
Considera períodos e exceções GLOBAIS
```

---

## 🛠️ Tecnologias Utilizadas

```
✅ React 18
✅ TypeScript 5
✅ React Query (TanStack Query)
✅ Material-UI (MUI)
✅ Recharts
✅ Dayjs
✅ Axios
```

---

## 📚 Documentação Adicional

- `INTEGRATION_GUIDE.md` - Guia completo de integração
- `RICH_CHARTS_GUIDE.md` - Detalhes sobre gráficos
- `COMPLETE_IMPLEMENTATION.md` - Implementação completa
- `VISUAL_GUIDE.md` - Guia visual
- `../club-control/README.md` - Documentação do Módulo de Controle

---

## 🎉 Status do Módulo

```
████████████████████████████████████████ 100%

✅ 11 Endpoints Funcionais
✅ 29+ Tipos de Filtros
✅ 9 Hooks React Query
✅ 18 Componentes
✅ Integração com Período Letivo GLOBAL ⭐ v2.4.0
✅ Paginação Completa ⭐ v2.5.0
✅ Status de Crianças e Data de Entrada ⭐ v2.6.0
✅ Respeita Períodos e Exceções
✅ Métricas Ajustadas (weeksExpected) ⭐ v2.4.0
✅ Taxa de Frequência Correta ⭐ v2.4.0
✅ Apenas Crianças Ativas Consideradas ⭐ v2.6.0
✅ Sistema de Alertas Inteligente
✅ Zero Erros de Lint
✅ Documentação Completa
✅ Pronto para Produção
```

---

**Desenvolvido com 💙 para o Clubinho NIB**

_Transformando dados em insights, insights em ações!_ 🚀

---

**Versão**: 2.6.0  
**Status**: ✅ 100% SINCRONIZADO COM BACKEND v2.6.0  
**Integração**: ⚡ Estatísticas + Controle + Período Letivo = Gestão Completa  
**Novo v2.6.0**: ⭐ Status de crianças e data de entrada implementados  
**Crítico v2.6.0**: ⭐ Apenas crianças ativas são consideradas, semanas anteriores à entrada não são contabilizadas  
**Crítico v2.4.0**: ⭐ Métricas ajustadas para respeitar período letivo  
**Data**: 15/11/2024
