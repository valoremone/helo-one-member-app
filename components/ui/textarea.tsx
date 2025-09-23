import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground placeholder:opacity-70 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 outline-none backdrop-blur disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-ring/60",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_1px_rgba(255,107,107,0.5)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
