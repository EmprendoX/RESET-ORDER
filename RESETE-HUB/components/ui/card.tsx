import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-[0_16px_32px_rgba(0,0,0,0.4)] backdrop-blur-[18px]",
        className,
      )}
      {...props}
    />
  );
}
