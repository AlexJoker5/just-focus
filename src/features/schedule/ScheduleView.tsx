import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, Bell, Zap } from "lucide-react";

export function ScheduleView() {
  return (
    <div className="flex flex-col gap-4 pb-2">
      <div>
        <Heading level="h2" className="text-base font-bold text-brand-950">
          Scheduled Focus
        </Heading>
        <Text size="xs" className="text-brand-500">
          Automate your deep work routines and recurring blocks.
        </Text>
      </div>

      {/* Feature teaser card */}
      <Card padding="md" className="space-y-3 bg-gradient-to-b from-brand-50/50 to-white">
        <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-brand-950">Recurring Deep Work Blocks</p>
          <Text size="xs" className="text-brand-500 leading-relaxed">
            Schedule automated focus sessions aligned with your daily peak energy hours.
            Distraction blocking kicks in automatically without manual activation.
          </Text>
        </div>

        <div className="space-y-2 pt-2 border-t border-brand-100">
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Morning Deep Work (9:00 AM – 11:30 AM)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Bell className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Pre-session reminder notifications</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Zap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Calendar integration sync (v2)</span>
          </div>
        </div>
      </Card>

      <div className="text-center p-3 bg-brand-50 rounded-xl border border-brand-200/60">
        <span className="text-[11px] font-semibold text-brand-600">
          ✨ Coming in the next release
        </span>
      </div>
    </div>
  );
}
