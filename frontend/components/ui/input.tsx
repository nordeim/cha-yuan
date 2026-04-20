import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-ivory-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent",
          error && "border-terra-500 focus:ring-terra-500",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-terra-500">{error}</p> : null}
    </div>
  );
}
