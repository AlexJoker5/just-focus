import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Text } from "./Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-brand-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 placeholder:text-brand-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {error && (
          <Text size="xs" className="text-red-500">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
