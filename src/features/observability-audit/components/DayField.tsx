import { useEffect, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

import { DAY_FIELD_DISPLAY_FORMAT, DAY_FIELD_VALUE_FORMAT, TOOLBAR_FIELD_SX } from '../constants';

interface DayFieldProps {
  label: string;
  /** `YYYY-MM-DD` no fuso do navegador, ou `''` enquanto não há um dia completo. */
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
}

const parse = (value: string): Dayjs | null => {
  const parsed = value ? dayjs(value, DAY_FIELD_VALUE_FORMAT) : null;
  return parsed?.isValid() ? parsed : null;
};

/**
 * Um dia do período, com o seletor em português.
 *
 * O campo guarda o que está sendo digitado; para fora só sai um dia completo
 * (`YYYY-MM-DD`) ou `''`. Devolver o valor parcial ao próprio campo apagaria a
 * digitação a cada tecla.
 */
export default function DayField({ label, value, onChange, error, minDate, maxDate }: DayFieldProps) {
  const [draft, setDraft] = useState<Dayjs | null>(() => parse(value));

  // Valor trocado por fora (limpar filtros, período inicial) substitui o rascunho.
  useEffect(() => {
    setDraft((current) => {
      const currentValue = current?.isValid() ? current.format(DAY_FIELD_VALUE_FORMAT) : '';
      return currentValue === value ? current : parse(value);
    });
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <DatePicker
        label={label}
        value={draft}
        onChange={(next: Dayjs | null) => {
          setDraft(next);
          onChange(next?.isValid() ? next.format(DAY_FIELD_VALUE_FORMAT) : '');
        }}
        minDate={parse(minDate ?? '') ?? undefined}
        maxDate={parse(maxDate ?? '') ?? undefined}
        format={DAY_FIELD_DISPLAY_FORMAT}
        // Um único <input>: digitar, colar e apagar funcionam como em um campo comum.
        enableAccessibleFieldDOMStructure={false}
        slotProps={{ textField: { fullWidth: true, size: 'small', error, sx: TOOLBAR_FIELD_SX } }}
      />
    </LocalizationProvider>
  );
}
