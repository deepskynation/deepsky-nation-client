import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ id, label, children, className }: FormFieldProps) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <label htmlFor={id} className="text-sm font-medium text-black/80">
        {label}
      </label>
      {children}
    </div>
  );
}
