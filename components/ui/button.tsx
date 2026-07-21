import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow hover:brightness-110 active:scale-[0.98]",
        success:
          "bg-success text-[#02150b] shadow-glow-success hover:brightness-110",
        ghost: "text-ink-secondary hover:text-ink hover:bg-white/5",
        outline:
          "border border-border bg-surface/60 text-ink hover:border-primary/40 hover:bg-surface",
      },
      size: {
        default: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-12 px-8 text-base [&_svg]:size-5",
        xl: "h-16 px-10 text-lg [&_svg]:size-5",
        icon: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
