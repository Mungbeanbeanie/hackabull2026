"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { politicians } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";
import { SelectFilter } from "../ui/select-filter";

import { Legend } from "./legend";
import { ListBox } from "./list-box";
import { SearchablePoliticianPicker } from "./politician-picker";

type PartyFilter = "ALL" | "R" | "D" | "I";
type RoleFilter = "ALL" | "U.S. Senate" | "U.S. House" | "Governor" | "State Senate" | "State House" | "Statewide";
type RegionFilter = "ALL" | "North FL" | "Central FL" | "South FL" | "Statewide";

export function PolPolView({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [region, setRegion] = useState<RegionFilter>("ALL");

  const colors = ["#1565C0", "#C84B00", "#1B6B3A", "#6B21A8"];
  
  // Filter available politicians
  const filteredPoliticians = politicians.filter((p) => {
    if (party !== "ALL" && p.party !== party) return false;
    if (role !== "ALL" && p.role !== role) return false;
    if (region !== "ALL" && p.region !== region) return false;
    return true;
  });

  const selectedPoliticians = selected.map((id) => politicians.find((p) => p.id === id) ?? politicians[0]);

  const handleUpdate = (index: number, newId: string) => {
    const updated = [...selected];
    updated[index] = newId;
    setSelected(updated);
  };

  const handleAdd = () => {
    if (selected.length < 4) {
      const remaining = politicians.find((p) => !selected.includes(p.id)) ?? politicians[0];
      setSelected([...selected, remaining.id]);
    }
  };

  const handleRemove = (index: number) => {
    if (selected.length > 2) {
      const updated = [...selected];
      updated.splice(index, 1);
      setSelected(updated);
    }
  };

  const activeFilterCount = [party !== "ALL", role !== "ALL", region !== "ALL"].filter(Boolean).length;

  const data = taxonomy.map((topic, i) => {
    const row: Record<string, number | string> = { dim: topic.name, name: topic.name };
    selectedPoliticians.forEach((p, idx) => {
      row[`p${idx}`] = p.vector_actual[i];
    });
    return row;
  });

  const variances = data.map((row) => {
    const vals = selectedPoliticians.map((_, idx) => Number(row[`p${idx}`]));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return { name: String(row.name), diff: max - min };
  });

  const agree = variances.filter((v) => v.diff <= 1).sort((a, b) => a.diff - b.diff).slice(0, 3);
  const disagree = variances.filter((v) => v.diff >= 2).sort((a, b) => b.diff - a.diff).slice(0, 3);

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
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {selected.map((selectedId, i) => (
          <div key={i} className="group relative">
            <SearchablePoliticianPicker
              value={selectedId}
              onChange={(id) => handleUpdate(i, id)}
              label={`Politician ${i + 1}`}
              excludeIds={selected.filter((_, idx) => idx !== i)}
            />
            {selected.length > 2 && (
              <button
                onClick={() => handleRemove(i)}
                className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: "#991B1B",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            )}
          </div>
        ))}

        {selected.length < 4 && (
          <div className="flex flex-1 flex-col justify-end">
            <button
              onClick={handleAdd}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#FFFFFF",
                border: "1px dashed #C5CBD3",
                color: "#4B5260",
                cursor: "pointer",
                height: "fit-content",
                alignSelf: "flex-start",
                marginTop: "auto",
              }}
            >
              + Add
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.3 }}
        style={{ background: "white", border: "1px solid #E2E5E9", borderRadius: 12, padding: 18 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500 }}>Issue-by-issue comparison</div>
        </div>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius="78%">
              <PolarGrid stroke="#E2E5E9" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#8A919E", fontSize: 9, fontFamily: FONT_MONO }} />
              {selectedPoliticians.map((_, idx) => (
                <Radar
                  key={idx}
                  dataKey={`p${idx}`}
                  stroke={colors[idx]}
                  fill={colors[idx]}
                  fillOpacity={0.14}
                  strokeWidth={1.5}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {selectedPoliticians.map((p, i) => (
            <Legend key={i} swatch={colors[i]} label={p.name} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListBox title="Where they align" tone="#1B6B3A" items={agree.map((v) => v.name)} />
        <ListBox title="Where they diverge" tone="#991B1B" items={disagree.map((v) => v.name)} />
      </div>
    </div>
  );
}
