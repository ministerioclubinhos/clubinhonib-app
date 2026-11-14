import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import {
  ACTOR_NAME_MAX_LENGTH,
  OBSERVABILITY_AUDIT_MESSAGES,
  LEVEL_FILTER_OPTIONS,
  OBSERVABILITY_AUDIT_TEST_IDS,
  OUTCOME_FILTER_OPTIONS,
  ROLE_FILTER_OPTIONS,
  SOURCE_TYPE_FILTER_OPTIONS,
} from '../constants';
import type { AuditFilters, FilterOption, ObservabilityFilters } from '../types';
import {
  filterFieldError,
  validActionName,
  validActorName,
  validErrorCode,
  validUuid,
} from '../utils';
import { FILTER_CELL_SX, TOOLBAR_FIELD_SX } from './RecordsToolbar';

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
    <Box
      data-testid={OBSERVABILITY_AUDIT_TEST_IDS.observabilityFilters}
      sx={{ display: 'contents' }}
    >
      <Box sx={FILTER_CELL_SX}>
        <OptionSelect
          id="observability-level"
          label="Nível"
          value={filters.level}
          options={LEVEL_FILTER_OPTIONS}
          onChange={(level) => onChange({ ...filters, level })}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <TextField
          id="observability-error-code"
          label="Código do erro"
          value={filters.errorCode}
          onChange={(event) => onChange({ ...filters, errorCode: event.target.value })}
          placeholder="Ex.: INT_9001"
          error={Boolean(
            filterFieldError(
              filters.errorCode,
              validErrorCode(filters.errorCode),
              OBSERVABILITY_AUDIT_MESSAGES.invalidErrorCode
            )
          )}
          helperText={
            filterFieldError(
              filters.errorCode,
              validErrorCode(filters.errorCode),
              OBSERVABILITY_AUDIT_MESSAGES.invalidErrorCode
            ) || undefined
          }
          fullWidth
          size="small"
          slotProps={{
            htmlInput: { 'aria-label': 'Código do erro', spellCheck: false },
          }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <OptionSelect
          id="observability-source-type"
          label="Origem"
          value={filters.sourceType}
          options={SOURCE_TYPE_FILTER_OPTIONS}
          onChange={(sourceType) => onChange({ ...filters, sourceType })}
        />
      </Box>
    </Box>
  );
}

interface AuditRecordFiltersProps {
  filters: AuditFilters;
  onChange: (next: AuditFilters) => void;
}

/** Filtros aceitos por `GET /log-records/audit`. */
export function AuditRecordFilters({ filters, onChange }: AuditRecordFiltersProps) {
  return (
    <Box data-testid={OBSERVABILITY_AUDIT_TEST_IDS.auditFilters} sx={{ display: 'contents' }}>
      <Box sx={FILTER_CELL_SX}>
        <TextField
          id="audit-actor-name"
          label="Nome do usuário"
          value={filters.actorName}
          onChange={(event) => onChange({ ...filters, actorName: event.target.value })}
          placeholder="Parte do nome"
          error={Boolean(
            filterFieldError(
              filters.actorName,
              validActorName(filters.actorName),
              OBSERVABILITY_AUDIT_MESSAGES.shortActorName
            )
          )}
          helperText={
            filterFieldError(
              filters.actorName,
              validActorName(filters.actorName),
              OBSERVABILITY_AUDIT_MESSAGES.shortActorName
            ) || undefined
          }
          fullWidth
          size="small"
          slotProps={{
            htmlInput: { 'aria-label': 'Nome do usuário', maxLength: ACTOR_NAME_MAX_LENGTH },
          }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <TextField
          id="audit-actor-id"
          label="ID do ator"
          value={filters.actorId}
          onChange={(event) => onChange({ ...filters, actorId: event.target.value })}
          placeholder="UUID do usuário"
          error={Boolean(
            filterFieldError(
              filters.actorId,
              validUuid(filters.actorId),
              OBSERVABILITY_AUDIT_MESSAGES.incompleteUuid
            )
          )}
          helperText={
            filterFieldError(
              filters.actorId,
              validUuid(filters.actorId),
              OBSERVABILITY_AUDIT_MESSAGES.incompleteUuid
            ) || undefined
          }
          fullWidth
          size="small"
          slotProps={{
            htmlInput: { 'aria-label': 'ID do ator', spellCheck: false },
          }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <OptionSelect
          id="audit-actor-role"
          label="Papel"
          value={filters.actorRole}
          options={ROLE_FILTER_OPTIONS}
          onChange={(actorRole) => onChange({ ...filters, actorRole })}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <OptionSelect
          id="audit-outcome"
          label="Resultado"
          value={filters.outcome}
          options={OUTCOME_FILTER_OPTIONS}
          onChange={(outcome) => onChange({ ...filters, outcome })}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <TextField
          id="audit-action-name"
          label="Ação"
          value={filters.actionName}
          onChange={(event) => onChange({ ...filters, actionName: event.target.value })}
          placeholder="Trecho, ex.: ClubsController ou .create"
          error={Boolean(
            filterFieldError(
              filters.actionName,
              validActionName(filters.actionName),
              OBSERVABILITY_AUDIT_MESSAGES.invalidActionName
            )
          )}
          helperText={
            filterFieldError(
              filters.actionName,
              validActionName(filters.actionName),
              OBSERVABILITY_AUDIT_MESSAGES.invalidActionName
            ) || undefined
          }
          fullWidth
          size="small"
          slotProps={{
            htmlInput: { 'aria-label': 'Ação', spellCheck: false },
          }}
          sx={TOOLBAR_FIELD_SX}
        />
      </Box>
      <Box sx={FILTER_CELL_SX}>
        <OptionSelect
          id="audit-source-type"
          label="Origem"
          value={filters.sourceType}
          options={SOURCE_TYPE_FILTER_OPTIONS}
          onChange={(sourceType) => onChange({ ...filters, sourceType })}
        />
      </Box>
    </Box>
  );
}
