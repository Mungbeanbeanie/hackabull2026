"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

interface SelectFilterProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export function SelectFilter<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: Readonly<SelectFilterProps<T>>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fontSizes = useMemo(() => ({ sm: 11, md: 12 }), []);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative min-w-0">
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
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#E2E5E9] bg-white px-3 py-2 text-left shadow-[0_1px_2px_rgba(13,15,18,0.04)] transition-colors hover:border-[#C5CBD3]"
        style={{ fontFamily: FONT_SANS, fontSize: fontSizes[size], color: "#1E2734" }}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? label}</span>
        <ChevronDown size={13} style={{ flexShrink: 0, color: "#6A7280", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 140ms" }} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#D8DEE7] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
          <div className="max-h-64 overflow-y-auto p-1">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: fontSizes[size],
                    color: active ? "#0D0F12" : "#334155",
                    background: active ? "#EEF5FF" : "transparent",
                  }}
                >
                  <span>{option.label}</span>
                  {active && <span style={{ fontSize: 10, color: "#1565C0", fontWeight: 600 }}>Selected</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
