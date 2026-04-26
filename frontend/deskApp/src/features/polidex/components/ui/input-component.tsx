"use client";

import { ReactNode } from "react";
import { FONT_SANS } from "@/features/polidex/lib/style";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  monospace?: boolean;
  size?: "sm" | "md";
}

const sizeStyles: Record<"sm" | "md", { px: string; py: string; fontSize: number }> = {
  sm: { px: "px-2.5", py: "py-1.5", fontSize: 10 },
  md: { px: "px-3", py: "py-2", fontSize: 12 },
};

export function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  monospace = false,
  size = "sm",
}: InputProps) {
  const sizeStyle = sizeStyles[size];
  
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded-md border border-[#D8DEE7] bg-white outline-none focus:border-[#0D0F12] transition-colors ${sizeStyle.px} ${sizeStyle.py} ${className}`}
      style={{ fontFamily: monospace ? "monospace" : FONT_SANS, fontSize: sizeStyle.fontSize, color: "#1B2533" }}
    />
  );
}
