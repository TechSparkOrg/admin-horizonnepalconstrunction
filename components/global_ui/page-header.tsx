"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionOutlined?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionOutlined,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const actionBtn = actionLabel ? (
    <Button
      onClick={onAction}
      className={
        actionOutlined
          ? "text-sidebar-primary border-sidebar-primary/20"
          : "bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
      }
      variant={actionOutlined ? "outline" : "default"}
      size="sm"
    >
      <Plus className="w-4 h-4" /> {actionLabel}
    </Button>
  ) : null;

  return (
    <div className={cn("px-4", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {!actions && actionBtn}
        </div>
      </div>
      {children}
    </div>
  );
}
