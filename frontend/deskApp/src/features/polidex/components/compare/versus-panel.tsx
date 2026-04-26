"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { politicians } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { RankedPolitician } from "@/features/polidex/lib/api";
import { UserProfile } from "@/features/polidex/lib/profile";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";
import { SelectFilter } from "../ui/select-filter";

import { Legend } from "./legend";
import { ListBox } from "./list-box";
import { SearchablePoliticianPicker } from "./politician-picker-panel";

type PartyFilter = "ALL" | "R" | "D" | "I";
type RoleFilter = "ALL" | "U.S. Senate" | "U.S. House" | "Governor" | "State Senate" | "State House" | "Statewide";
type RegionFilter = "ALL" | "North FL" | "Central FL" | "South FL" | "Statewide";
type SortFilter = "name" | "alignment" | "drift";
type ConsistencyFilter = "ALL" | "HIGH" | "MID" | "LOW";
type DriftFilter = "ALL" | "LOW" | "MID" | "HIGH";

export function VersusView({
  profile,
  sel,
  setSel,
  ranked,
  onOpenProfile,
  selectedProfileId,
}: Readonly<{
  profile: UserProfile;
  sel: string;
  setSel: (id: string) => void;
  ranked: RankedPolitician[];
  onOpenProfile: (id: string, side: "left" | "right") => void;
  selectedProfileId: string | null;
}>) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [sort, setSort] = useState<SortFilter>("alignment");
  const [consistency, setConsistency] = useState<ConsistencyFilter>("ALL");
  const [drift, setDrift] = useState<DriftFilter>("ALL");

  const selectedPolitician = politicians.find((p) => p.id === sel) ?? politicians[0];

  const filteredPoliticians = useMemo(() => {
    const candidates = politicians.filter((p) => passesFilters(p, party, role, region, consistency, drift, profile.vector));

    return [...candidates].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "drift") return averageDrift(b, profile.vector) - averageDrift(a, profile.vector);

      const scoreA = ranked.find((entry) => entry.politician.id === a.id)?.sim ?? 0;
      const scoreB = ranked.find((entry) => entry.politician.id === b.id)?.sim ?? 0;
      return scoreB - scoreA;
    });
  }, [consistency, drift, party, profile.vector, ranked, region, role, sort]);

  useEffect(() => {
    if (filteredPoliticians.some((p) => p.id === sel)) return;
    const nextSel = filteredPoliticians[0]?.id;
    if (nextSel) setSel(nextSel);
  }, [filteredPoliticians, sel, setSel]);

  const rankedEntry = ranked.find((entry) => entry.politician.id === sel);
  const similarity = rankedEntry?.sim ?? null;
  const similarityColor = resolveSimilarityColor(similarity);
  const activeFilterCount = Number(party !== "ALL") + Number(role !== "ALL") + Number(region !== "ALL") + Number(consistency !== "ALL") + Number(drift !== "ALL");

  const data = taxonomy.map((topic, index) => ({
    dim: topic.name,
    name: topic.name,
    you: profile.vector[index],
    them: selectedPolitician.vector_actual[index],
  }));

  const yourProfileRadar = taxonomy.map((topic, index) => ({
    dim: topic.name,
    value: profile.vector[index],
  }));

  const agree = data.filter((item) => Math.abs(item.you - item.them) <= 1).slice(0, 3);
  const disagree = data
    .filter((item) => Math.abs(item.you - item.them) >= 2)
    .sort((a, b) => Math.abs(b.you - b.them) - Math.abs(a.you - a.them))
    .slice(0, 3);

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
      <div className="relative">
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <div className="min-w-[140px] flex-1 sm:flex-none">
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
          </div>
          <div className="min-w-[140px] flex-1 sm:flex-none">
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
          </div>
          <div className="min-w-[140px] flex-1 sm:flex-none">
            <SelectFilter
              label="Office"
              value={role}
              size="sm"
              options={[
                { value: "ALL", label: "All roles" },
                { value: "U.S. Senate", label: "U.S. Senate" },
                { value: "U.S. House", label: "U.S. House" },
                { value: "Governor", label: "Governor" },
                { value: "State Senate", label: "State Senate" },
                { value: "State House", label: "State House" },
                { value: "Statewide", label: "Statewide" },
              ]}
              onChange={setRole}
            />
          </div>
          <div className="min-w-[140px] flex-1 sm:flex-none">
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
          </div>
          <button
            onClick={() => setFiltersOpen((value) => !value)}
            className="flex items-center gap-2 rounded-md border border-[#E2E5E9] bg-[#F8F9FA] px-3 py-2"
            style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1C2431" }}
          >
            <SlidersHorizontal size={14} />
            Advanced Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            <ChevronDown size={14} style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }} />
          </button>
        </div>

        {filtersOpen && (
          <dialog
            className="absolute left-0 z-20 mt-3 w-full rounded-xl border border-[#E2E5E9] bg-white p-4 shadow-[0_18px_46px_rgba(13,15,18,0.12)] lg:w-[min(600px,calc(100vw-4rem))]"
            open
            aria-label="Advanced filters"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>Advanced Filters</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E" }}>Fine-tune the comparison breakdown.</div>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-md border border-[#E2E5E9] bg-[#F8F9FA] p-1.5"
                aria-label="Close filters"
              >
                <X size={14} color="#4B5260" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectFilter
                label="Consistency"
                value={consistency}
                options={[
                  { value: "ALL", label: "All bands" },
                  { value: "HIGH", label: "High (96%+)" },
                  { value: "MID", label: "Medium (92-95%)" },
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
            </div>
          </dialog>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <div
          style={{
            background: "white",
            border: "1px solid #E2E5E9",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 500, marginTop: 4, textAlign: "center" }}>Your political profile</div>
          <div style={{ width: "100%", height: 190, marginTop: 8 }}>
            <ResponsiveContainer>
              <RadarChart data={yourProfileRadar} outerRadius="72%">
                <PolarGrid stroke="#E2E5E9" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: "#8A919E", fontSize: 8, fontFamily: FONT_MONO }} />
                <Radar dataKey="value" stroke="#1565C0" fill="#1565C0" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2, textAlign: "center" }}>
            Saved {new Date(profile.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <SearchablePoliticianPicker
          value={sel}
          onChange={setSel}
          label="Compared With"
          onOpenProfile={onOpenProfile}
          selectedProfileId={selectedProfileId}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.3 }}
        style={{ background: "white", border: "1px solid #E2E5E9", borderRadius: 12, padding: 18 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500 }}>Issue-by-issue overlap</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13 }}>
            <span style={{ color: "#8A919E" }}>Alignment: </span>
            <span style={{ fontWeight: 500, color: similarityColor }}>{similarity === null ? "—" : `${Math.round(similarity * 100)}%`}</span>
          </div>
        </div>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius="78%">
              <PolarGrid stroke="#E2E5E9" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#8A919E", fontSize: 9, fontFamily: FONT_MONO }} />
              <Radar dataKey="you" stroke="#1565C0" fill="#1565C0" fillOpacity={0.14} strokeWidth={1.5} />
              <Radar dataKey="them" stroke="#C84B00" fill="#C84B00" fillOpacity={0.14} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4">
          <Legend swatch="#1565C0" label="Your profile" />
          <Legend swatch="#C84B00" label={selectedPolitician.name} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListBox title="Where you agree" tone="#1B6B3A" items={agree.map((item) => item.name)} />
        <ListBox title="Where you disagree" tone="#991B1B" items={disagree.map((item) => item.name)} />
      </div>
    </div>
  );
}

