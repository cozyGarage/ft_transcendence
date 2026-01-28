import { clsx } from 'clsx';
import { forwardRef, type ElementType, type ComponentPropsWithoutRef } from 'react';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: ElementType;
}

type ButtonProps<E extends ElementType = 'button'> = BaseButtonProps &
  Omit<ComponentPropsWithoutRef<E>, keyof BaseButtonProps>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      as,
      ...props
    },
    ref
  ) {
    const Component = as || 'button';
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      ghost: 'px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-100 rounded-lg transition-colors',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <Component
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={Component === 'button' ? disabled || isLoading : undefined}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </Component>
    );
  }
);

export default Button;
