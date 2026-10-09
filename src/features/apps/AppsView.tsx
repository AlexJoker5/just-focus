import { useState } from "react";
import type { BlockedSite } from "@/app/types/databaseTypes";
import { normalizeDomain, isValidDomain } from "@/utils/domain";
import { generateId } from "@/utils/uid";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Check, Plus, Trash2 } from "lucide-react";
import { AppIcon } from "./AppIcon";

const CATEGORY_ORDER = [
  "Social Media",
  "AI Tools",
  "Entertainment",
  "Job Hunting",
  "Custom",
];

interface AppsViewProps {
  sites: BlockedSite[];
  onToggleSite: (siteId: string) => void;
  onAddCustomSite: (site: BlockedSite) => void;
  onRemoveCustomSite: (siteId: string) => void;
  sessionActive?: boolean;
}

export function AppsView({
  sites,
  onToggleSite,
  onAddCustomSite,
  onRemoveCustomSite,
  sessionActive = false,
}: AppsViewProps) {
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const normalized = normalizeDomain(newDomain);
    if (!isValidDomain(normalized)) {
      setError("Please enter a valid domain (e.g. reddit.com)");
      return;
    }

    if (sites.some((s) => s.domain === normalized)) {
      setError("This domain is already in your list");
      return;
    }

    const now = new Date().toISOString();
    const customSite: BlockedSite = {
      id: generateId(),
      user_id: null,
      domain: normalized,
      display_name: normalized,
      category: "Custom",
      icon_url: null,
      is_custom: true,
      is_selected: true,
      created_at: now,
      updated_at: now,
    };

    onAddCustomSite(customSite);
    setNewDomain("");
    setError(null);
  };

  // Group sites by category and sort in preferred order
  const categories = Array.from(new Set(sites.map((s) => s.category || "Other")));
  const sortedCategories = categories.sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a);
    const idxB = CATEGORY_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Header explanation */}
      <div>
        <Heading level="h2" className="text-base font-bold text-brand-950">
          Blocked Websites
        </Heading>
        <Text size="xs" className="text-brand-500">
          {sessionActive
            ? "Session is active. Site changes will apply to next session."
            : "Select websites to block during your focus sessions."}
        </Text>
      </div>

      {/* Add Custom Website Form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={newDomain}
              onChange={(e) => {
                setNewDomain(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Add website (e.g., news.ycombinator.com)"
              className="text-xs py-2"
              disabled={sessionActive}
            />
          </div>
          <Button
            type="submit"
            variant="solid"
            size="md"
            disabled={sessionActive || !newDomain.trim()}
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
      </form>

      {/* Categories & Visual Tiles */}
      <div className="flex flex-col gap-4">
        {sortedCategories.map((cat) => {
          const categorySites = sites.filter((s) => (s.category || "Other") === cat);
          if (categorySites.length === 0) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider px-0.5">
                {cat}
              </span>

              <div className="grid grid-cols-2 gap-2">
                {categorySites.map((site) => {
                  return (
                    <div
                      key={site.id}
                      onClick={() => !sessionActive && onToggleSite(site.id)}
                      className={`relative flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left select-none ${
                        sessionActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                      } ${
                        site.is_selected
                          ? "bg-brand-900 text-white border-brand-900 shadow-2xs"
                          : "bg-white text-brand-800 border-brand-200 hover:border-brand-300 hover:bg-brand-50/50"
                      }`}
                    >
                      {/* Icon or Avatar */}
                      <AppIcon
                        iconKey={site.icon_url}
                        name={site.display_name}
                        isSelected={site.is_selected}
                      />

                      {/* Site Name & Domain */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-medium truncate leading-tight">
                          {site.display_name}
                        </p>
                        <p
                          className={`text-[10px] truncate ${
                            site.is_selected ? "text-brand-300" : "text-brand-400"
                          }`}
                        >
                          {site.domain}
                        </p>
                      </div>

                      {/* Selected checkmark indicator */}
                      {site.is_selected && (
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-white text-brand-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Delete button for custom site */}
                      {site.is_custom && !sessionActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCustomSite(site.id);
                          }}
                          className={`absolute bottom-2 right-2 p-0.5 rounded transition-colors ${
                            site.is_selected
                              ? "text-brand-300 hover:text-white"
                              : "text-brand-400 hover:text-red-500"
                          }`}
                          title="Remove custom site"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
