"use client";

import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

interface SelectFilterProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export function SelectFilter<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: SelectFilterProps<T>) {
  const fontSizes = { sm: 11, md: 12 };
  
  return (
    <div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: "#8A919E",
          letterSpacing: "0.09em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-md border border-[#E2E5E9] bg-white px-2 py-2 outline-none focus:border-[#0D0F12] transition-colors"
        style={{ fontFamily: FONT_SANS, fontSize: fontSizes[size], color: "#1E2734" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