function passesFilters(
  politician: (typeof politicians)[number],
  party: PartyFilter,
  role: RoleFilter,
  region: RegionFilter,
  consistency: ConsistencyFilter,
  drift: DriftFilter,
  vector: number[],
) {
  return (
    matchesSimpleFilters(politician, party, role, region) &&
    matchesConsistencyBand(politician.w, consistency) &&
    matchesDriftBand(averageDrift(politician, vector), drift)
  );
}

function matchesSimpleFilters(politician: (typeof politicians)[number], party: PartyFilter, role: RoleFilter, region: RegionFilter) {
  if (party !== "ALL" && politician.party !== party) return false;
  if (role !== "ALL" && politician.role !== role) return false;
  if (region !== "ALL" && politician.region !== region) return false;
  return true;
}

function matchesConsistencyBand(score: number, consistency: ConsistencyFilter) {
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

function matchesDriftBand(avgDrift: number, drift: DriftFilter) {
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

function averageDrift(politician: (typeof politicians)[number], vector: number[]): number {
  const total = politician.vector_actual.reduce((sum, value, index) => sum + Math.abs(value - vector[index]), 0);
  return total / politician.vector_actual.length;
}

function resolveSimilarityColor(similarity: number | null) {
  if (similarity === null) return "#8A919E";
  if (similarity > 0.85) return "#1B6B3A";
  if (similarity > 0.65) return "#7A4F00";
  return "#991B1B";
}
