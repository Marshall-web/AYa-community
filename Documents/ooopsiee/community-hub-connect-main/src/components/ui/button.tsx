import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(22_52%_33%/0.15)] hover:shadow-[0_8px_30px_-8px_hsl(22_52%_33%/0.2)] hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_20px_-4px_hsl(22_52%_33%/0.15)] hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_4px_20px_-4px_hsl(22_52%_33%/0.15)] hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-[hsl(38_70%_50%)] text-[hsl(22_52%_15%)] shadow-[0_8px_30px_-8px_hsl(22_52%_33%/0.2)] hover:shadow-[0_0_40px_hsl(38_70%_50%/0.3)] hover:scale-105 font-bold",
        heroOutline: "border-2 border-[hsl(38_45%_96%/0.4)] text-[hsl(38_45%_96%)] bg-[hsl(38_45%_96%/0.05)] backdrop-blur-sm hover:bg-[hsl(38_45%_96%/0.15)] font-semibold",
        gold: "bg-gradient-to-r from-[hsl(38_70%_50%)] to-[hsl(40_75%_65%)] text-[hsl(16_58%_10%)] shadow-[0_8px_30px_-8px_hsl(22_52%_33%/0.2)] hover:shadow-[0_0_40px_hsl(38_70%_50%/0.3)] font-bold",
        warm: "bg-[hsl(22_52%_33%)] text-[hsl(38_45%_96%)] shadow-[0_4px_20px_-4px_hsl(22_52%_33%/0.15)] hover:bg-[hsl(22_52%_28%)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
