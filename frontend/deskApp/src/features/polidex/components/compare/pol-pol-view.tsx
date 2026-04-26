"use client";

import { motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { politicians } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

import { Legend } from "./legend";
import { ListBox } from "./list-box";
import { SearchablePoliticianPicker } from "./politician-picker";

export function PolPolView({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  const colors = ["#1565C0", "#C84B00", "#1B6B3A", "#6B21A8"];
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
              + Add politician
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
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500 }}>Issue overlap</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13 }}>
            <span style={{ color: "#8A919E" }}>Consensus: </span>
            <span style={{ fontWeight: 500, color: agree.length > 1 ? "#1B6B3A" : "#7A4F00" }}>{agree.length} shared views</span>
          </div>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius="75%">
              <PolarGrid stroke="#E2E5E9" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#8A919E", fontSize: 9, fontFamily: FONT_MONO }} />
              {selectedPoliticians.map((p, idx) => (
                <Radar key={p.id} name={p.name} dataKey={`p${idx}`} stroke={colors[idx]} fill={colors[idx]} fillOpacity={0.1} strokeWidth={1.5} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {selectedPoliticians.map((p, idx) => (
            <Legend key={p.id} swatch={colors[idx]} label={p.name} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListBox title="Where they agree" tone="#1B6B3A" items={agree.map((d) => d.name)} empty="They have vastly differing views on most issues." />
        <ListBox title="Where they disagree" tone="#991B1B" items={disagree.map((d) => d.name)} empty="Their platforms are surprisingly well-aligned." />
      </div>
    </div>
  );
}
