import { useState, useEffect } from "react";
import type { Session } from "@/app/types/databaseTypes";
import { formatCountdown } from "@/utils/time";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { GiveUpModal } from "./GiveUpModal";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ActiveSessionViewProps {
  session: Session;
  onEndSession: (sessionId: string, status: "completed" | "abandoned") => Promise<void>;
}

export function ActiveSessionView({ session, onEndSession }: ActiveSessionViewProps) {
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const end = new Date(session.end_time).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  });

  const totalDurationSeconds = session.duration_minutes * 60;
  const elapsedSeconds = Math.max(0, totalDurationSeconds - secondsRemaining);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingMinutes = Math.ceil(secondsRemaining / 60);

  // Tick countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(session.end_time).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onEndSession(session.id, "completed");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, onEndSession]);

  // Circular progress calculation
  const progressRatio = totalDurationSeconds > 0
    ? Math.min(1, Math.max(0, elapsedSeconds / totalDurationSeconds))
    : 1;

  // SVG dimensions
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 - progressRatio) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full py-2">
      {/* Top indicator */}
      <div className="flex items-center gap-1.5 text-xs text-brand-500 font-medium pt-1">
        {session.strict_mode ? (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
            <ShieldAlert className="w-3 h-3" />
            Strict Mode Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
            <ShieldCheck className="w-3 h-3" />
            Normal Mode
          </span>
        )}
      </div>

      {/* Circular Timer Dial */}
      <div className="relative flex items-center justify-center my-3">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-brand-100"
            fill="transparent"
          />
          {/* Active Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-brand-900 transition-all duration-1000 ease-linear"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-bold tracking-tight text-brand-950">
            {formatCountdown(secondsRemaining)}
          </span>
          <Text size="xs" className="text-brand-500 font-medium mt-1">
            Focus Mode Active
          </Text>
        </div>
      </div>

      {/* Sub-info banner */}
      <div className="text-center px-4">
        <Text size="xs" className="text-brand-400">
          {session.blocked_site_ids.length} distracting site{session.blocked_site_ids.length === 1 ? "" : "s"} blocked
        </Text>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full pt-3 pb-1 flex flex-col items-center">
        {session.strict_mode ? (
          <div className="text-center px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg w-full">
            <p className="text-[11px] text-brand-600 font-medium">
              Commitment locked. Give Up is disabled in Strict Mode.
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGiveUpModal(true)}
            className="w-full text-brand-500 hover:text-red-600 hover:border-red-200 text-xs transition-colors"
          >
            Give Up
          </Button>
        )}
      </div>

      {/* Give Up Modal */}
      <GiveUpModal
        open={showGiveUpModal}
        elapsedMinutes={elapsedMinutes}
        remainingMinutes={remainingMinutes}
        onKeepGoing={() => setShowGiveUpModal(false)}
        onConfirmGiveUp={async () => {
          setShowGiveUpModal(false);
          await onEndSession(session.id, "abandoned");
        }}
      />
    </div>
  );
}
