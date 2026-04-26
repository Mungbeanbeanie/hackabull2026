"use client";

import { motion } from "motion/react";

import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

type ProfileSide = "left" | "right";
const LOADING_BLOCK_IDS = ["a", "b", "c", "d"] as const;

export function ProfileLoadingPanel({ side = "right" }: Readonly<{ side?: ProfileSide }>) {
  return (
    <motion.div
      initial={{ x: side === "right" ? 520 : -520, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: side === "right" ? 520 : -520, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: side === "left" ? 0 : "auto",
        right: side === "right" ? 0 : "auto",
        height: "100vh",
        width: 520,
        maxWidth: "100vw",
        background: "#FFFFFF",
        borderLeft: side === "right" ? "1px solid #E2E5E9" : "none",
        borderRight: side === "left" ? "1px solid #E2E5E9" : "none",
        boxShadow: side === "right" ? "-12px 0 32px rgba(13,15,18,0.06)" : "12px 0 32px rgba(13,15,18,0.06)",
        zIndex: 20,
      }}
    >
      <div className="border-b border-[#E2E5E9] px-6 pb-5 pt-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="h-8 w-8 rounded-md bg-[#F1F3F5]" />
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: "#8A919E", paddingTop: 4 }}>Profile</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#F1F3F5]" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-3/5 rounded bg-[#F1F3F5]" />
            <div className="mt-2 h-4 w-4/5 rounded bg-[#F1F3F5]" />
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.08em" }}>Loading profile...</div>
        {LOADING_BLOCK_IDS.map((id, index) => (
          <motion.div
            key={`profile-loading-block-${id}`}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 1.3, delay: index * 0.08, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl border border-[#E8EBEF] bg-[#FAFBFC] p-4"
          >
            <div className="h-4 w-1/3 rounded bg-[#ECEFF3]" />
            <div className="mt-3 h-3 w-full rounded bg-[#ECEFF3]" />
            <div className="mt-2 h-3 w-5/6 rounded bg-[#ECEFF3]" />
            <div className="mt-2 h-3 w-2/3 rounded bg-[#ECEFF3]" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
