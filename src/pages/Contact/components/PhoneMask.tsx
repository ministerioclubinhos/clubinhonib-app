import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { PhoneMaskProps } from '../types';

const PhoneMask = forwardRef<HTMLInputElement, PhoneMaskProps>(function PhoneMask(props, ref) {
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
});

export default PhoneMask;
