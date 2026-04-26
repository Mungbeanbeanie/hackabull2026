"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";

import { Politician } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { FONT_MONO, FONT_SANS, consistencyColor, consistencyLabel } from "@/features/polidex/lib/style";

import { ImageWithFallback } from "./figma/image-with-fallback";

type RadarMode = "intent" | "actual" | "both";

export function LogicProfile({
  entity,
  onClose,
}: {
  entity: Politician | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {entity && (
        <motion.div
          initial={{ x: 520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 520, opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: 520,
            maxWidth: "100vw",
            background: "#FFFFFF",
            borderLeft: "1px solid #E2E5E9",
            overflowY: "auto",
            boxShadow: "-12px 0 32px rgba(13,15,18,0.06)",
            zIndex: 20,
          }}
        >
          <Header entity={entity} onClose={onClose} />
          <ScalarGauge entity={entity} />
          <RadarSection entity={entity} />
          <InfluenceTree entity={entity} />
          <TrajectoryCard entity={entity} />
          <NutritionLabel entity={entity} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ entity, onClose }: { entity: Politician; onClose: () => void }) {
  return (
    <div className="border-b border-[#E2E5E9] px-6 pb-5 pt-5">
      <div className="mb-4 flex items-start justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8A919E" }}
        >
          <ArrowRight size={16} />
        </button>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: "#8A919E", paddingTop: 4 }}>Profile</div>
      </div>
      <div className="flex items-center gap-4">
        <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
          <ImageWithFallback
            src={entity.photo}
            alt={entity.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: "#0D0F12" }}>{entity.name}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#4B5260", marginTop: 4 }}>
            {entity.party === "R" ? "Republican" : entity.party === "D" ? "Democrat" : "Independent"} - {entity.district} - {entity.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScalarGauge({ entity }: { entity: Politician }) {
  const score = entity.w;
  const color = consistencyColor(score);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);

  return (
    <div className="border-b border-[#E2E5E9] px-6 py-5">
      <SectionLabel>How often promises match votes</SectionLabel>
      <div className="mt-3 flex items-center gap-5">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={radius} stroke="#E2E5E9" strokeWidth={6} fill="none" />
          <circle
            cx={60}
            cy={60}
            r={radius}
            stroke={color}
            strokeWidth={6}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x={60} y={66} textAnchor="middle" style={{ fontFamily: FONT_SANS, fontSize: 18, fill: color, fontWeight: 500 }}>
            {Math.round(score * 100)}%
          </text>
        </svg>

        <div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#0D0F12" }}>
            {Math.round(score * 100)}% Consistent
          </div>
          <div style={{ fontSize: 13, color: "#4B5260", marginTop: 4, lineHeight: 1.5, maxWidth: 240, fontFamily: FONT_SANS }}>
            Their voting record matches their campaign promises {Math.round(score * 100)}% of the time.
            <span style={{ color, fontWeight: 500 }}> {consistencyLabel(score)} reliability.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarSection({ entity }: { entity: Politician }) {
  const [mode, setMode] = useState<RadarMode>("both");

  const data = taxonomy.map((topic, i) => ({
    dim: topic.name,
    name: topic.name,
    intent: entity.vector_stated[i],
    actual: entity.vector_actual[i],
  }));

  const conflicts = data.filter((d) => Math.abs(d.intent - d.actual) >= 1);

  return (
    <div className="border-b border-[#E2E5E9] px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Promises vs. Votes - by issue</SectionLabel>
        <div style={{ display: "flex", background: "#F8F9FA", border: "1px solid #E2E5E9", borderRadius: 8, padding: 2 }}>
          {[
            { mode: "intent" as RadarMode, label: "Promised" },
            { mode: "actual" as RadarMode, label: "Actual" },
            { mode: "both" as RadarMode, label: "Compare" },
          ].map((tab) => {
            const active = mode === tab.mode;
            const color = tab.mode === "intent" ? "#1565C0" : tab.mode === "actual" ? "#C84B00" : "#0D0F12";
            return (
              <button
                key={tab.mode}
                onClick={() => setMode(tab.mode)}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#FFFFFF" : "transparent",
                  boxShadow: active ? "0 0 0 1px #C5CBD3" : "none",
                  color: active ? color : "#8A919E",
                  fontWeight: 500,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ width: "100%", height: 260, marginTop: 8 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="#E2E5E9" />
            <PolarAngleAxis dataKey="dim" tick={{ fill: "#8A919E", fontSize: 9, fontFamily: FONT_MONO }} />
            {(mode === "intent" || mode === "both") && (
              <Radar dataKey="intent" stroke="#1565C0" fill="#1565C0" fillOpacity={0.12} strokeWidth={1.5} />
            )}
            {(mode === "actual" || mode === "both") && (
              <Radar dataKey="actual" stroke="#C84B00" fill="#C84B00" fillOpacity={0.18} strokeWidth={1.5} />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex items-center gap-4">
        <Legend swatch="#1565C0" label="Promised" />
        <Legend swatch="#C84B00" label="Actual" />
        <div style={{ marginLeft: "auto", fontFamily: FONT_SANS, fontSize: 11, color: conflicts.length ? "#991B1B" : "#8A919E" }}>
          {conflicts.length} {conflicts.length === 1 ? "issue" : "issues"} flagged
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="mt-4 space-y-2">
          {conflicts.slice(0, 2).map((conflict) => (
            <AlertStrip
              key={conflict.dim}
              title={conflict.name}
              body={`Said ${conflict.intent}/5, voted ${conflict.actual}/5 - gap of ${Math.abs(conflict.intent - conflict.actual)}.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertStrip({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ borderLeft: "3px solid #991B1B", background: "#991B1B0D", borderRadius: "0 8px 8px 0", padding: "8px 12px" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#991B1B", fontWeight: 500, letterSpacing: "0.06em" }}>{title}</div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#0D0F12", marginTop: 2 }}>{body}</div>
    </div>
  );
}

function InfluenceTree({ entity }: { entity: Politician }) {
  const width = 472;
  const leftPad = 24;

  const tierColor = (tier: number) => {
    if (tier === 2) return "#5C35C9";
    if (tier === 3) return "#1565C0";
    return "#C84B00";
  };

  const tierName = (tier: number) => {
    if (tier === 2) return "Family";
    if (tier === 3) return "Corporate";
    return "Super PAC";
  };

  const maxAmount = Math.max(...entity.donors.map((d) => d.amount));
  const donors = [...entity.donors].sort((a, b) => b.amount - a.amount);

  const rowHeight = 56;
  const headerY = 36;
  const startY = headerY + 28;
  const lastY = startY + (donors.length - 1) * rowHeight;
  const targetY = lastY + 80;
  const targetX = width - 110;

  return (
    <div className="px-6 py-5">
      <SectionLabel>Who funds them</SectionLabel>
      <svg width="100%" viewBox={`0 0 ${width} ${targetY + 50}`} style={{ marginTop: 10, overflow: "visible" }}>
        <text x={leftPad} y={20} style={{ fontFamily: FONT_SANS, fontSize: 11, fill: "#8A919E" }}>
          Top backers
        </text>
        <text x={width - leftPad} y={20} textAnchor="end" style={{ fontFamily: FONT_SANS, fontSize: 11, fill: "#8A919E" }}>
          Contribution
        </text>

        {donors.map((donor, i) => {
          const y = startY + i * rowHeight;
          const lineWidth = (donor.amount / maxAmount) * 3 + 1;
          const color = tierColor(donor.tier);
          const cx = leftPad + 8;
          const midX = targetX - 60;
          const midY = (y + targetY) / 2;
          const path = `M ${cx + 6} ${y} C ${midX} ${y}, ${midX} ${midY}, ${targetX - 30} ${targetY - 14}`;

          return (
            <g key={donor.name}>
              <path d={path} stroke={color} strokeOpacity={0.55} strokeWidth={lineWidth} fill="none" />
              <circle cx={cx} cy={y} r={6} fill={color} />
              <circle cx={cx} cy={y} r={11} fill={color} fillOpacity={0.12} />

              <text x={cx + 18} y={y - 3} style={{ fontFamily: FONT_SANS, fontSize: 13, fill: "#0D0F12", fontWeight: 500 }}>
                {donor.name}
              </text>
              <text x={cx + 18} y={y + 12} style={{ fontFamily: FONT_SANS, fontSize: 11, fill: "#8A919E" }}>
                {tierName(donor.tier)} - influences {donor.dimensions.map((id) => issueName(id)).join(", ")}
              </text>
              <text
                x={width - leftPad}
                y={y + 4}
                textAnchor="end"
                style={{ fontFamily: FONT_SANS, fontSize: 12, fill: "#1A1D23", fontWeight: 500 }}
              >
                ${(donor.amount / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        <g>
          <rect x={targetX - 60} y={targetY - 30} width={120} height={42} rx={10} fill="#0D0F12" />
          <text x={targetX} y={targetY - 8} textAnchor="middle" style={{ fontFamily: FONT_SANS, fontSize: 13, fill: "#FFFFFF", fontWeight: 500 }}>
            {entity.name.split(" ").slice(-1)[0]}
          </text>
          <text x={targetX} y={targetY + 8} textAnchor="middle" style={{ fontFamily: FONT_SANS, fontSize: 10, fill: "#8A919E" }}>
            {entity.party === "R" ? "Republican" : entity.party === "D" ? "Democrat" : "Independent"}
          </text>
        </g>
      </svg>

      <div className="mt-3 flex items-center gap-4">
        <Legend swatch="#5C35C9" label="Family" />
        <Legend swatch="#1565C0" label="Corporate" />
        <Legend swatch="#C84B00" label="Super PAC" />
      </div>
    </div>
  );
}

function TrajectoryCard({ entity }: { entity: Politician }) {
  const seed = entity.id.length;
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = entity.donors.reduce((sum, donor) => sum + donor.amount, 0) / 5;
    const noise = Math.sin((i + seed) * 1.3) * 0.4 + 0.6;
    return base * noise * (0.6 + i / 18);
  });

  const max = Math.max(...points);
  const min = Math.min(...points);

  const width = 472;
  const height = 70;
  const pad = 6;

  const path = points
    .map((v, i) => {
      const x = pad + (i / (points.length - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const trend = points[points.length - 1] > points[0] ? "rising" : "cooling";
  const nextMove = entity.role.includes("House")
    ? "U.S. Senate run within 2 cycles"
    : entity.role.includes("Senate")
      ? "Cabinet-level positioning"
      : "Re-election favored";

  return (
    <div className="border-t border-[#E2E5E9] px-6 py-5">
      <SectionLabel>Where they&apos;re headed</SectionLabel>
      <div className="mt-3 flex items-center gap-4">
        <svg width={180} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: 180 }}>
          <path d={path} stroke="#1565C0" strokeWidth={1.5} fill="none" />
          <path d={`${path} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`} fill="#1565C0" fillOpacity={0.08} />
        </svg>
        <div className="flex-1">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>Fundraising is {trend}.</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4B5260", marginTop: 4, lineHeight: 1.5 }}>
            Likely next move: {nextMove}.
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionLabel({ entity }: { entity: Politician }) {
  const gaps = taxonomy
    .map((topic, i) => ({
      name: topic.name,
      delta: Math.abs(entity.vector_stated[i] - entity.vector_actual[i]),
      id: topic.id,
    }))
    .sort((a, b) => b.delta - a.delta);

  const topGap = gaps[0];
  const topDonor = entity.donors.find((donor) => donor.dimensions.includes(topGap.id));

  return (
    <div className="border-t border-[#E2E5E9] bg-[#F8F9FA] px-6 py-5">
      <SectionLabel>If you saw this in a news article...</SectionLabel>
      <div
        style={{
          marginTop: 12,
          background: "#FFFFFF",
          border: "1px solid #C5CBD3",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 6px 18px rgba(13,15,18,0.06)",
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginBottom: 6 }}>Quick read</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 500, color: "#0D0F12" }}>{entity.name}</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4B5260", marginTop: 2 }}>
          {entity.party === "R" ? "Republican" : entity.party === "D" ? "Democrat" : "Independent"} - {entity.district}
        </div>

        <div className="mt-3" style={{ display: "flex", gap: 16 }}>
          <Stat label="Consistency" value={`${Math.round(entity.w * 100)}%`} color={consistencyColor(entity.w)} />
          <Stat label="Biggest gap" value={topGap.name} />
          <Stat label="Top backer" value={entity.donors[0].name} />
        </div>

        {topDonor && (
          <div style={{ marginTop: 12, borderLeft: "3px solid #991B1B", background: "#991B1B0D", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#991B1B", fontWeight: 500 }}>Possible conflict</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#0D0F12", marginTop: 2, lineHeight: 1.45 }}>
              {topDonor.name} is a top backer and influences <em>{topGap.name}</em> - the issue with the largest gap between promise and vote.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#8A919E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: color ?? "#0D0F12", fontWeight: 500, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

function issueName(id: string): string {
  const map: Record<string, string> = {
    p1: "Markets",
    p2: "Spending",
    p3: "Taxes",
    p4: "Energy",
    p5: "Education",
    p6: "Immigration",
    p7: "Reproductive",
    p8: "Guns",
    p9: "Healthcare",
    p10: "Climate",
    p11: "Foreign Policy",
    p12: "Defense",
    p13: "Civil Liberties",
    p14: "Voting",
    p15: "Labor",
    p16: "Housing",
    p17: "Tech",
    p18: "Justice",
    p19: "Environment",
    p20: "Culture",
  };
  return map[id] ?? id;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: "#8A919E",
      }}
    >
      {children}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 8, height: 8, borderRadius: 999, background: swatch }} />
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.06em", color: "#4B5260" }}>{label}</div>
    </div>
  );
}
