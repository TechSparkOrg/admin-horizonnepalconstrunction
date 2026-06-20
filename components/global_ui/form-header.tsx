"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSave?: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
  saveAsSubmit?: boolean;
  saveForm?: string;
  className?: string;
}

export function FormHeader({
  breadcrumb,
  title,
  subtitle,
  onBack,
  onSave,
  saving = false,
  saveDisabled = false,
  saveLabel,
  saveAsSubmit,
  saveForm,
  className,
}: FormHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div>
          {breadcrumb && (
            <p className="text-xs text-gray-500 mb-0.5">{breadcrumb}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-none">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {onSave && (
        <Button
          onClick={onSave}
          disabled={saveDisabled || saving}
          type={saveAsSubmit ? "submit" : "button"}
          form={saveForm}
          className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : saveLabel || "Save"}
        </Button>
      )}
    </div>
  );
}
