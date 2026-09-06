import { FormControl, Grid2, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import {
  LEVEL_FILTER_OPTIONS,
  OBSERVABILITY_AUDIT_TEST_IDS,
  OUTCOME_FILTER_OPTIONS,
  ROLE_FILTER_OPTIONS,
  SOURCE_TYPE_FILTER_OPTIONS,
} from '../constants';
import type { AuditFilters, FilterOption, ObservabilityFilters } from '../types';
import { TOOLBAR_FIELD_SX } from './RecordsToolbar';

interface OptionSelectProps {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<FilterOption>;
  onChange: (value: string) => void;
}

function OptionSelect({ id, label, value, options, onChange }: OptionSelectProps) {
  const labelId = `${id}-label`;
  return (
    <FormControl data-testid={`${id}-control`} fullWidth size="small" sx={TOOLBAR_FIELD_SX}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={label}
        value={value}
        onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
        inputProps={{ 'aria-label': label }}
      >
        {options.map((option) => (
          <MenuItem key={option.value || 'all'} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface ObservabilityRecordFiltersProps {
  filters: ObservabilityFilters;
  onChange: (next: ObservabilityFilters) => void;
}

/** Filtros aceitos por `GET /log-records/observability`. */
export function ObservabilityRecordFilters({ filters, onChange }: ObservabilityRecordFiltersProps) {
  return (
    <Grid2 data-testid={OBSERVABILITY_AUDIT_TEST_IDS.observabilityFilters} container spacing={1.5}>
      <Grid2 size={{ xs: 12, sm: 4 }}>
        <OptionSelect
          id="observability-level"
          label="Nível"
          value={filters.level}
          options={LEVEL_FILTER_OPTIONS}
          onChange={(level) => onChange({ ...filters, level })}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 4 }}>
        <TextField
          id="observability-error-code"
          label="Código do erro"
          value={filters.errorCode}
          onChange={(event) => onChange({ ...filters, errorCode: event.target.value })}
          placeholder="Ex.: INT_9001"
          fullWidth
          size="small"
          slotProps={{ htmlInput: { 'aria-label': 'Código do erro', spellCheck: false } }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 4 }}>
        <OptionSelect
          id="observability-source-type"
          label="Origem"
          value={filters.sourceType}
          options={SOURCE_TYPE_FILTER_OPTIONS}
          onChange={(sourceType) => onChange({ ...filters, sourceType })}
        />
      </Grid2>
    </Grid2>
  );
}

interface AuditRecordFiltersProps {
  filters: AuditFilters;
  onChange: (next: AuditFilters) => void;
}

/** Filtros aceitos por `GET /log-records/audit`. */
export function AuditRecordFilters({ filters, onChange }: AuditRecordFiltersProps) {
  return (
    <Grid2 data-testid={OBSERVABILITY_AUDIT_TEST_IDS.auditFilters} container spacing={1.5}>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          id="audit-actor-id"
          label="ID do ator"
          value={filters.actorId}
          onChange={(event) => onChange({ ...filters, actorId: event.target.value })}
          placeholder="UUID do usuário"
          fullWidth
          size="small"
          slotProps={{ htmlInput: { 'aria-label': 'ID do ator', spellCheck: false } }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <OptionSelect
          id="audit-actor-role"
          label="Papel"
          value={filters.actorRole}
          options={ROLE_FILTER_OPTIONS}
          onChange={(actorRole) => onChange({ ...filters, actorRole })}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <OptionSelect
          id="audit-outcome"
          label="Resultado"
          value={filters.outcome}
          options={OUTCOME_FILTER_OPTIONS}
          onChange={(outcome) => onChange({ ...filters, outcome })}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 8 }}>
        <TextField
          id="audit-action-name"
          label="Ação"
          value={filters.actionName}
          onChange={(event) => onChange({ ...filters, actionName: event.target.value })}
          placeholder="Ex.: ClubsModule.ClubsController.create"
          fullWidth
          size="small"
          slotProps={{ htmlInput: { 'aria-label': 'Ação', spellCheck: false } }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <OptionSelect
          id="audit-source-type"
          label="Origem"
          value={filters.sourceType}
          options={SOURCE_TYPE_FILTER_OPTIONS}
          onChange={(sourceType) => onChange({ ...filters, sourceType })}
        />
      </Grid2>
    </Grid2>
  );
}
