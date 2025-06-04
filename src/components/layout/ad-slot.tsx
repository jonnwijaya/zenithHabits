import { cn } from '@/lib/utils';

interface AdSlotProps {
  id: string;
  type: 'banner' | 'native';
  className?: string;
}

export function AdSlot({ id, type, className }: AdSlotProps) {
  const bannerStyles = "h-24 bg-muted/50 border border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground rounded-md";
  const nativeStyles = "h-40 bg-muted/50 border border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground rounded-md";
  
  return (
    <div
      id={`ad-slot-${id}`}
      className={cn(
        type === 'banner' ? bannerStyles : nativeStyles,
        className
      )}
      aria-label={`Advertisement slot ${id}`}
    >
      <p className="text-sm">Advertisement Placeholder ({type})</p>
    </div>
  );
}
