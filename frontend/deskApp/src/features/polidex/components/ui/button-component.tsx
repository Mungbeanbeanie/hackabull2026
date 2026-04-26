"use client";

import { ReactNode } from "react";
import { FONT_SANS } from "@/features/polidex/lib/style";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#0D0F12] border-[#0D0F12] text-white",
  secondary: "bg-white border-[#E2E5E9] text-[#0D0F12]",
  tertiary: "bg-[#F8F9FA] border-[#E2E5E9] text-[#1C2431]",
};

const sizeStyles: Record<ButtonSize, { px: string; py: string; fontSize: number }> = {
  sm: { px: "px-2.5", py: "py-1.5", fontSize: 10 },
  md: { px: "px-3", py: "py-2", fontSize: 12 },
  lg: { px: "px-4", py: "py-2", fontSize: 13 },
};

export function Button({
  onClick,
  disabled = false,
  variant = "primary",
  size = "sm",
  children,
  className = "",
  title,
  ariaLabel,
}: ButtonProps) {
  const sizeStyle = sizeStyles[size];
  const baseClass = `rounded-md border ${variantStyles[variant]} ${sizeStyle.px} ${sizeStyle.py} transition-all`;
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`${baseClass} ${disabledClass} ${className}`}
      style={{ fontFamily: FONT_SANS, fontSize: sizeStyle.fontSize }}
    >
      {children}
    </button>
  );
}
