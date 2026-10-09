import { type HTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/cn";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: "h1" | "h2" | "h3" | "h4";
}

const levelStyles: Record<string, string> = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  h4: "text-base font-medium",
};

export function Heading({
  level = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag: ElementType = level;

  return (
    <Tag
      className={cn("text-brand-950 tracking-tight", levelStyles[level], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
