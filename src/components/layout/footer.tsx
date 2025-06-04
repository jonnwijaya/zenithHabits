import { ProgressShareDialog } from '@/components/general/progress-share-dialog';
import type { Habit } from '@/types';

interface FooterProps {
  habits: Habit[];
}

export function Footer({ habits }: FooterProps) {
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;

  return (
    <footer className="border-t bg-background/95 py-4 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 ? (
            <span>
              Completed {completedCount} of {totalCount} habits today. Keep going!
            </span>
          ) : (
            <span>Add some habits to start tracking your progress.</span>
          )}
        </div>
        <ProgressShareDialog habits={habits} />
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Zenith Habits &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
