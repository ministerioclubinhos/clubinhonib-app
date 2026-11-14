import {
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import { OBSERVABILITY_AUDIT_MESSAGES, RECORDS_LIMIT_OPTIONS } from '../constants';
import { paginationSummary } from '../utils';

interface RecordsPaginationProps {
  testId: string;
  /** Nome acessível do grupo, ex.: "Paginação de auditoria". */
  label: string;
  page: number;
  pageCount: number;
  total: number;
  /** Itens por página escolhidos no seletor. */
  limit: number;
  /** Limite aplicado pela API na resposta atual; o resumo conta por ele. */
  appliedLimit: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

/**
 * Paginação numerada com total.
 *
 * Mobile first: no celular mostra o resumo ("1–25 de 240"), os controles de
 * página compactos e o seletor de itens por página empilhados; de `sm` para
 * cima ficam na mesma linha.
 */
export default function RecordsPagination({
  testId,
  label,
  page,
  pageCount,
  total,
  limit,
  appliedLimit,
  loading,
  onPageChange,
  onLimitChange,
}: RecordsPaginationProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      data-testid={testId}
      component="nav"
      aria-label={label}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mt: 2 }}
    >
      <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography
          component="span"
          variant="body2"
          data-testid={`${testId}-total`}
          sx={{ display: 'block', fontWeight: 700, color: 'text.primary' }}
        >
          {OBSERVABILITY_AUDIT_MESSAGES.totalLabel}: {OBSERVABILITY_AUDIT_MESSAGES.total(total)}
        </Typography>
        {paginationSummary(page, appliedLimit > 0 ? appliedLimit : limit, total)}
        {pageCount > 0 ? ` · Página ${page} de ${pageCount}` : ''}
      </Typography>

      <Pagination
        count={Math.max(pageCount, 1)}
        page={Math.min(page, Math.max(pageCount, 1))}
        onChange={(_event, next) => onPageChange(next)}
        disabled={loading || pageCount <= 1}
        siblingCount={compact ? 0 : 1}
        boundaryCount={1}
        showFirstButton={!compact}
        showLastButton={!compact}
        size={compact ? 'medium' : 'large'}
        shape="rounded"
        getItemAriaLabel={(type, pageNumber) => {
          if (type === 'previous') return OBSERVABILITY_AUDIT_MESSAGES.previous;
          if (type === 'next') return OBSERVABILITY_AUDIT_MESSAGES.next;
          if (type === 'first') return 'Primeira página';
          if (type === 'last') return 'Última página';
          return `Página ${pageNumber}`;
        }}
        sx={{ alignSelf: 'center', '& .MuiPaginationItem-root': { minWidth: 44, minHeight: 44 } }}
      />

      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiInputBase-root': { minHeight: 44 } }}>
        <InputLabel id={`${testId}-limit-label`}>{OBSERVABILITY_AUDIT_MESSAGES.itemsPerPage}</InputLabel>
        <Select
          labelId={`${testId}-limit-label`}
          id={`${testId}-limit`}
          label={OBSERVABILITY_AUDIT_MESSAGES.itemsPerPage}
          value={String(limit)}
          onChange={(event: SelectChangeEvent<string>) => onLimitChange(Number(event.target.value))}
          disabled={loading}
          inputProps={{ 'aria-label': OBSERVABILITY_AUDIT_MESSAGES.itemsPerPage }}
        >
          {RECORDS_LIMIT_OPTIONS.map((option) => (
            <MenuItem key={option} value={String(option)}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
