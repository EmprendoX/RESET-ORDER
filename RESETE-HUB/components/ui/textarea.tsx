import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-y rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-3 py-2 text-sm text-[#111827] shadow-sm transition focus:border-[rgba(30,77,255,0.65)] focus:outline-none focus:ring-[3px] focus:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
