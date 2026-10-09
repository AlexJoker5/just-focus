import { Heading } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  sessionActive?: boolean;
}

export function Header({ sessionActive = false }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-brand-100">
      <Heading level="h4" className="text-sm font-bold tracking-wider uppercase">
        Just Focus
      </Heading>
      <div className="flex items-center gap-2">
        <Badge variant={sessionActive ? "success" : "default"}>
          {sessionActive ? "Active" : "Idle"}
        </Badge>
      </div>
    </header>
  );
}
