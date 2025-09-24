import React, { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { PhoneMaskProps } from '../types';

const PhoneMask = forwardRef<HTMLInputElement, PhoneMaskProps>(function PhoneMask(props, ref) {
  return (
    <IMaskInput
      {...props}
      mask="(00) 00000-0000"
      definitions={{
        '0': /[0-9]/,
      }}
      inputRef={ref}
      overwrite
    />
  );
});

export default PhoneMask;
