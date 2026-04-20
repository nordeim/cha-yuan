"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-black/50" />
      {children}
    </div>
  );
}

interface SheetContentProps {
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

export function SheetContent({ side = "right", className, children }: SheetContentProps) {
  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50",
        side === "right" ? "right-0" : "left-0",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4 border-b", className)}>{children}</div>;
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function SheetFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4 border-t", className)}>{children}</div>;
}

export function SheetClose({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  if (asChild) {
    return <>{children}</>;
  }
  return <button>{children}</button>;
}
