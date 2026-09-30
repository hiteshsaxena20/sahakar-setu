import { LabelHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label ref={ref} className={clsx('label', className)} {...props}>
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';