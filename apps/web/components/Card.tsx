import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ children, interactive = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-baobab-200 shadow-sm
        ${interactive ? 'cursor-pointer hover:shadow-md hover:border-acacia-300 hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-baobab-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-baobab-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
