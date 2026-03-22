'use client';

import { Button } from '@/components/ui/button';
import type { TriageResult as TriageResultType } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const URGENCY_ACTIONS: Record<TriageResultType['urgency'], { label: string }> =
  {
    emergency: { label: 'Call 911' },
    urgent: { label: 'Find me nearest hospital' },
    routine: { label: 'Book an appointment' },
  };

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  'emergency-room': 'Emergency room',
  'first-appointment': 'First appointment',
  'check-up': 'Check-up',
  cardiography: 'Cardiography',
  'stress-test': 'Stress test',
  imaging: 'Imaging',
  'follow-up': 'Follow-up',
};

const NEXT_STEPS_LABELS: Record<string, string> = {
  'call-emergency': 'Call emergency services',
  'schedule-urgent': 'Schedule urgent appointment',
  schedule: 'Schedule routine appointment',
  'self-care': 'Self-care at home',
};

function getUrgencyCardClassName(urgency: TriageResultType['urgency']): string {
  switch (urgency) {
    case 'emergency':
      return 'border-destructive bg-destructive/10 text-foreground';
    case 'urgent':
      return 'border-warning bg-warning/10 text-foreground';
    case 'routine':
      return 'border-primary bg-primary/10 text-foreground';
    default:
      return 'border-border bg-card text-card-foreground';
  }
}

function humanizeConsultationType(value: string): string {
  return CONSULTATION_TYPE_LABELS[value] ?? value;
}

function humanizeNextSteps(value: string): string {
  return NEXT_STEPS_LABELS[value] ?? value;
}

export interface TriageResultProps {
  result: TriageResultType;
}

export default function TriageResult({
  result,
}: TriageResultProps): React.ReactElement {
  const cardClassName = getUrgencyCardClassName(result.urgency);

  return (
    <section
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-4"
      aria-label="Triage recommendation"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <article
          className={cn(
            'flex flex-col gap-4 rounded-lg border p-4',
            cardClassName,
          )}
        >
          <dl className="grid gap-4">
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Recommended pathway
              </dt>
              <dd className="mt-1 font-medium">{result.pathway}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Consultation type
              </dt>
              <dd className="mt-1">
                {humanizeConsultationType(result.consultationType)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Next steps
              </dt>
              <dd className="mt-1">{humanizeNextSteps(result.nextSteps)}</dd>
            </div>
            {result.symptoms && result.symptoms.length > 0 && (
              <div>
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Symptoms identified
                </dt>
                <dd className="mt-1">
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {result.symptoms.map((symptom) => (
                      <li key={symptom}>{symptom}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </article>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Button type="button">{URGENCY_ACTIONS[result.urgency].label}</Button>
          <Button type="button" variant="outline">
            Continue conversation
          </Button>
        </div>
      </div>
    </section>
  );
}
