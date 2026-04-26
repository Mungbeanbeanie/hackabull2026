import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { Politician, politicians } from "@/features/polidex/data/politicians";
import { districtLabel, levelLabel, partyLabel, regionLabel } from "@/features/polidex/lib/display";
import { FONT_MONO, FONT_SANS, consistencyLabel } from "@/features/polidex/lib/style";

import { ImageWithFallback } from "../figma/image-with-fallback";
import { averageDrift } from "./utils";

export function SearchablePoliticianPicker({
  value,
  onChange,
  label,
  excludeIds = [],
}: {
  value: string;
  onChange: (id: string) => void;
  label: string;
  excludeIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [party, setParty] = useState<"ALL" | Politician["party"]>("ALL");
  const [level, setLevel] = useState<"ALL" | "Federal" | "State">("ALL");
  const [region, setRegion] = useState<"ALL" | Politician["region"]>("ALL");
  const [role, setRole] = useState<"ALL" | Politician["role"]>("ALL");
  const [consistency, setConsistency] = useState<"ALL" | "HIGH" | "MID" | "LOW">("ALL");
  const [drift, setDrift] = useState<"ALL" | "LOW" | "MID" | "HIGH">("ALL");
  const [sort, setSort] = useState<"name" | "alignment" | "drift">("name");
  const selected = politicians.find((p) => p.id === value) ?? politicians[0];

  const activeFilterCount =
    Number(party !== "ALL") +
    Number(level !== "ALL") +
    Number(region !== "ALL") +
    Number(role !== "ALL") +
    Number(consistency !== "ALL") +
    Number(drift !== "ALL");

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = politicians.filter((p) => !excludeIds.includes(p.id) || p.id === value);

    base = base.filter((p) => {
      if (party !== "ALL" && p.party !== party) return false;
      if (level !== "ALL" && levelLabel(p.role) !== level) return false;
      if (region !== "ALL" && p.region !== region) return false;
      if (role !== "ALL" && p.role !== role) return false;

      if (consistency !== "ALL") {
        const score = p.w;
        if (consistency === "HIGH" && score < 0.96) return false;
        if (consistency === "MID" && (score < 0.92 || score >= 0.96)) return false;
        if (consistency === "LOW" && score >= 0.92) return false;
      }

      if (drift !== "ALL") {
        const avg = averageDrift(p);
        if (drift === "LOW" && avg > 0.5) return false;
        if (drift === "MID" && (avg <= 0.5 || avg > 1.25)) return false;
        if (drift === "HIGH" && avg <= 1.25) return false;
      }

      return true;
    });

    if (q) {
      base = base.filter((p) => {
        const searchText = [p.name, partyLabel(p.party), districtLabel(p.district), p.role, regionLabel(p.region)]
          .join(" ")
          .toLowerCase();
        return searchText.includes(q);
      });
    }

    if (sort === "alignment") {
      base = [...base].sort((a, b) => b.w - a.w);
    } else if (sort === "drift") {
      base = [...base].sort((a, b) => averageDrift(b) - averageDrift(a));
    } else {
      base = [...base].sort((a, b) => a.name.localeCompare(b.name));
    }

    return q ? base : base.slice(0, 18);
  }, [query, excludeIds, value, party, level, region, role, consistency, drift, sort]);

  return (
    <div style={{ background: "white", border: "1px solid #E2E5E9", borderRadius: 12, padding: 14 }}>
      <div className="flex items-center justify-between gap-2">
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#6A7280" }}>{candidates.length} shown</div>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-md border border-[#E2E5E9] bg-[#F8F9FA] px-2 py-2">
        <Search size={14} color="#8A919E" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name, office, district..."
          className="w-full bg-transparent outline-none"
          style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}
        />
      </div>

      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="mt-2 flex items-center gap-2 rounded-md border border-[#E2E5E9] bg-[#F8F9FA] px-2.5 py-1.5"
        style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#334155" }}
      >
        <SlidersHorizontal size={13} />
        Filters
        {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        <ChevronDown size={13} style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 140ms" }} />
      </button>

      {filtersOpen && (
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <PickerSelect label="Party" value={party} onChange={(v) => setParty(v as "ALL" | Politician["party"])}
            options={[{ value: "ALL", label: "All parties" }, { value: "R", label: "Republican" }, { value: "D", label: "Democrat" }, { value: "I", label: "Independent" }]} />
          <PickerSelect label="Level" value={level} onChange={(v) => setLevel(v as "ALL" | "Federal" | "State")}
            options={[{ value: "ALL", label: "All levels" }, { value: "Federal", label: "Federal" }, { value: "State", label: "State" }]} />
          <PickerSelect label="Region" value={region} onChange={(v) => setRegion(v as "ALL" | Politician["region"])}
            options={[{ value: "ALL", label: "All regions" }, { value: "North FL", label: "North Florida" }, { value: "Central FL", label: "Central Florida" }, { value: "South FL", label: "South Florida" }, { value: "Statewide", label: "Statewide" }]} />
          <PickerSelect label="Office" value={role} onChange={(v) => setRole(v as "ALL" | Politician["role"])}
            options={[{ value: "ALL", label: "All offices" }, { value: "U.S. Senate", label: "U.S. Senate" }, { value: "U.S. House", label: "U.S. House" }, { value: "Governor", label: "Governor" }, { value: "State Senate", label: "State Senate" }, { value: "State House", label: "State House" }, { value: "Statewide", label: "Statewide" }]} />
          <PickerSelect label="Consistency" value={consistency} onChange={(v) => setConsistency(v as "ALL" | "HIGH" | "MID" | "LOW")}
            options={[{ value: "ALL", label: "All bands" }, { value: "HIGH", label: "High (96%+)" }, { value: "MID", label: "Medium (92-95%)" }, { value: "LOW", label: "Low (<92%)" }]} />
          <PickerSelect label="Promise Drift" value={drift} onChange={(v) => setDrift(v as "ALL" | "LOW" | "MID" | "HIGH")}
            options={[{ value: "ALL", label: "All drift bands" }, { value: "LOW", label: "Low drift" }, { value: "MID", label: "Medium drift" }, { value: "HIGH", label: "High drift" }]} />
          <PickerSelect label="Sort" value={sort} onChange={(v) => setSort(v as "name" | "alignment" | "drift")}
            options={[{ value: "name", label: "Name" }, { value: "alignment", label: "Most consistent first" }, { value: "drift", label: "Most drift first" }]} />
        </div>
      )}

      <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-[#E2E5E9]">
        {candidates.map((p) => {
          const isActive = p.id === value;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className="flex w-full items-center gap-3 border-b border-[#EEF1F5] px-3 py-2.5 text-left last:border-b-0"
              style={{ background: isActive ? "#EEF5FF" : "#FFFFFF" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
                <ImageWithFallback src={p.photo} alt={p.name} className="h-full w-full" style={{ objectFit: "cover" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: "#0D0F12", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#6A7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {partyLabel(p.party)} • {districtLabel(p.district)}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.role} • {regionLabel(p.region)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: "#1B6B3A" }}>{Math.round(p.w * 100)}%</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#8A919E" }}>{consistencyLabel(p.w)}</div>
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

      <div className="mt-3 flex items-center gap-3 rounded-md bg-[#F8FAFC] p-2">
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
      </div>
    </div>
  );
}

function PickerSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-[#E2E5E9] bg-white px-2 py-1.5"
        style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
