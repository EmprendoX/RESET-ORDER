import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

const variants = {
  primary:
    "bg-[#1E4DFF] text-white shadow-[0_10px_24px_rgba(30,77,255,0.35)] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(30,77,255,0.5)] hover:brightness-[1.06] focus-visible:outline-[#1E4DFF]",
  secondary:
    "bg-[var(--accent-soft)] text-white hover:bg-[rgba(255,30,30,0.24)] focus-visible:outline-[#FF1E1E]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text)] focus-visible:outline-[#1E4DFF]",
  danger:
    "bg-[rgba(255,30,30,0.18)] text-[var(--danger)] hover:bg-[rgba(255,30,30,0.28)] focus-visible:outline-[#FF1E1E]",
} as const;

type Variant = keyof typeof variants;

export function Button({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children?: ReactNode;
}) {
  const styles = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link className={styles} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
