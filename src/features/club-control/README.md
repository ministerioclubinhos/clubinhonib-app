# 🎯 Módulo de Controle - Clubinho NIB

> **Sistema GLOBAL de Controle e Verificação de Pagelas**  
> Versão 2.0 | Estrutura GLOBAL | Atualizado em 06/11/2024

---

## ⚠️ ESTRUTURA GLOBAL - IMPORTANTE

Este módulo funciona com **configurações GLOBAIS**, não por clube:

### 📅 Período Letivo GLOBAL
- **Um único período por ano** para TODOS os clubes
- Exemplo: Se 2024 vai de 05/02 a 15/12, vale para TODOS
- A primeira semana dentro do período é a "semana 1" do ano letivo

### 📌 Exceções GLOBAIS  
- **Uma exceção por data** afeta TODOS os clubes daquele dia da semana
- Exemplo: Feriado em 15/11 (quarta) → TODOS os clubes de quarta não funcionam
- Campo `isRecurrent`: exceções que se repetem todo ano (feriados nacionais)

### 🎯 Benefícios
- ✅ **Simplicidade**: Cadastra uma vez, vale para todos  
- ✅ **Consistência**: Todos seguem o mesmo calendário  
- ✅ **Manutenção**: Muito mais fácil gerenciar  
- ✅ **Escalabilidade**: Funciona com qualquer quantidade de clubes

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Estrutura de Arquivos](#-estrutura-de-arquivos)
4. [API Endpoints](#-api-endpoints)
5. [Componentes](#-componentes)
6. [Como Usar](#-como-usar)

---

## 🎯 Visão Geral

O **Módulo de Controle** é um sistema para verificação em tempo real de pagelas, garantindo que **nenhuma criança fique sem ser atendida**.

### Objetivos
- ✅ Verificar se TODAS as crianças de cada clube receberam pagela
- ✅ Identificar clubes e crianças sem registro
- ✅ Gerenciar período letivo GLOBAL (um por ano)
- ✅ Cadastrar exceções GLOBAIS (feriados, eventos, etc.)
- ✅ Monitorar em tempo real a situação semanal

---

## ⭐ Funcionalidades

### 1. **Painel de Controle** 📊
- Verificação semanal de todos os clubes
- Navegação entre semanas
- Cards KPI:
  - Clubes OK (100% completos)
  - Clubes Parciais (algumas crianças faltando)
  - Clubes Faltando (0% pagelas)
  - Completude Geral (%)
- Tabela expansível com detalhes
- Lista de crianças faltantes
- Alertas críticos

### 2. **Gestão de Período Letivo GLOBAL** 📅
- **UM período por ano para TODOS os clubes**
- Cadastro com:
  - Ano de referência
  - Data de início
  - Data de término
  - Descrição
- Visualização de períodos cadastrados
- Exclusão de períodos

### 3. **Gestão de Exceções GLOBAIS** 🚫
- **UMA exceção por data para TODOS os clubes**
- Cadastro com:
  - Data da exceção
  - Tipo (Feriado, Evento, Férias, Manutenção, Outro)
  - Motivo
  - `isRecurrent`: Se repete todo ano
  - Observações
- Quick-add de feriados nacionais
- Visualização de exceções

---

## 📁 Estrutura de Arquivos

```
src/features/club-control/
├── api.ts                           # API service (ESTRUTURA GLOBAL)
├── hooks.ts                         # React Query hooks
├── ClubControlPage.tsx              # Página principal
├── index.ts                         # Exports
├── components/
│   ├── ControlDashboard.tsx         # Painel de controle
│   ├── PeriodManagement.tsx         # Gestão GLOBAL de períodos
│   ├── ExceptionManagement.tsx      # Gestão GLOBAL de exceções
│   ├── ClubCheckDetail.tsx          # Modal de detalhes
│   └── index.ts                     # Exports
└── README.md                        # Este arquivo
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/club-control
```

### Resumo (9 Endpoints - ESTRUTURA GLOBAL)

#### Períodos GLOBAIS
```typescript
POST   /club-control/periods              // Criar período GLOBAL
GET    /club-control/periods              // Listar todos os períodos
GET    /club-control/periods/:year        // Buscar período por ano
PATCH  /club-control/periods/:id          // Atualizar período
DELETE /club-control/periods/:id          // Deletar período
```

#### Exceções GLOBAIS
```typescript
POST   /club-control/exceptions           // Criar exceção GLOBAL
GET    /club-control/exceptions           // Listar exceções (com filtros)
GET    /club-control/exceptions/:date     // Buscar exceção por data
PATCH  /club-control/exceptions/:id       // Atualizar exceção
DELETE /club-control/exceptions/:id       // Deletar exceção
```

#### Verificação (por clube)
```typescript
GET /club-control/check/club/:clubId?year=2024&week=45  // Verificar clube
GET /club-control/check/week?year=2024&week=45          // Verificar todos
GET /club-control/dashboard                             // Dashboard atual
```

---

## 🧩 Componentes

### 1. `ControlDashboard`
**Painel de verificação semanal (permanece igual)**

**Features:**
- Navegação de semanas
- Cards KPI animados
- Tabela expansível
- Alertas críticos
- Lista de crianças faltantes
- Auto-refresh (2 minutos)

---

### 2. `PeriodManagement` ⚡ ATUALIZADO
**Gestão GLOBAL de períodos (SEM seleção de clube)**

**Mudanças:**
- ❌ Removido: Seletor de clube
- ✅ Adicionado: Alerta informativo sobre estrutura GLOBAL
- ✅ Adicionado: Chip "ATUAL" para ano corrente
- ✅ Adicionado: Aviso ao cadastrar/deletar

**Features:**
- Formulário de cadastro global
- Lista de períodos cadastrados
- Validação de datas
- Exclusão com confirmação

---

### 3. `ExceptionManagement` ⚡ ATUALIZADO
**Gestão GLOBAL de exceções (SEM seleção de clube)**

**Mudanças:**
- ❌ Removido: Seletor de clube
- ✅ Adicionado: Campo `isRecurrent` (checkbox)
- ✅ Adicionado: Tipo "Férias"
- ✅ Adicionado: Alerta informativo sobre estrutura GLOBAL
- ✅ Adicionado: Chip "Recorrente" na listagem
- ✅ Adicionado: Indicador de dia da semana

**Features:**
- Formulário de cadastro global
- Quick-add de feriados
- Lista de exceções
- Chips coloridos por tipo
- Exclusão com confirmação

---

## 📖 Como Usar

### Para Administradores

#### 1. **Início do Ano - Configurar Período Letivo**
```
1. Acesse "Períodos Letivos"
2. Preencha:
   - Ano: 2024
   - Início: 05/02/2024
   - Fim: 15/12/2024
   - Descrição: "Ano Letivo 2024"
3. Clique em "Cadastrar Período Global"
4. ✅ Período válido para TODOS os clubes!
```

#### 2. **Cadastrar Feriados e Exceções**
```
1. Acesse "Exceções"
2. Use Quick-Add para feriados comuns OU
3. Preencha manualmente:
   - Data: 15/11/2024
   - Tipo: Feriado
   - Motivo: "Proclamação da República"
   - ✅ Recorrente: Sim (para repetir todo ano)
4. Clique em "Cadastrar Exceção Global"
5. ✅ Exceção válida para TODOS os clubes!
```

---

### Para Coordenadores

#### 1. **Segunda-feira de Manhã**
```
1. Acesse "Painel de Controle"
2. Veja os cards KPI no topo
3. Identifique clubes em amarelo/vermelho
4. Clique nos clubes para ver detalhes
5. Veja lista de crianças sem pagela
6. Entre em contato com professores
```

#### 2. **Navegação de Semanas**
```
- Use botões < > para navegar
- "Ir para Atual" volta para semana corrente
- Chip "ATUAL" indica semana em curso
- Refresh manual disponível
```

---

## 🎨 Mudanças Visuais

### PeriodManagement
```
ANTES:
┌─────────────────────────┐
│ Selecione um Clube      │  ← REMOVIDO
│ [Dropdown de clubes]    │
└─────────────────────────┘

DEPOIS:
┌─────────────────────────┐
│ ⚠️ ESTRUTURA GLOBAL     │  ← NOVO
│ Um período por ano      │
│ válido para TODOS       │
└─────────────────────────┘
```

### ExceptionManagement
```
ANTES:
┌─────────────────────────┐
│ Selecione um Clube      │  ← REMOVIDO
│ [Dropdown de clubes]    │
└─────────────────────────┘

DEPOIS:
┌─────────────────────────┐
│ ⚠️ ESTRUTURA GLOBAL     │  ← NOVO
│ Uma exceção por data    │
│ afeta TODOS os clubes   │
│                         │
│ ☑ Recorrente            │  ← NOVO CAMPO
└─────────────────────────┘
```

---

## 🔧 Tipos TypeScript Atualizados

### Academic Period (GLOBAL)
```typescript
interface AcademicPeriod {
  id: string;
  year: number;              // SEM clubId!
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}
```

### Weekday Exception (GLOBAL)
```typescript
interface WeekdayException {
  id: string;
  exceptionDate: string;     // SEM clubId!
  reason: string;
  type: 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other';
  isRecurrent: boolean;      // NOVO CAMPO
  notes?: string;
  isActive: boolean;
}
```

---

## 📊 Tabelas do Banco de Dados

### academic_periods
```sql
CREATE TABLE academic_periods (
  id VARCHAR(36) PRIMARY KEY,
  year SMALLINT UNSIGNED NOT NULL UNIQUE,  -- SEM club_id
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  description VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE KEY UQ_academic_period_year (year)
);
```

### weekday_exceptions
```sql
CREATE TABLE weekday_exceptions (
  id VARCHAR(36) PRIMARY KEY,
  exceptionDate DATE NOT NULL UNIQUE,  -- SEM club_id
  reason VARCHAR(255) NOT NULL,
  type ENUM('holiday', 'event', 'maintenance', 'vacation', 'other'),
  isRecurrent BOOLEAN DEFAULT true,    -- NOVO CAMPO
  notes TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE KEY UQ_weekday_exception_date (exceptionDate)
);
```

---

## 🎯 Regras de Negócio

### 1. Período Letivo
- ✅ **UM período por ano** para TODOS os clubes
- ✅ Primeira semana do período = "Semana 1" do ano letivo
- ✅ Fora do período não há monitoramento

### 2. Exceções
- ✅ **UMA exceção por data** afeta TODOS os clubes
- ✅ Se 15/11 é quarta, TODOS os clubes de quarta não funcionam
- ✅ `isRecurrent=true` → exceção se repete todo ano
- ✅ Exceções não afetam estatísticas

### 3. Verificação
- ✅ Verificação em tempo real por clube
- ✅ Lista de crianças sem pagela
- ✅ Status: OK, Parcial, Faltando, Exceção
- ✅ Sem alertas automáticos (manual)

---

## ✅ Checklist de Implementação

```
✅ API atualizada para estrutura GLOBAL
✅ Hooks refatorados (sem clubId)
✅ PeriodManagement refatorado
✅ ExceptionManagement refatorado
✅ Campo isRecurrent implementado
✅ Tipo vacation adicionado
✅ Alertas informativos adicionados
✅ Quick-add de feriados atualizado
✅ Chips de recorrência adicionados
✅ Documentação atualizada
✅ Zero erros de lint
```

---

## 🎉 Benefícios da Estrutura GLOBAL

### Antes (Por Clube)
```
❌ Cadastrar período para cada clube (12+ cadastros)
❌ Cadastrar feriado para cada clube (12+ × 10 = 120+ cadastros)
❌ Difícil manter consistência
❌ Risco de esquecer algum clube
❌ Muito trabalho manual
```

### Depois (GLOBAL)
```
✅ Cadastrar período UMA vez (1 cadastro)
✅ Cadastrar feriado UMA vez (10 cadastros)
✅ Garantia de consistência
✅ Impossível esquecer clube
✅ Muito menos trabalho
```

---

## 📚 Documentação Adicional

- `LAYOUT_OPTIMIZATION.md` - Detalhes de layout
- `VISUAL_IMPROVEMENTS.md` - Antes/depois visual
- `IMPLEMENTATION_COMPLETE.md` - Status de implementação

---

## 🚀 Próximos Passos

1. Testar cadastro de períodos GLOBAIS
2. Testar cadastro de exceções GLOBAIS
3. Verificar funcionamento do campo `isRecurrent`
4. Testar quick-add de feriados
5. Validar estrutura no banco de dados

---

**Desenvolvido com 💙 para o Clubinho NIB**

*Garantindo que nenhuma criança fique sem ser atendida!* 🎯

---

**Versão**: 2.0  
**Status**: ✅ 100% SINCRONIZADO COM API  
**Estrutura**: ⚡ GLOBAL (sem clubId)  
**Data**: 06/11/2024
