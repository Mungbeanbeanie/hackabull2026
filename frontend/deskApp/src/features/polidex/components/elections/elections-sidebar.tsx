"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Election } from "@/features/polidex/types";
import { ElectionCard } from "./election-card";

const FONT_MONO = "ui-monospace, 'Fira Mono', monospace";
const FONT_SANS = "Inter, system-ui, sans-serif";

const STATE_OPTIONS = [
  { value: "ALL", label: "All States" },
  { value: "National", label: "National" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];
const ELECTION_SKELETON_IDS = ["one", "two", "three"] as const;

export function ElectionsSidebar({ onSelect }: Readonly<{ onSelect: (id: string, side: "left" | "right") => void }>) {
  const [selectedState, setSelectedState] = useState("ALL");
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    let cancelled = false;

    import("@/features/polidex/data/elections")
      .then(({ upcomingElections: loadedUpcomingElections }) => {
        if (!cancelled) {
          setUpcomingElections(loadedUpcomingElections);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = upcomingElections.filter(
    (e) => selectedState === "ALL" || e.state === selectedState,
  );

  const visibleElections = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  let bodyContent: ReactNode;

  if (isLoading) {
    bodyContent = (
      <div className="space-y-3 pt-1">
        {ELECTION_SKELETON_IDS.map((id) => (
          <div key={`election-skeleton-${id}`} className="rounded-xl border border-[#E2E5E9] bg-white p-4">
            <div className="h-4 w-3/4 rounded bg-[#EDF0F4]" />
            <div className="mt-2 h-3 w-1/3 rounded bg-[#EDF0F4]" />
            <div className="mt-4 h-14 rounded bg-[#F6F8FA]" />
            <div className="mt-4 flex gap-2">
              <div className="h-16 w-20 rounded-lg bg-[#F3F5F8]" />
              <div className="h-16 w-20 rounded-lg bg-[#F3F5F8]" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (filtered.length === 0) {
    bodyContent = (
      <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#8A919E", marginTop: 8 }}>
        No elections found for this state.
      </div>
    );
  } else {
    bodyContent = (
      <>
        {visibleElections.map((election) => (
          <ElectionCard key={election.id} election={election} onSelect={onSelect} />
        ))}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((current) => Math.min(current + 4, filtered.length))}
            className="mt-1 w-full rounded-md border border-[#D8DEE7] bg-white px-3 py-2"
            style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1C2431" }}
          >
            Load more elections ({filtered.length - visibleCount} left)
          </button>
        )}
      </>
    );
  }

  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: 576,
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: "#8A919E",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          Upcoming Elections
        </div>
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setVisibleCount(4);
          }}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: "#1C2431",
            background: "#FFFFFF",
            border: "1px solid #E2E5E9",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          {STATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1 }}>
        {bodyContent}
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
