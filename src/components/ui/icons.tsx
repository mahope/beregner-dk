import { getCalculatorIcon, getCategoryVisual } from "@/lib/icons";

const DEFAULT_STROKE_WIDTH = 1.75;

interface CalcIconProps {
  href: string;
  className?: string;
}

export function CalcIcon({ href, className }: CalcIconProps) {
  const Icon = getCalculatorIcon(href);
  return (
    <Icon
      className={className ?? "h-6 w-6"}
      strokeWidth={DEFAULT_STROKE_WIDTH}
      aria-hidden="true"
      focusable="false"
    />
  );
}

interface CategoryIconProps {
  name: string;
  className?: string;
  withColor?: boolean;
}

export function CategoryIcon({ name, className, withColor = true }: CategoryIconProps) {
  const visual = getCategoryVisual(name);
  const Icon = visual.icon;
  return (
    <Icon
      className={className ? `${withColor ? visual.color + " " : ""}${className}` : `h-5 w-5 ${visual.color}`}
      strokeWidth={DEFAULT_STROKE_WIDTH}
      aria-hidden="true"
      focusable="false"
    />
  );
}

export function getCategoryColor(name: string): string {
  return getCategoryVisual(name).color;
}
