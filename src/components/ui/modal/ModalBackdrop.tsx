import { type ReactNode } from "react";

interface ModalBackdropProps {
  onClick?: () => void;
  children: ReactNode;
}

export function ModalBackdrop({ onClick, children }: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
