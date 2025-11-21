# 🔗 Guia de Integração - Estatísticas

Este guia mostra como integrar os dados de estatísticas em outras partes da aplicação.

## Importando Componentes

### Opção 1: Importar diretamente
```typescript
import { OverviewCards, PagelasTimeSeriesChart } from '@/features/statistics/components';
```

### Opção 2: Usar o index
```typescript
import { OverviewCards, PagelasTimeSeriesChart } from '@/features/statistics';
```

## Usando Hooks em Componentes Personalizados

### Exemplo 1: Card de Resumo Simples

```typescript
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useOverview } from '@/features/statistics';

export const SimpleOverviewCard: React.FC = () => {
  const { data, isLoading, error } = useOverview();

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao carregar</Typography>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Total de Crianças</Typography>
      <Typography variant="h3">{data?.summary.totalChildren}</Typography>
    </Paper>
  );
};
```

### Exemplo 2: Widget com Filtros

```typescript
import React from 'react';
import { Box, TextField } from '@mui/material';
import { usePagelasChartData } from '@/features/statistics';

export const FilteredStatsWidget: React.FC = () => {
  const [year, setYear] = React.useState(2024);
  const { data, isLoading } = usePagelasChartData({ year, groupBy: 'month' });

  return (
    <Box>
      <TextField
        type="number"
        label="Ano"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      />
      {data && (
        <Box>
          <p>Total de registros: {data.timeSeries.total.length}</p>
        </Box>
      )}
    </Box>
  );
};
```

### Exemplo 3: Dashboard do Coordenador

```typescript
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { useInsights, usePagelasChartData } from '@/features/statistics';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';

export const CoordinatorDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Filtrar apenas pelos clubes do coordenador
  const { data: insights } = useInsights({
    coordinatorId: user?.id,
    year: new Date().getFullYear(),
  });

  const { data: pagelas } = usePagelasChartData({
    coordinatorId: user?.id,
    groupBy: 'month',
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Meu Dashboard</Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Meus Clubes</Typography>
          {insights?.clubRankings.map((club) => (
            <Box key={club.clubId}>
              <Typography>
                Clube #{club.clubNumber}: {club.performanceScore.toFixed(1)}% performance
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Atividade Recente</Typography>
          {pagelas?.timeSeries.total.slice(-3).map((item) => (
            <Typography key={item.date}>
              {item.date}: {item.value} pagelas
            </Typography>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};
```

## Integrando com React Query

Se você já usa React Query em outra parte da aplicação, pode compartilhar o queryClient:

```typescript
// Em App.tsx ou um provider superior
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Seus componentes */}
    </QueryClientProvider>
  );
}
```

## Chamadas Diretas à API

Se precisar fazer chamadas diretas sem usar hooks:

```typescript
import { statisticsApi } from '@/features/statistics';

async function loadStatistics() {
  try {
    const response = await statisticsApi.getOverview();
    console.log(response.data);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## Tipos TypeScript

Todos os tipos estão disponíveis para importação:

```typescript
import type {
  StatisticsFilters,
  PagelasChartData,
  OverviewData,
  TopEngagedChild,
  ClubRanking,
} from '@/features/statistics';

const filters: StatisticsFilters = {
  year: 2024,
  gender: 'F',
  minAge: 6,
  maxAge: 12,
};
```

## Customizando Componentes

Todos os componentes aceitam props de filtros:

```typescript
import { PagelasTimeSeriesChart } from '@/features/statistics';

export const CustomChart: React.FC = () => {
  return (
    <PagelasTimeSeriesChart
      filters={{
        year: 2024,
        city: 'São Paulo',
        gender: 'F',
      }}
    />
  );
};
```

## Criando Novos Gráficos

Use Recharts para criar gráficos personalizados:

```typescript
import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { usePagelasChartData } from '@/features/statistics';

export const CustomPieChart: React.FC = () => {
  const { data } = usePagelasChartData({ year: 2024 });

  if (!data) return null;

  const chartData = data.byGender.map((item) => ({
    name: item.gender === 'M' ? 'Masculino' : 'Feminino',
    value: item.total,
  }));

  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};
```

## Integração com Redux

Se precisar armazenar dados de estatísticas no Redux:

```typescript
// Em um slice do Redux
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statisticsApi } from '@/features/statistics';

export const fetchOverviewStats = createAsyncThunk(
  'stats/fetchOverview',
  async () => {
    const response = await statisticsApi.getOverview();
    return response.data;
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: { overview: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.loading = false;
      });
  },
});

export default statsSlice.reducer;
```

## Performance

### Cache
Os dados são cacheados por 5 minutos. Para cache mais longo:

```typescript
const { data } = usePagelasChartData(filters, {
  staleTime: 10 * 60 * 1000, // 10 minutos
});
```

### Lazy Loading
Carregue componentes de estatísticas sob demanda:

```typescript
import React, { lazy, Suspense } from 'react';

const StatisticsPage = lazy(() => import('@/features/statistics/StatisticsPage'));

export const LazyStats: React.FC = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <StatisticsPage />
  </Suspense>
);
```

## Exemplos de Casos de Uso

### 1. Widget no Dashboard Principal
Mostrar resumo de estatísticas na home do admin.

### 2. Badge de Notificação
Exibir número de crianças ativas no menu.

### 3. Relatórios Personalizados
Criar relatórios específicos por coordenador ou professor.

### 4. Análise Comparativa
Comparar performance entre diferentes clubes ou períodos.

### 5. Alertas Automáticos
Notificar quando métricas caem abaixo de threshold.

## Troubleshooting

### Dados não atualizam
```typescript
// Force refetch
const { refetch } = usePagelasChartData(filters);

// Em um botão
<Button onClick={() => refetch()}>Atualizar</Button>
```

### Erro de CORS
Configure o proxy no `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/statistics': 'http://localhost:3000',
    },
  },
});
```

### TypeScript Errors
Certifique-se de que todos os tipos estão sendo importados de `@/features/statistics/api`.

## Recursos Adicionais

- [Documentação Recharts](https://recharts.org/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Material-UI Components](https://mui.com/)

---

**Dúvidas?** Consulte o código-fonte em `src/features/statistics/` ou a documentação da API.

