import React from "react";
import { Stack, TextField, Typography } from "@mui/material";

import { SimpleDatePicker } from "@/components/common/inputs";

import type { ChildFilters } from "../types";

type Props = {
  filters: Omit<ChildFilters, "searchString">;
  onChange: (
    change: (
      current: Omit<ChildFilters, "searchString">,
    ) => Omit<ChildFilters, "searchString">,
  ) => void;
};

/** Intervalo de datas com rótulo, na mesma linha quando cabe. */
function DateRange({
  label,
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: {
  label: string;
  from?: string;
  to?: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
}) {
  return (
    <Stack data-testid="children-children-date-filters-date-range" spacing={0.5} sx={{ minWidth: { xs: "100%", md: 300 } }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={1}>
        <SimpleDatePicker
          label="De"
          margin="none"
          value={from ?? ""}
          onChange={onChangeFrom}
        />
        <SimpleDatePicker
          label="Até"
          margin="none"
          value={to ?? ""}
          onChange={onChangeTo}
        />
      </Stack>
    </Stack>
  );
}

/**
 * Filtros de criança que não cabem num seletor.
 *
 * Número do clubinho e os dois intervalos de data entram na área expansível da
 * barra de ferramentas compartilhada.
 */
export default function ChildrenDateFilters({ filters, onChange }: Props) {
  return (
    <>
      <TextField data-testid="children-children-date-filters"
        size="small"
        type="number"
        label="Nº do clubinho"
        value={filters.clubNumber ?? ""}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange((current) => ({
            ...current,
            clubNumber:
              event.target.value === "" || Number.isNaN(parsed)
                ? undefined
                : parsed,
          }));
        }}
        slotProps={{ htmlInput: { min: 1, inputMode: "numeric" } }}
        sx={{ minWidth: { xs: "100%", md: 150 } }}
      />

      <DateRange data-testid="children-children-date-filters"
        label="Nascimento"
        from={filters.birthDateFrom}
        to={filters.birthDateTo}
        onChangeFrom={(value) =>
          onChange((current) => ({ ...current, birthDateFrom: value || undefined }))
        }
        onChangeTo={(value) =>
          onChange((current) => ({ ...current, birthDateTo: value || undefined }))
        }
      />

      <DateRange data-testid="children-children-date-filters"
        label="Entrada no clubinho"
        from={filters.joinedFrom}
        to={filters.joinedTo}
        onChangeFrom={(value) =>
          onChange((current) => ({ ...current, joinedFrom: value || undefined }))
        }
        onChangeTo={(value) =>
          onChange((current) => ({ ...current, joinedTo: value || undefined }))
        }
      />
    </>
  );
}
