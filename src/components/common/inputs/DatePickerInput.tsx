import { TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export interface DatePickerInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  margin?: TextFieldProps['margin'];
  minDate?: string;
  maxDate?: string;
}

export function DatePickerInput<T extends FieldValues>({
  name,
  control,
  label = 'Data',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  minDate,
  maxDate,
}: DatePickerInputProps<T>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue: Dayjs | null) => {
              field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
            }}
            disabled={disabled}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth,
                size,
                error,
                helperText,
                required,
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}

interface SimpleDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  margin?: TextFieldProps['margin'];
  minDate?: string;
  maxDate?: string;
}

export function SimpleDatePicker({
  value,
  onChange,
  label = 'Data',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  minDate,
  maxDate,
}: SimpleDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue: Dayjs | null) => {
          onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
        }}
        disabled={disabled}
        minDate={minDate ? dayjs(minDate) : undefined}
        maxDate={maxDate ? dayjs(maxDate) : undefined}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth,
            size,
            error,
            helperText,
            required,
          },
        }}
      />
    </LocalizationProvider>
  );
}

export function formatDateBR(date: string | Date | undefined): string {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateISO(date: string | Date | undefined): string {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

export function parseDateBR(dateBR: string): string {
  if (!dateBR) return '';
  const [day, month, year] = dateBR.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default DatePickerInput;
