import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface HabitIconProps extends LucideProps {
  name: string;
}

// A subset of Lucide icons that are suitable for habits
const iconMap: { [key: string]: LucideIcons.LucideIcon } = {
  GlassWater: LucideIcons.GlassWater,
  BookOpen: LucideIcons.BookOpenText, // Using BookOpenText for more visual cue
  Brain: LucideIcons.Brain,
  Sun: LucideIcons.Sun,
  Moon: LucideIcons.Moon,
  Dumbbell: LucideIcons.Dumbbell,
  Apple: LucideIcons.Apple,
  ClipboardCheck: LucideIcons.ClipboardCheck,
  Target: LucideIcons.Target,
  TrendingUp: LucideIcons.TrendingUp,
  Leaf: LucideIcons.Leaf,
  Sprout: LucideIcons.Sprout,
  Bed: LucideIcons.Bed,
  Coffee: LucideIcons.Coffee,
  Footprints: LucideIcons.Footprints,
  Bike: LucideIcons.Bike,
  Smile: LucideIcons.Smile,
  Heart: LucideIcons.Heart,
  Award: LucideIcons.Award,
  Star: LucideIcons.Star,
  CheckCircle2: LucideIcons.CheckCircle2,
  Default: LucideIcons.CheckSquare, // Default icon
};

export function HabitIcon({ name, className, ...props }: HabitIconProps) {
  const IconComponent = iconMap[name] || iconMap['Default'];
  return <IconComponent className={className} {...props} />;
}

export const availableIcons = Object.keys(iconMap).filter(key => key !== 'Default');
