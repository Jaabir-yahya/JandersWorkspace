import { cn } from "../../lib/utils";
import type { CardProps } from "../../types";

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-4",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className,
      )}
    >
      {children}
    </div>
  );
}
