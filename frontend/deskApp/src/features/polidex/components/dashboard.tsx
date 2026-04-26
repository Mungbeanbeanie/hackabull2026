"use client";

import { type MouseEvent, Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { Politician } from "@/features/polidex/data/politicians";
import { districtLabel, levelLabel, locationLabel, partyLabel } from "@/features/polidex/lib/display";
import { FONT_MONO, FONT_SANS, consistencyColor, consistencyLabel } from "@/features/polidex/lib/style";
import { resolveProfileSide } from "./compare/utils";
import { SelectFilter } from "./ui/select-filter";

import { ImageWithFallback } from "./figma/image-with-fallback";

const ElectionsSidebar = lazy(() =>
  import("./elections/elections-sidebar").then((module) => ({ default: module.ElectionsSidebar })),
);

type Sort = "drift" | "adherence" | "name" | "office";
type PartyFilter = "ALL" | "R" | "D" | "I";
type LevelFilter = "ALL" | "Federal" | "State";
type StateFilter = "ALL" | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";
type RoleFilter = "ALL" | Politician["role"];
type ConsistencyFilter = "ALL" | "HIGH" | "MID" | "LOW";
type DriftFilter = "ALL" | "LOW" | "MID" | "HIGH";
type DonorFilter = "ALL" | "LOW" | "MID" | "HIGH";
type ExposureFilter = "ALL" | "LOCAL" | "STATEWIDE";
type ProfileSide = "left" | "right";

export function Dashboard({
  list,
  selectedId,
  onSelect,
  isLoading: externalIsLoading,
}: Readonly<{
  list: Politician[];
  selectedId: string | null;
  onSelect: (id: string, side: ProfileSide) => void;
  isLoading?: boolean;
}>) {
  const [isMountLoading, setIsMountLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsMountLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = externalIsLoading || isMountLoading;

  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [level, setLevel] = useState<LevelFilter>("ALL");
  const [stateFilter, setStateFilter] = useState<StateFilter>("ALL");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [exposure, setExposure] = useState<ExposureFilter>("ALL");
  const [consistency, setConsistency] = useState<ConsistencyFilter>("ALL");
  const [drift, setDrift] = useState<DriftFilter>("ALL");
  const [donors, setDonors] = useState<DonorFilter>("ALL");
  const [sort, setSort] = useState<Sort>("drift");

  const activeFilterCount =
    Number(party !== "ALL") +
    Number(level !== "ALL") +
    Number(stateFilter !== "ALL") +
    Number(role !== "ALL") +
    Number(exposure !== "ALL") +
    Number(consistency !== "ALL") +
    Number(drift !== "ALL") +
    Number(donors !== "ALL");

  const filtered = useMemo(() => {
    let result = list.filter((p) => {
      if (party !== "ALL" && p.party !== party) return false;
      if (level !== "ALL" && levelLabel(p.role) !== level) return false;
      if (stateFilter !== "ALL" && p.state !== stateFilter) return false;
      if (role !== "ALL" && p.role !== role) return false;
      if (exposure === "LOCAL" && p.region === "Statewide") return false;
      if (exposure === "STATEWIDE" && p.region !== "Statewide") return false;
      if (consistency === "HIGH" && p.w < 0.96) return false;
      if (consistency === "MID" && (p.w < 0.92 || p.w >= 0.96)) return false;
      if (consistency === "LOW" && p.w >= 0.92) return false;

      const avgDrift = averageDrift(p);
      if (drift === "LOW" && avgDrift > 0.5) return false;
      if (drift === "MID" && (avgDrift <= 0.5 || avgDrift > 1.25)) return false;
      if (drift === "HIGH" && avgDrift <= 1.25) return false;

      const donorBand = donationBand(p);
      if (donors !== "ALL" && donorBand !== donors) return false;

      if (
        q &&
        !(
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          districtLabel(p.district).toLowerCase().includes(q.toLowerCase()) ||
          p.role.toLowerCase().includes(q.toLowerCase()) ||
          locationLabel(p).toLowerCase().includes(q.toLowerCase()) ||
          p.state.toLowerCase().includes(q.toLowerCase()) ||
          partyLabel(p.party).toLowerCase().includes(q.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });

    if (sort === "drift") result = [...result].sort((a, b) => a.w - b.w);
    if (sort === "adherence") result = [...result].sort((a, b) => b.w - a.w);
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "office") result = [...result].sort((a, b) => a.role.localeCompare(b.role));

    return result;
  }, [list, q, party, level, stateFilter, role, exposure, consistency, drift, donors, sort]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="border-b border-[#E2E5E9] px-5 pb-4 pt-6 md:px-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between">
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#0D0F12" }}>Politicians</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>Showing {filtered.length} of {list.length}</div>
          </div>
          <div
            className="flex w-full items-center gap-2 lg:w-[260px]"
            style={{
              background: "#F8F9FA",
              border: "1px solid #E2E5E9",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            <Search size={14} color="#8A919E" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search name, district, office, party..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: FONT_SANS,
                fontSize: 13,
                color: "#0D0F12",
              }}
            />
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
            <SelectFilter
              label="Party"
              value={party}
              size="sm"
              options={[
                { value: "ALL", label: "All parties" },
                { value: "R", label: "Republican" },
                { value: "D", label: "Democrat" },
                { value: "I", label: "Independent" },
              ]}
              onChange={setParty}
            />
            <SelectFilter
              label="Level"
              value={level}
              size="sm"
              options={[
                { value: "ALL", label: "All levels" },
                { value: "Federal", label: "Federal" },
                { value: "State", label: "State" },
              ]}
              onChange={setLevel}
            />
            <SelectFilter
              label="State"
              value={stateFilter}
              size="sm"
              options={[
                { value: "ALL", label: "All states" },
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
              ]}
              onChange={setStateFilter}
            />
            <SelectFilter
              label="Office"
              value={role}
              size="sm"
              options={[
                { value: "ALL", label: "All offices" },
                { value: "U.S. Senate", label: "U.S. Senate" },
                { value: "U.S. House", label: "U.S. House" },
                { value: "Governor", label: "Governor" },
                { value: "State Senate", label: "State Senate" },
                { value: "State House", label: "State House" },
                { value: "Statewide", label: "Statewide" },
              ]}
              onChange={setRole}
            />
            <SelectFilter
              label="Sort"
              value={sort}
              size="sm"
              options={[
                { value: "drift", label: "Biggest gap" },
                { value: "adherence", label: "Most consistent" },
                { value: "office", label: "Office" },
                { value: "name", label: "Name A-Z" },
              ]}
              onChange={setSort}
            />
            <button
              onClick={() => setFiltersOpen((value) => !value)}
              className="mt-5 flex h-[42px] items-center justify-center gap-2 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] px-3"
              style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#1C2431" }}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              <ChevronDown size={13} style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }} />
            </button>
          </div>

          {filtersOpen && (
            <dialog className="w-full rounded-xl border border-[#E2E5E9] bg-white p-4 shadow-[0_8px_24px_rgba(13,15,18,0.08)]" aria-label="All filters" open>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>Advanced Filters</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E" }}>Refine representation and behavior signals.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SelectFilter
                  label="Coverage"
                  value={exposure}
                  options={[
                    { value: "ALL", label: "Any coverage" },
                    { value: "LOCAL", label: "District only" },
                    { value: "STATEWIDE", label: "Statewide only" },
                  ]}
                  onChange={setExposure}
                />
                <SelectFilter
                  label="Consistency"
                  value={consistency}
                  options={[
                    { value: "ALL", label: "All bands" },
                    { value: "HIGH", label: "High (96%+)" },
                    { value: "MID", label: "Mid (92-95%)" },
                    { value: "LOW", label: "Low (<92%)" },
                  ]}
                  onChange={setConsistency}
                />
                <SelectFilter
                  label="Promise Drift"
                  value={drift}
                  options={[
                    { value: "ALL", label: "All drift bands" },
                    { value: "LOW", label: "Low drift" },
                    { value: "MID", label: "Medium drift" },
                    { value: "HIGH", label: "High drift" },
                  ]}
                  onChange={setDrift}
                />
                <SelectFilter
                  label="Donor Volume"
                  value={donors}
                  options={[
                    { value: "ALL", label: "Any funding" },
                    { value: "LOW", label: "Low donor volume" },
                    { value: "MID", label: "Medium donor volume" },
                    { value: "HIGH", label: "High donor volume" },
                  ]}
                  onChange={setDonors}
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setParty("ALL");
                    setLevel("ALL");
                    setStateFilter("ALL");
                    setRole("ALL");
                    setExposure("ALL");
                    setConsistency("ALL");
                    setDrift("ALL");
                    setDonors("ALL");
                    setSort("drift");
                  }}
                  className="rounded-md border border-[#E2E5E9] bg-white px-3 py-2"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4B5260" }}
                >
                  Clear all
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-md border border-[#0D0F12] bg-[#0D0F12] px-3 py-2"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#FFFFFF" }}
                >
                  Done
                </button>
              </div>
            </dialog>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8" style={{ background: "#F8F9FA" }}>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {filtered.map((politician, i) => (
                  <Card
                    key={politician.id}
                    politician={politician}
                    selected={politician.id === selectedId}
                    onClick={(event) => onSelect(politician.id, resolveProfileSide(event.clientX))}
                    index={i}
                  />
                ))}
                {filtered.length === 0 && (
                  <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#8A919E" }}>No entities match the current filters.</div>
                )}
              </>
            )}
          </div>
        </div>
        <Suspense
          fallback={
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
                justifyContent: "flex-start",
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#8A919E", marginTop: 8 }}>
                Loading upcoming elections...
              </div>
            </aside>
          }
        >
          <ElectionsSidebar onSelect={(id, side) => onSelect(id, side)} />
        </Suspense>
      </div>
    </div>
  );
}

