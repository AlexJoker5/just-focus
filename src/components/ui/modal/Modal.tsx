import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/cn";
import { ModalBackdrop } from "./ModalBackdrop";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-brand-100 p-6 animate-slide-up",
          className
        )}
      >
        {children}
      </div>
    </ModalBackdrop>
  );
}
