import React from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
    "relative group border mx-auto text-center rounded-full font-semibold transition-all duration-200",
    {
        variants: {
            variant: {
                default: "bg-luxury-gold/5 hover:bg-luxury-gold/0 border-luxury-gold/20 text-luxury-gold",
                solid: "bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-charcoal border-transparent hover:border-luxury-gold/50",
                ghost: "border-transparent bg-transparent hover:border-luxury-gold/30 hover:bg-white/10 text-white",
            },
            size: {
                default: "px-7 py-1.5",
                sm: "px-4 py-0.5",
                lg: "px-12 py-4 text-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { neon?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, neon = true, size, variant, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            >
                <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-luxury-gold to-transparent hidden", neon && "block")} />
                {children}
                <span className={cn("absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-luxury-gold to-transparent hidden", neon && "block")} />
            </button>
        );
    }
)

Button.displayName = 'Button';

export { Button, buttonVariants };

