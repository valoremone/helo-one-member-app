import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold tracking-[0.02em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_40px_rgba(203,163,92,0.35)] hover:bg-primary/90 hover:shadow-[0_20px_52px_rgba(203,163,92,0.45)]",
        destructive:
          "bg-destructive text-white shadow-[0_12px_34px_rgba(255,107,107,0.4)] hover:bg-destructive/90 hover:shadow-[0_18px_46px_rgba(255,107,107,0.5)] focus-visible:ring-destructive",
        outline:
          "border border-white/20 bg-white/8 text-foreground shadow-[0_12px_34px_rgba(5,6,10,0.55)] backdrop-blur focus-visible:ring-white/40 hover:border-white/35 hover:bg-white/14 hover:text-foreground",
        secondary:
          "bg-white/10 text-foreground shadow-[0_12px_40px_rgba(5,6,10,0.55)] hover:bg-white/16",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground",
        link: "border-transparent bg-transparent text-accent underline-offset-6 hover:text-accent/90 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
