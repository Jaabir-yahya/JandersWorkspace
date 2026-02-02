import { cn } from "../../lib/utils";
import type { InputProps } from "../../types";

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  className,
}: InputProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 rounded-lg border text-lg",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
          "min-h-[48px]",
        )}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
