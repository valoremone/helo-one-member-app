import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(203,163,92,0.35)] hover:shadow-[0_16px_40px_rgba(203,163,92,0.45)] hover:opacity-95",
        destructive:
          "bg-destructive text-white shadow-[0_10px_24px_rgba(255,107,107,0.35)] hover:shadow-[0_16px_36px_rgba(255,107,107,0.5)] focus-visible:ring-destructive",
        outline:
          "border border-white/20 bg-white/5 text-foreground shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:bg-white/12 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:opacity-95",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
