interface BasicInfoSectionProps {
  summary: string;
}

export function BasicInfoSection({ summary }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
        Basic Information
      </h2>
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-f-primary dark:text-darkText mb-4">
          Summary
        </h3>
        <p className="text-f-tertiary dark:text-darkMuted whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    </div>
  );
}
