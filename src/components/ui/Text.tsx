import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextSize = "xs" | "sm" | "base" | "lg";

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
  as?: "p" | "span" | "div";
}

const sizeStyles: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

export function Text({
  size = "base",
  as: Tag = "p",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn("text-brand-600", sizeStyles[size], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
