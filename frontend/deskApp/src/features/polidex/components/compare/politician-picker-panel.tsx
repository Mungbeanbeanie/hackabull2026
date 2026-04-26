"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { Politician, politicians } from "@/features/polidex/data/politicians";
import { districtLabel, partyLabel, regionLabel } from "@/features/polidex/lib/display";
import { FONT_MONO, FONT_SANS, consistencyLabel } from "@/features/polidex/lib/style";
import { SelectFilter } from "../ui/select-filter";

import { ImageWithFallback } from "../figma/image-with-fallback";
import { averageDrift, resolveProfileSide } from "./utils";

type PickerProps = Readonly<{
  value: string;
  onChange: (id: string) => void;
  label: string;
  excludeIds?: string[];
  onOpenProfile?: (id: string, side: "left" | "right") => void;
  selectedProfileId?: string | null;
}>;

type PartyFilter = "ALL" | Politician["party"];
type RegionFilter = "ALL" | Politician["region"];
type RoleFilter = "ALL" | Politician["role"];
type ConsistencyFilter = "ALL" | "HIGH" | "MID" | "LOW";
type DriftFilter = "ALL" | "LOW" | "MID" | "HIGH";
type SortFilter = "name" | "alignment" | "drift";

export function SearchablePoliticianPicker({
  value,
  onChange,
  label,
  excludeIds = [],
  onOpenProfile,
  selectedProfileId,
}: PickerProps) {
  const [query, setQuery] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [consistency, setConsistency] = useState<ConsistencyFilter>("ALL");
  const [drift, setDrift] = useState<DriftFilter>("ALL");
  const [sort, setSort] = useState<SortFilter>("name");
  const selected = politicians.find((p) => p.id === value) ?? politicians[0];

  const activeFilterCount = Number(party !== "ALL") + Number(region !== "ALL") + Number(role !== "ALL") + Number(consistency !== "ALL") + Number(drift !== "ALL");

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = politicians.filter((politician) => {
      if (!matchesExclusion(politician.id, excludeIds, value)) return false;
      if (party !== "ALL" && politician.party !== party) return false;
      if (region !== "ALL" && politician.region !== region) return false;
      if (role !== "ALL" && politician.role !== role) return false;
      if (!matchesConsistency(politician.w, consistency)) return false;
      if (!matchesDrift(averageDrift(politician), drift)) return false;
      if (!q) return true;

      const searchText = [politician.name, partyLabel(politician.party), districtLabel(politician.district), politician.role, regionLabel(politician.region)]
        .join(" ")
        .toLowerCase();
      return searchText.includes(q);
    });

    const sorted = [...base].sort((a, b) => {
      if (sort === "alignment") return b.w - a.w;
      if (sort === "drift") return averageDrift(b) - averageDrift(a);
      return a.name.localeCompare(b.name);
    });

    return q ? sorted : sorted.slice(0, 18);
  }, [query, excludeIds, value, party, region, role, consistency, drift, sort]);

  return (
    <div style={{ background: "white", border: "1px solid #E2E5E9", borderRadius: 12, padding: 14 }}>
      <div className="flex items-center justify-between gap-2">
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#6A7280" }}>{candidates.length} shown</div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <div className="sm:col-span-2 xl:col-span-5">
          <div className="flex items-center gap-2 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] px-3 py-2">
            <Search size={14} color="#8A919E" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a name, office, district..."
              className="w-full bg-transparent outline-none"
              style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}
            />
          </div>
        </div>

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
          label="State"
          value={region}
          size="sm"
          options={[
            { value: "ALL", label: "All regions" },
            { value: "North FL", label: "North Florida" },
            { value: "Central FL", label: "Central Florida" },
            { value: "South FL", label: "South Florida" },
            { value: "Statewide", label: "Statewide" },
          ]}
          onChange={setRegion}
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
            { value: "name", label: "Name" },
            { value: "alignment", label: "Most consistent first" },
            { value: "drift", label: "Most drift first" },
          ]}
          onChange={setSort}
        />
        <button
          onClick={() => setAdvancedFiltersOpen((value) => !value)}
          className="mt-5 flex h-[42px] items-center justify-center gap-2 rounded-md border border-[#E2E5E9] bg-[#F8F9FA] px-3 text-[#334155]"
          style={{ fontFamily: FONT_SANS, fontSize: 11 }}
        >
          <SlidersHorizontal size={13} />
          Advanced Filters
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          <ChevronDown size={13} style={{ transform: advancedFiltersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 140ms" }} />
        </button>
      </div>

      {advancedFiltersOpen && (
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <PickerSelect
            label="Consistency"
            value={consistency}
            onChange={setConsistency}
            options={[
              { value: "ALL", label: "All bands" },
              { value: "HIGH", label: "High (96%+)" },
              { value: "MID", label: "Medium (92-95%)" },
              { value: "LOW", label: "Low (<92%)" },
            ]}
          />
          <PickerSelect
            label="Promise Drift"
            value={drift}
            onChange={setDrift}
            options={[
              { value: "ALL", label: "All drift bands" },
              { value: "LOW", label: "Low drift" },
              { value: "MID", label: "Medium drift" },
              { value: "HIGH", label: "High drift" },
            ]}
          />
        </div>
      )}

      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#E2E5E9] bg-white shadow-[0_1px_4px_rgba(13,15,18,0.04)]">
        {candidates.map((politician) => {
          const isActive = politician.id === value;
          const isSelectedProfile = selectedProfileId === politician.id;
          let rowBackground = "#FFFFFF";
          if (isSelectedProfile) {
            rowBackground = "#F8FAFC";
          }
          if (isActive) {
            rowBackground = "#EEF5FF";
          }

          return (
            <button
              key={politician.id}
              type="button"
              onClick={() => onChange(politician.id)}
              className="flex w-full items-center gap-3 border-b border-[#EEF1F5] px-3 py-3 text-left last:border-b-0"
              style={{ background: rowBackground }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
                <ImageWithFallback src={politician.photo} alt={politician.name} className="h-full w-full" style={{ objectFit: "cover" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: "#0D0F12", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {politician.name}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#6A7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {partyLabel(politician.party)} • {districtLabel(politician.district)}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {politician.role} • {regionLabel(politician.region)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    const side = resolveProfileSide(event.clientX);
                    onOpenProfile?.(politician.id, side);
                  }}
                  className="rounded-full border border-[#D8DEE7] bg-white px-2.5 py-1 text-[10px] font-medium text-[#334155]"
                  style={{ boxShadow: isSelectedProfile ? "0 0 0 1px #0D0F12 inset" : "none" }}
                >
                  Profile
                </button>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: "#1B6B3A" }}>{Math.round(politician.w * 100)}%</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#8A919E" }}>{consistencyLabel(politician.w)}</div>
                </div>
              </div>
            </button>
          );
        })}
        {candidates.length === 0 && (
          <div className="px-3 py-4" style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E" }}>
            No politicians match your search.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={(event) => onOpenProfile?.(selected.id, resolveProfileSide(event.clientX))}
        className="mt-3 flex w-full items-center gap-3 rounded-md bg-[#F8FAFC] p-2 text-left"
        style={{ cursor: onOpenProfile ? "pointer" : "default", boxShadow: selectedProfileId === selected.id ? "0 0 0 1px #0D0F12 inset" : "none" }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
          <ImageWithFallback src={selected.photo} alt={selected.name} className="h-full w-full" style={{ objectFit: "cover" }} />
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: "#0D0F12", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected.name}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 2 }}>
            {partyLabel(selected.party)} • {selected.role}
          </div>
        </div>
      </button>
    </div>
  );
}

function PickerSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: Readonly<{
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}>) {
  return (
    <div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-md border border-[#E2E5E9] bg-white px-2 py-1.5"
        style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}
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

function matchesConsistency(score: number, consistency: ConsistencyFilter) {
  switch (consistency) {
    case "HIGH":
      return score >= 0.96;
    case "MID":
      return score >= 0.92 && score < 0.96;
    case "LOW":
      return score < 0.92;
    default:
      return true;
  }
}

function matchesDrift(avgDrift: number, drift: DriftFilter) {
  switch (drift) {
    case "LOW":
      return avgDrift <= 0.5;
    case "MID":
      return avgDrift > 0.5 && avgDrift <= 1.25;
    case "HIGH":
      return avgDrift > 1.25;
    default:
      return true;
  }
}

function matchesExclusion(id: string, excludeIds: string[], selectedId: string) {
  return !excludeIds.includes(id) || id === selectedId;
}
