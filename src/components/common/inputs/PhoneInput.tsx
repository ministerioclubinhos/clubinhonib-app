import { forwardRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { IMaskInput } from 'react-imask';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

interface PhoneMaskInputProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PhoneMaskInput = forwardRef<HTMLInputElement, PhoneMaskInputProps>(
  function PhoneMaskInput(props, ref) {
    const { onChange, name, ...rest } = props;
    return (
      <IMaskInput
        {...rest}
        mask="(00) 00000-0000"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        overwrite
        onAccept={(value: string) => onChange({ target: { name, value } })}
      />
    );
  }
);

export interface PhoneInputProps<T extends FieldValues> {
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
}

export function PhoneInput<T extends FieldValues>({
  name,
  control,
  label = 'Telefone',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  margin = 'normal',
}: PhoneInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          fullWidth={fullWidth}
          margin={margin}
          size={size}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled}
          slotProps={{
            input: {
              inputComponent: PhoneMaskInput as never,
            },
          }}
        />
      )}
    />
  );
}

export function extractPhoneDigits(phone: string): string {
  return phone?.replace(/\D/g, '') || '';
}

interface SimplePhoneInputProps {
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
}

const SimplePhoneMaskInput = forwardRef<HTMLInputElement, { onChange: (event: { target: { value: string } }) => void }>(
  function SimplePhoneMaskInput(props, ref) {
    const { onChange, ...rest } = props;
    return (
      <IMaskInput
        {...rest}
        mask="(00) 00000-0000"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        overwrite
        onAccept={(value: string) => onChange({ target: { value } })}
      />
    );
  }
);

export function SimplePhoneInput({
  value,
  onChange,
  label = 'Telefone',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  margin = 'normal',
}: SimplePhoneInputProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      fullWidth={fullWidth}
      margin={margin}
      size={size}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      slotProps={{
        input: {
          inputComponent: SimplePhoneMaskInput as never,
        },
      }}
    />
  );
}

export default PhoneInput;
