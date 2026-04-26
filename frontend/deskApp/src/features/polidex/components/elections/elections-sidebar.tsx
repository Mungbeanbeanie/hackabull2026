"use client";

import { upcomingElections } from "@/features/polidex/data/elections";
import { ElectionCard } from "./election-card";

const FONT_MONO = "ui-monospace, 'Fira Mono', monospace";
const FONT_SANS = "Inter, system-ui, sans-serif";

export function ElectionsSidebar({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: 288,
        flexShrink: 0,
        height: "100%",
        background: "#F8F9FA",
        borderLeft: "1px solid #E2E5E9",
        overflowY: "auto",
        padding: 16,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: "#8A919E",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Upcoming Elections
      </div>

      <div style={{ flex: 1 }}>
        {upcomingElections.map((election) => (
          <ElectionCard key={election.id} election={election} onSelect={onSelect} />
        ))}
      </div>

      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          color: "#8A919E",
          fontStyle: "italic",
          marginTop: 16,
          lineHeight: 1.5,
        }}
      >
        Pro Demo Note: Election events are mocked for April 2026 demo purposes, but candidate cards
        are dynamically fetched from the live SearchController. Click any candidate to run vector
        analysis.
      </p>
    </aside>
  );
}
