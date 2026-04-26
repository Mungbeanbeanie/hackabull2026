"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { politicians } from "@/features/polidex/data/politicians";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

import { ImageWithFallback } from "./figma/image-with-fallback";
import { BrandLogo } from "./ui/brand-logo";

export function Landing({ onInit }: { onInit: () => void }) {
  const [phase, setPhase] = useState<"idle" | "clicked">("idle");

  const handleInit = () => {
    setPhase("clicked");
    setTimeout(onInit, 300);
  };

  const cardW = 132;
  const gap = 32;
  const railPoliticians = politicians.slice(0, 12);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white" style={{ fontFamily: FONT_SANS }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#E2E5E9 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 pt-8" style={{ paddingTop: 28 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 120,
            zIndex: 5,
            background: "linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 120,
            zIndex: 5,
            background: "linear-gradient(to left, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: railPoliticians.length * 10, ease: "linear", repeat: Infinity }}
          style={{ display: "flex", willChange: "transform", width: "max-content" }}
        >
          <div style={{ display: "flex", gap, paddingLeft: 24, paddingRight: 24 }}>
            {railPoliticians.map((p, i) => (
              <div key={`top1-${p.id}-${i}`} style={{ flexShrink: 0, width: cardW }}>
                <div
                  style={{
                    width: cardW,
                    height: 168,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #E2E5E9",
                    background: "#F8F9FA",
                    boxShadow: "0 8px 24px rgba(13,15,18,0.06)",
                  }}
                >
                  <ImageWithFallback
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ objectFit: "cover", filter: "grayscale(0.2) contrast(1.04)" }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0D0F12",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap, paddingLeft: 24, paddingRight: 24 }}>
            {railPoliticians.map((p, i) => (
              <div key={`top2-${p.id}-${i}`} style={{ flexShrink: 0, width: cardW }}>
                <div
                  style={{
                    width: cardW,
                    height: 168,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #E2E5E9",
                    background: "#F8F9FA",
                    boxShadow: "0 8px 24px rgba(13,15,18,0.06)",
                  }}
                >
                  <ImageWithFallback
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ objectFit: "cover", filter: "grayscale(0.2) contrast(1.04)" }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0D0F12",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <BrandLogo size="lg" />
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "#0D0F12",
              maxWidth: 760,
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 18,
            }}
          >
            See the gap between what they <em style={{ fontStyle: "italic", color: "#1565C0" }}>say</em> and what they <em style={{ fontStyle: "italic", color: "#C84B00" }}>do</em>.
          </h1>
          <p style={{ fontSize: 14, color: "#4B5260", lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto", marginBottom: 32 }}>
            A clinical dashboard for civic analysis. Compare promises against voting records,
            surface the donors driving each decision, and read every politician at a glance.
          </p>
        </motion.div>

        <motion.button
          onClick={handleInit}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={phase === "idle" ? { scale: 1, opacity: 1 } : { scale: [1, 1.15, 1], opacity: 1 }}
          transition={
            phase === "idle"
              ? { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
              : { duration: 0.3, ease: "easeInOut" }
          }
          whileHover={phase === "idle" ? { scale: 1.08 } : undefined}
          whileTap={phase === "idle" ? { scale: 0.97 } : undefined}
          style={{
            background: "#0D0F12",
            color: "white",
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 500,
            padding: "13px 28px",
            borderRadius: 8,
            border: "none",
            letterSpacing: "0.16em",
            cursor: "pointer",
            textTransform: "uppercase",
            boxShadow: "0 12px 32px rgba(13,15,18,0.18)",
          }}
        >
          [ Initialize ]
        </motion.button>
      </div>

      <div className="relative pb-14 pt-3 md:pb-16" style={{ paddingTop: 12 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 200,
            zIndex: 5,
            background: "linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 200,
            zIndex: 5,
            background: "linear-gradient(to left, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: railPoliticians.length * 8, ease: "linear", repeat: Infinity }}
          style={{ display: "flex", willChange: "transform", width: "max-content" }}
        >
          <div style={{ display: "flex", gap, paddingLeft: 24, paddingRight: 24 }}>
            {railPoliticians.map((p, i) => (
              <div key={`bot1-${p.id}-${i}`} style={{ flexShrink: 0, width: cardW }}>
                <div
                  style={{
                    width: cardW,
                    height: 168,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #E2E5E9",
                    background: "#F8F9FA",
                    boxShadow: "0 8px 24px rgba(13,15,18,0.06)",
                  }}
                >
                  <ImageWithFallback
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ objectFit: "cover", filter: "grayscale(0.2) contrast(1.04)" }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0D0F12",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap, paddingLeft: 24, paddingRight: 24 }}>
            {railPoliticians.map((p, i) => (
              <div key={`bot2-${p.id}-${i}`} style={{ flexShrink: 0, width: cardW }}>
                <div
                  style={{
                    width: cardW,
                    height: 168,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #E2E5E9",
                    background: "#F8F9FA",
                    boxShadow: "0 8px 24px rgba(13,15,18,0.06)",
                  }}
                >
                  <ImageWithFallback
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ objectFit: "cover", filter: "grayscale(0.2) contrast(1.04)" }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0D0F12",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
