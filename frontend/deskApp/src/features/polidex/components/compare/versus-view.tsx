"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { politicians } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { RankedPolitician } from "@/features/polidex/lib/api";
import { partyLabel, districtLabel, levelLabel, regionLabel } from "@/features/polidex/lib/display";
import { UserProfile } from "@/features/polidex/lib/profile";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";
import { SelectFilter } from "../ui/select-filter";

import { Legend } from "./legend";
import { ListBox } from "./list-box";
import { SearchablePoliticianPicker } from "./politician-picker";

type PartyFilter = "ALL" | "R" | "D" | "I";
type RoleFilter = "ALL" | "U.S. Senate" | "U.S. House" | "Governor" | "State Senate" | "State House" | "Statewide";
type RegionFilter = "ALL" | "North FL" | "Central FL" | "South FL" | "Statewide";

export function VersusView({
  profile,
  sel,
  setSel,
  ranked,
}: {
  profile: UserProfile;
  sel: string;
  setSel: (id: string) => void;
  ranked: RankedPolitician[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [region, setRegion] = useState<RegionFilter>("ALL");

  const selectedPolitician = politicians.find((p) => p.id === sel) ?? politicians[0];
  
  // Filter available politicians
  const filteredPoliticians = politicians.filter((p) => {
    if (party !== "ALL" && p.party !== party) return false;
    if (role !== "ALL" && p.role !== role) return false;
    if (region !== "ALL" && p.region !== region) return false;
    return true;
  });

  // Revert to a valid selection if current one is filtered out
  const validSel = filteredPoliticians.find((p) => p.id === sel) ? sel : filteredPoliticians[0]?.id || sel;
  if (validSel !== sel) setSel(validSel);
  const rankedEntry = ranked.find((r) => r.politician.id === sel);
  const similarity = rankedEntry?.sim ?? null;

  const data = taxonomy.map((topic, i) => ({
    dim: topic.name,
    name: topic.name,
    you: profile.vector[i],
    them: selectedPolitician.vector_actual[i],
  }));

  const agree = data.filter((d) => Math.abs(d.you - d.them) <= 1).slice(0, 3);
  const disagree = data
    .filter((d) => Math.abs(d.you - d.them) >= 2)
    .sort((a, b) => Math.abs(b.you - b.them) - Math.abs(a.you - a.them))
    .slice(0, 3);
  
  const activeFilterCount = [party !== "ALL", role !== "ALL", region !== "ALL"].filter(Boolean).length;

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
      {/* Filters Bar */}
      <div className="relative">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-[#E2E5E9] bg-[#F8F9FA] px-3 py-2"
          style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1C2431" }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          <ChevronDown size={14} style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }} />
        </button>

        {filtersOpen && (
          <div
            className="absolute left-0 z-20 mt-3 w-full rounded-xl border border-[#E2E5E9] bg-white p-4 shadow-[0_18px_46px_rgba(13,15,18,0.12)] lg:w-[min(600px,calc(100vw-4rem))]"
            role="dialog"
            aria-label="Filters"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>All Filters</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E" }}>Narrow down your comparison options.</div>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-md border border-[#E2E5E9] bg-[#F8F9FA] p-1.5"
                aria-label="Close filters"
              >
                <X size={14} color="#4B5260" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SelectFilter
                label="Party"
                value={party}
                options={[
                  { value: "ALL", label: "All parties" },
                  { value: "R", label: "Republican" },
                  { value: "D", label: "Democrat" },
                  { value: "I", label: "Independent" },
                ]}
                onChange={(value) => setParty(value as PartyFilter)}
              />
              <SelectFilter
                label="Role"
                value={role}
                options={[
                  { value: "ALL", label: "All roles" },
                  { value: "U.S. Senate", label: "U.S. Senate" },
                  { value: "U.S. House", label: "U.S. House" },
                  { value: "Governor", label: "Governor" },
                  { value: "State Senate", label: "State Senate" },
                  { value: "State House", label: "State House" },
                  { value: "Statewide", label: "Statewide" },
                ]}
                onChange={(value) => setRole(value as RoleFilter)}
              />
              <SelectFilter
                label="Region"
                value={region}
                options={[
                  { value: "ALL", label: "All regions" },
                  { value: "North FL", label: "North Florida" },
                  { value: "Central FL", label: "Central Florida" },
                  { value: "South FL", label: "South Florida" },
                  { value: "Statewide", label: "Statewide" },
                ]}
                onChange={(value) => setRegion(value as RegionFilter)}
              />
            </div>
          </div>
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
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", textTransform: "uppercase", letterSpacing: "0.08em" }}>You</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 500, marginTop: 4 }}>Your political profile</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>
            Saved {new Date(profile.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <SearchablePoliticianPicker value={sel} onChange={setSel} label="Compared With" />
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
            <span
              style={{
                fontWeight: 500,
                color: similarity === null ? "#8A919E" : similarity > 0.85 ? "#1B6B3A" : similarity > 0.65 ? "#7A4F00" : "#991B1B",
              }}
            >
              {similarity === null ? "—" : `${Math.round(similarity * 100)}%`}
            </span>
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
          <Legend swatch="#1565C0" label="You" />
          <Legend swatch="#C84B00" label={selectedPolitician.name} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListBox title="Where you agree" tone="#1B6B3A" items={agree.map((d) => d.name)} />
        <ListBox title="Where you disagree" tone="#991B1B" items={disagree.map((d) => d.name)} />
      </div>
    </div>
  );
}
