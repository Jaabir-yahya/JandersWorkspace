import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-baobab-700 mb-2">
            {label}
            {props.required && <span className="text-clay-600 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 bg-white border rounded-lg text-baobab-900 
            transition-all duration-200
            hover:border-baobab-300 
            focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none
            disabled:bg-baobab-50 disabled:cursor-not-allowed
            ${error ? 'border-clay-500 focus:border-clay-500 focus:ring-clay-200' : 'border-baobab-200'}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-clay-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-baobab-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
