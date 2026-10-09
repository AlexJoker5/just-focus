import { Modal } from "@/components/ui/modal/Modal";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { formatDurationLabel } from "@/utils/time";
import { ShieldAlert, Clock, Globe } from "lucide-react";

interface ConfirmSessionModalProps {
  open: boolean;
  durationMinutes: number;
  selectedSitesCount: number;
  strictMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmSessionModal({
  open,
  durationMinutes,
  selectedSitesCount,
  strictMode,
  onCancel,
  onConfirm,
}: ConfirmSessionModalProps) {
  return (
    <Modal open={open} onClose={onCancel} className="p-5 max-w-[320px]">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <Heading level="h2" className="text-lg font-bold text-brand-950">
            Confirm Focus Session
          </Heading>
          <Text size="xs" className="text-brand-500">
            Review your session commitment before locking in.
          </Text>
        </div>

        {/* Summary Details */}
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-brand-700">
            <span className="flex items-center gap-1.5 text-brand-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Duration
            </span>
            <span className="font-semibold text-brand-950">
              {formatDurationLabel(durationMinutes)} ({durationMinutes} mins)
            </span>
          </div>

          <div className="flex items-center justify-between text-brand-700">
            <span className="flex items-center gap-1.5 text-brand-500 font-medium">
              <Globe className="w-3.5 h-3.5" />
              Blocked Sites
            </span>
            <span className="font-semibold text-brand-950">
              {selectedSitesCount} site{selectedSitesCount === 1 ? "" : "s"} selected
            </span>
          </div>

          <div className="flex items-center justify-between text-brand-700">
            <span className="flex items-center gap-1.5 text-brand-500 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Strict Mode
            </span>
            <span className={`font-semibold ${strictMode ? "text-amber-700" : "text-brand-700"}`}>
              {strictMode ? "Enabled (No Give Up)" : "Off (Standard)"}
            </span>
          </div>
        </div>

        {strictMode && (
          <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded p-2 text-center">
            ⚠️ In Strict Mode, you cannot cancel or give up until the timer completes.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            size="md"
            onClick={onConfirm}
            className="flex-1 text-xs font-semibold"
          >
            Start Session
          </Button>
        </div>
      </div>
    </Modal>
  );
}
