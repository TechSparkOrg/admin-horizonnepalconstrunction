"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface NumericInputProps {
  value: number;
  onCommit: (n: number) => void;
  className?: string;
  min?: number;
  placeholder?: string;
}

export function NumericInput({ value, onCommit, className, min = 0, placeholder = "Enter value" }: NumericInputProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const displayed = editing ? text : (value === 0 ? "" : String(value));
  return (
    <Input
      type="text"
      inputMode="decimal"
      className={className}
      value={displayed}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || /^-?\d*\.?\d*$/.test(v)) setText(v);
      }}
      onFocus={(e) => { setEditing(true); setText(value === 0 ? "" : String(value)); e.target.select(); }}
      onBlur={() => {
        setEditing(false);
        const n = parseFloat(text);
        onCommit(isNaN(n) ? 0 : Math.max(min, n));
      }}
    />
  );
}
