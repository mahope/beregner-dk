import { forwardRef } from "react";

type CardVariant = "default" | "elevated" | "bordered" | "success" | "warning" | "error" | "info";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm rounded-xl",
  elevated:
    "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md rounded-xl",
  bordered:
    "bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl",
  success:
    "bg-[var(--color-success-light)] border border-green-200 dark:border-green-800 rounded-xl",
  warning:
    "bg-[var(--color-warning-light)] border border-yellow-200 dark:border-yellow-800 rounded-xl",
  error:
    "bg-[var(--color-error-light)] border border-red-200 dark:border-red-800 rounded-xl",
  info:
    "bg-[var(--color-info-light)] border border-blue-200 dark:border-blue-800 rounded-xl",
};

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mb-4 pb-4 border-b border-[var(--color-border)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg font-semibold text-[var(--color-text)] ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  },
);

CardTitle.displayName = "CardTitle";

export { Card, CardHeader, CardTitle };
export type { CardProps, CardVariant };
