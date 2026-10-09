import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { localRepository } from "@/app/api/localRepository";
import { formatCountdown } from "@/utils/time";
import { Globe, Clock } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
  "Your attention determines what you achieve.",
  "Deep work produces rare and valuable results.",
  "Every temptation resisted strengthens your will.",
  "Focus is saying no to the hundred other good ideas.",
  "Discipline today creates freedom tomorrow.",
];

export default function BlockedApp() {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("domain") || "this site";
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Pick quote deterministically based on domain or day
  const quoteIndex = Math.abs(
    domain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  useEffect(() => {
    async function checkSession() {
      const activeSession = await localRepository.getActiveSession();
      if (activeSession) {
        const end = new Date(activeSession.end_time).getTime();
        const now = Date.now();
        setSecondsRemaining(Math.max(0, Math.floor((end - now) / 1000)));
      }
    }

    checkSession();
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCloseTab = () => {
    // If in extension tab, window.close works if opened by script or user clicks close
    window.close();
    // Fallback if browser blocks window.close
    setTimeout(() => {
      window.location.href = "chrome://newtab";
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] flex flex-col items-center justify-center p-6 select-none relative">
      {/* Brand watermark top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-brand-900 text-white flex items-center justify-center font-bold text-xs">
          F
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
          Just Focus
        </span>
      </div>

      {/* Center card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xs border border-brand-200/80 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center gap-6 animate-fade-in">
        {/* Site Icon */}
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-brand-200 flex items-center justify-center text-brand-700">
          <Globe className="w-10 h-10 stroke-[1.5]" />
        </div>

        {/* Site Name Uppercase */}
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">
            {domain}
          </span>
          <Heading level="h1" className="text-3xl font-bold text-brand-950 tracking-tight">
            Stay focused.
          </Heading>
        </div>

        {/* Motivational quote */}
        <Text size="sm" className="text-brand-500 max-w-xs font-normal leading-relaxed">
          &ldquo;{quote}&rdquo;
        </Text>

        {/* Session Remaining Context */}
        {secondsRemaining !== null && secondsRemaining > 0 && (
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-full text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>{formatCountdown(secondsRemaining)} remaining in focus session</span>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full pt-2">
          <Button
            variant="solid"
            size="lg"
            onClick={handleCloseTab}
            className="w-full font-bold tracking-wider text-xs py-3.5"
          >
            CLOSE TAB
          </Button>
        </div>
      </div>
    </div>
  );
}
