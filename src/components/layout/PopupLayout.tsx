import { type ReactNode } from "react";

interface PopupLayoutProps {
  children: ReactNode;
}

export function PopupLayout({ children }: PopupLayoutProps) {
  return (
    <div className="w-[360px] h-[555px] flex flex-col bg-white overflow-hidden">
      {children}
    </div>
  );
}
