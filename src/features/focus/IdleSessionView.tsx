import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { formatDurationLabel } from "@/utils/time";
import { ConfirmSessionModal } from "./ConfirmSessionModal";
import { Shield, Sparkles, SlidersHorizontal } from "lucide-react";

interface IdleSessionViewProps {
  selectedSitesCount: number;
  onStartSession: (durationMinutes: number, strictMode: boolean) => Promise<void>;
  onNavigateToApps?: () => void;
}

const PRESET_DURATIONS = [15, 30, 45, 60, 120];

export function IdleSessionView({
  selectedSitesCount,
  onStartSession,
  onNavigateToApps,
}: IdleSessionViewProps) {
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [strictMode, setStrictMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePresetClick = (mins: number) => {
    setDurationMinutes(mins);
  };

  return (
    <div className="flex flex-col justify-between h-full py-1">
      <div className="space-y-4">
        {/* Mode Banner */}
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200/80 rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-900 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-950">Deep Work</p>
              <p className="text-[10px] text-brand-500">Maximum focus & zero distractions</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 bg-white border border-brand-200 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Duration Picker */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-600 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Duration
            </span>
            <span className="text-base font-bold font-mono text-brand-950">
              {formatDurationLabel(durationMinutes)}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_DURATIONS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  durationMinutes === preset
                    ? "bg-brand-900 text-white shadow-sm font-semibold"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/50"
                }`}
              >
                {formatDurationLabel(preset)}
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div className="pt-1">
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-100 rounded-lg appearance-none cursor-pointer accent-brand-900"
            />
            <div className="flex justify-between text-[10px] text-brand-400 mt-1">
              <span>5m</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h</span>
            </div>
          </div>
        </Card>

        {/* Sites selection summary & Strict Mode */}
        <div className="space-y-2">
          {/* Sites summary pill */}
          <div
            onClick={onNavigateToApps}
            className="flex items-center justify-between bg-white border border-brand-200 hover:border-brand-300 rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors shadow-2xs"
          >
            <div>
              <p className="text-xs font-semibold text-brand-900">Blocked Websites</p>
              <p className="text-[10px] text-brand-500">
                {selectedSitesCount} distraction{selectedSitesCount === 1 ? "" : "s"} selected
              </p>
            </div>
            <span className="text-[11px] text-brand-500 font-medium hover:text-brand-900">
              Manage &rarr;
            </span>
          </div>

          {/* Strict Mode Toggle */}
          <div className="flex items-center justify-between bg-white border border-brand-200 rounded-xl px-3.5 py-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-500" />
              <div>
                <p className="text-xs font-semibold text-brand-900">Strict Mode</p>
                <p className="text-[10px] text-brand-400">Hides the Give Up option in-session</p>
              </div>
            </div>
            <Toggle
              checked={strictMode}
              onChange={setStrictMode}
            />
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-3 pb-1">
        <Button
          variant="solid"
          size="lg"
          onClick={() => setShowConfirmModal(true)}
          disabled={selectedSitesCount === 0}
          className="w-full font-semibold shadow-sm"
        >
          {selectedSitesCount === 0 ? "Select Sites to Block" : "Start Focus Session"}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmSessionModal
        open={showConfirmModal}
        durationMinutes={durationMinutes}
        selectedSitesCount={selectedSitesCount}
        strictMode={strictMode}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          setShowConfirmModal(false);
          await onStartSession(durationMinutes, strictMode);
        }}
      />
    </div>
  );
}
