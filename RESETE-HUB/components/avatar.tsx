import Image from "next/image";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 80,
};

const TEXT_SIZE: Record<Size, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
};

function initials(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export function Avatar({
  url,
  name,
  size = "sm",
  level,
  className,
}: {
  url?: string | null;
  name: string;
  size?: Size;
  level?: number;
  className?: string;
}) {
  const px = SIZE_PX[size];
  return (
    <div
      className={cn("relative inline-block flex-shrink-0", className)}
      style={{ width: px, height: px }}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          width={px}
          height={px}
          className="rounded-full object-cover"
          style={{ width: px, height: px }}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full font-semibold uppercase",
            TEXT_SIZE[size],
          )}
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
          }}
        >
          {initials(name)}
        </div>
      )}
      {typeof level === "number" && level > 0 ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: "var(--cta)", boxShadow: "0 0 0 2px var(--surface)" }}
        >
          {level}
        </span>
      ) : null}
    </div>
  );
}