function Card({
  politician,
  selected,
  onClick,
  index,
}: {
  politician: Politician;
  selected: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.015, 0.25) }}
      whileHover={{ y: -2 }}
      style={{
        textAlign: "left",
        background: "#FFFFFF",
        border: selected ? "1px solid #0D0F12" : "1px solid #E2E5E9",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: selected ? "0 4px 16px rgba(13,15,18,0.08)" : "none",
        transition: "border-color 150ms, box-shadow 150ms",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", gap: 12, padding: 14, flex: 1 }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#F1F3F5" }}>
          <ImageWithFallback
            src={politician.photo}
            alt={politician.name}
            loading="lazy"
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 500,
              color: "#0D0F12",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {politician.name}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", marginTop: 2, letterSpacing: "0.04em" }}>
            {partyLabel(politician.party)} - {districtLabel(politician.district)}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#4B5260", marginTop: 4 }}>
            {politician.role} · {locationLabel(politician)}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "#F1F3F5", width: "100%" }} />
      <div className="flex items-center justify-between" style={{ padding: "10px 14px", width: "100%" }}>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 6,
              background: `${consistencyColor(politician.w)}1A`,
              border: `1px solid ${consistencyColor(politician.w)}33`,
              color: consistencyColor(politician.w),
              letterSpacing: "0.02em",
              fontWeight: 500,
            }}
          >
            {Math.round(politician.w * 100)}% Consistent - {consistencyLabel(politician.w)}
          </span>
        </div>
        <div style={{ width: 80, height: 4, background: "#F1F3F5", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${politician.w * 100}%`, height: "100%", background: consistencyColor(politician.w) }} />
        </div>
      </div>
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E5E9",
        borderRadius: 12,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 126,
      }}
    >
      <div style={{ display: "flex", gap: 12, padding: 14, flex: 1 }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, background: "#F1F3F5", flexShrink: 0 }} />
        <div className="min-w-0 flex-1 py-1">
          <div style={{ height: 16, width: "70%", background: "#F1F3F5", borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 12, width: "40%", background: "#F1F3F5", borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 12, width: "50%", background: "#F1F3F5", borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 1, background: "#F1F3F5", width: "100%" }} />
      <div className="flex items-center justify-between" style={{ padding: "10px 14px", width: "100%" }}>
        <div style={{ height: 18, width: 80, background: "#F1F3F5", borderRadius: 6 }} />
        <div style={{ width: 80, height: 4, background: "#F1F3F5", borderRadius: 2 }} />
      </div>
    </motion.div>
  );
}

function averageDrift(politician: Politician): number {
  const total = politician.vector_stated.reduce((sum, value, index) => sum + Math.abs(value - politician.vector_actual[index]), 0);
  return total / politician.vector_stated.length;
}

function donationBand(politician: Politician): DonorFilter {
  const total = politician.donors.reduce((sum, donor) => sum + donor.amount, 0);
  if (total < 70000) return "LOW";
  if (total < 140000) return "MID";
  return "HIGH";
}
