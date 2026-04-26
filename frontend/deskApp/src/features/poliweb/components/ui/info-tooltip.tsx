"use client";

import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InfoTooltip({
  children,
  content,
  disabled = false,
}: {
  children: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={80}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-none bg-[#0D0F12] px-2.5 py-1.5 text-[11px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
