import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shuffle } from "lucide-react";

export const PENALTY_PHRASES = [
  "I will try harder next time",
  "I am choosing comfort over my goals",
  "Discipline today creates freedom tomorrow",
  "I am breaking my promise to stay focused",
  "My future self will wish I kept going",
  "Every time I give up it gets easier to quit",
  "I am stepping away before finishing my work",
  "Short term distraction will not build my future",
  "I choose to abandon my deep work session early",
  "I will take responsibility for losing focus",
  "I am letting temporary impulse win over discipline",
  "Focus is a choice and I am choosing to quit",
  "I am trading my deep work for cheap dopamine",
  "Deep work requires resisting this urge",
  "I will regret giving up on this focus session",
];

function getRandomPhrase(exclude?: string): string {
  const pool = exclude
    ? PENALTY_PHRASES.filter((p) => p !== exclude)
    : PENALTY_PHRASES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

interface GiveUpModalProps {
  open: boolean;
  elapsedMinutes: number;
  remainingMinutes: number;
  onKeepGoing: () => void;
  onConfirmGiveUp: () => void;
}

export function GiveUpModal({
  open,
  elapsedMinutes,
  remainingMinutes,
  onKeepGoing,
  onConfirmGiveUp,
}: GiveUpModalProps) {
  const [targetPhrase, setTargetPhrase] = useState(PENALTY_PHRASES[0]);
  const [typedPhrase, setTypedPhrase] = useState("");

  // Select a random phrase whenever the modal is opened
  useEffect(() => {
    if (open) {
      setTargetPhrase(getRandomPhrase());
      setTypedPhrase("");
    }
  }, [open]);

  const handleShuffle = () => {
    setTargetPhrase((prev) => getRandomPhrase(prev));
    setTypedPhrase("");
  };

  const isMatched = typedPhrase.trim() === targetPhrase;

  const handleClose = () => {
    setTypedPhrase("");
    onKeepGoing();
  };

  const handleGiveUp = () => {
    if (!isMatched) return;
    setTypedPhrase("");
    onConfirmGiveUp();
  };

  return (
    <Modal open={open} onClose={handleClose} className="p-6 max-w-[320px]">
      <div className="flex flex-col gap-4 text-center">
        {/* Header */}
        <div className="space-y-1">
          <Heading level="h2" className="text-xl font-bold text-brand-950">
            Don't Give Up
          </Heading>
          <Text size="xs" className="text-brand-500 leading-relaxed">
            You&apos;re <span className="font-semibold text-brand-900">{elapsedMinutes}m</span> in.
            You only need <span className="font-semibold text-brand-900">{remainingMinutes}m</span> more
            to win this session. Don&apos;t let a moment of weakness ruin your progress.
          </Text>
        </div>

        {/* Penalty Phrase Callout */}
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-brand-500 uppercase block">
              TYPE THIS TO CONFIRM:
            </span>
            <button
              type="button"
              onClick={handleShuffle}
              title="Get another phrase"
              className="text-brand-400 hover:text-brand-700 p-0.5 rounded transition-colors"
            >
              <Shuffle className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs font-mono font-semibold text-brand-900 bg-white border border-brand-200 rounded px-2 py-1 select-all">
            {targetPhrase}
          </p>
        </div>

        {/* Typing input */}
        <div className="text-left">
          <Input
            value={typedPhrase}
            onChange={(e) => setTypedPhrase(e.target.value)}
            placeholder="Type the text above..."
            className="text-xs"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="solid"
            size="md"
            onClick={handleClose}
            className="w-full font-semibold"
          >
            KEEP GOING
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={!isMatched}
            onClick={handleGiveUp}
            className="w-full text-xs font-medium"
          >
            I GIVE UP
          </Button>
        </div>
      </div>
    </Modal>
  );
}
