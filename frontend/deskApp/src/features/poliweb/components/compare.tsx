import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { politicians, Politician } from "@/features/poliweb/data/politicians";
import { taxonomy } from "@/features/poliweb/data/taxonomy";
import { cosine } from "@/features/poliweb/lib/math";
import { UserProfile } from "@/features/poliweb/lib/profile";
import { FONT_MONO, FONT_SANS } from "@/features/poliweb/lib/style";

import { ImageWithFallback } from "./figma/image-with-fallback";
import { InfoTooltip } from "./ui/info-tooltip";

type Mode = "match" | "vsYou" | "vsPol";

export function Compare({
  profile,
  onTakeQuiz,
}: {
  profile: UserProfile | null;
  onTakeQuiz: () => void;
}) {
  const [mode, setMode] = useState<Mode>(profile ? "match" : "vsPol");
  const [vsYouSel, setVsYouSel] = useState<string>(politicians[0].id);
  const [vsPolSels, setVsPolSels] = useState<string[]>([politicians[0].id, politicians[6].id]);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="border-b border-[#E2E5E9] px-5 pb-4 pt-6 md:px-8">
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#0D0F12" }}>Compare</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>
          See where your views overlap with politicians, or stack multiple politicians side by side.
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <InfoTooltip content="Take the quiz to unlock personal matches" disabled={!!profile}>
            <ModeTab active={mode === "match"} onClick={() => setMode("match")} label="Best matches for me" />
          </InfoTooltip>
          <InfoTooltip content="Take the quiz to unlock vs mode" disabled={!!profile}>
            <ModeTab active={mode === "vsYou"} onClick={() => setMode("vsYou")} label="Me vs. a politician" />
          </InfoTooltip>
          <ModeTab active={mode === "vsPol"} onClick={() => setMode("vsPol")} label="Compare politicians" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: "#F8F9FA" }}>
        {mode === "match" && profile && <MatchView profile={profile} />}
        {mode === "vsYou" && profile && <VersusView profile={profile} sel={vsYouSel} setSel={setVsYouSel} />}
        {mode === "vsPol" && <PolPolView selected={vsPolSels} setSelected={setVsPolSels} />}
        {!profile && mode !== "vsPol" && (
          <div className="px-8 py-16 text-center" style={{ color: "#8A919E", fontSize: 14, fontFamily: FONT_SANS }}>
            Take the quiz to unlock personal comparisons.
            <button
              onClick={onTakeQuiz}
              className="mx-auto mt-4 block rounded-md bg-[#0D0F12] px-4 py-2 text-xs text-white"
              style={{ fontFamily: FONT_SANS }}
            >
              Take the quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_SANS,
        fontSize: 13,
        padding: "8px 14px",
        borderRadius: 8,
        background: active ? "#0D0F12" : "#FFFFFF",
        border: active ? "1px solid #0D0F12" : "1px solid #E2E5E9",
        color: active ? "white" : disabled ? "#C5CBD3" : "#0D0F12",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
}

function MatchView({ profile }: { profile: UserProfile }) {
  const ranked = useMemo(() => {
    return politicians
      .map((politician) => ({ politician, sim: cosine(profile.vector, politician.vector_actual) }))
      .sort((a, b) => b.sim - a.sim);
  }, [profile]);

  const top = ranked[0];
  const rest = ranked.slice(1, 7);
  const worst = ranked[ranked.length - 1];

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "white",
          border: "1px solid #E2E5E9",
          borderRadius: 14,
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#F1F3F5" }}>
          <ImageWithFallback
            src={top.politician.photo}
            alt={top.politician.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Your closest match
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 500, color: "#0D0F12", marginTop: 4 }}>
            {top.politician.name}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#4B5260", marginTop: 2 }}>
            {top.politician.party === "R" ? "Republican" : top.politician.party === "D" ? "Democrat" : "Independent"} -{" "}
            {top.politician.district} - {top.politician.role}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 36, fontWeight: 300, color: "#1565C0", lineHeight: 1 }}>
            {Math.round(top.sim * 100)}%
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 4 }}>
            alignment with your views
          </div>
        </div>
      </motion.div>

      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginBottom: 10 }}>More close matches</div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {rest.map(({ politician, sim }) => (
            <MatchRow key={politician.id} politician={politician} sim={sim} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "white",
          border: "1px solid #E2E5E9",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#F1F3F5" }}>
          <ImageWithFallback
            src={worst.politician.photo}
            alt={worst.politician.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Furthest from your views
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>{worst.politician.name}</div>
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#991B1B" }}>{Math.round(worst.sim * 100)}%</div>
      </motion.div>
    </div>
  );
}

function MatchRow({ politician, sim }: { politician: Politician; sim: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "white",
        border: "1px solid #E2E5E9",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
        <ImageWithFallback
          src={politician.photo}
          alt={politician.name}
          className="h-full w-full"
          style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 500,
            color: "#0D0F12",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {politician.name}
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 2 }}>
          {politician.party === "R" ? "Republican" : politician.party === "D" ? "Democrat" : "Independent"} - {politician.district}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 500, color: "#0D0F12" }}>{Math.round(sim * 100)}%</div>
      </div>
    </motion.div>
  );
}

function PoliticianPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const selected = politicians.find((p) => p.id === value) ?? politicians[0];

  return (
    <div className="flex-1">
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          color: "#8A919E",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{
            width: "100%",
            fontFamily: FONT_SANS,
            fontSize: 14,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #E2E5E9",
            background: "white",
            color: "#0D0F12",
            cursor: "pointer",
            appearance: "none",
          }}
        >
          {politicians.map((politician) => (
            <option key={politician.id} value={politician.id}>
              {politician.name} - {politician.party} {politician.district}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "#F1F3F5" }}>
          <ImageWithFallback
            src={selected.photo}
            alt={selected.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500 }}>{selected.name}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E" }}>{selected.role}</div>
        </div>
      </div>
    </div>
  );
}

function VersusView({
  profile,
  sel,
  setSel,
}: {
  profile: UserProfile;
  sel: string;
  setSel: (id: string) => void;
}) {
  const selectedPolitician = politicians.find((p) => p.id === sel) ?? politicians[0];
  const similarity = cosine(profile.vector, selectedPolitician.vector_actual);

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

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
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
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            You
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 500, marginTop: 4 }}>Your political profile</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>
            Saved {new Date(profile.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <PoliticianPicker value={sel} onChange={setSel} label="Compared with" />
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
                color: similarity > 0.85 ? "#1B6B3A" : similarity > 0.65 ? "#7A4F00" : "#991B1B",
              }}
            >
              {Math.round(similarity * 100)}%
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

function PolPolView({
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
    selectedPoliticians.forEach((politician, idx) => {
      row[`p${idx}`] = politician.vector_actual[i];
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
            <PoliticianPicker value={selectedId} onChange={(id) => handleUpdate(i, id)} label={`Politician ${i + 1}`} />
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
              {selectedPoliticians.map((politician, idx) => (
                <Radar
                  key={politician.id}
                  name={politician.name}
                  dataKey={`p${idx}`}
                  stroke={colors[idx]}
                  fill={colors[idx]}
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {selectedPoliticians.map((politician, idx) => (
            <Legend key={politician.id} swatch={colors[idx]} label={politician.name} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListBox
          title="Where they agree"
          tone="#1B6B3A"
          items={agree.map((d) => d.name)}
          empty="They have vastly differing views on most issues."
        />
        <ListBox
          title="Where they disagree"
          tone="#991B1B"
          items={disagree.map((d) => d.name)}
          empty="Their platforms are surprisingly well-aligned."
        />
      </div>
    </div>
  );
}

function ListBox({
  title,
  tone,
  items,
  empty,
}: {
  title: string;
  tone: string;
  items: string[];
  empty?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      style={{ background: "white", border: "1px solid #E2E5E9", borderRadius: 12, padding: 16 }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          color: tone,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#8A919E", minHeight: 40, display: "flex", alignItems: "center" }}>
          {empty ?? "No notable items."}
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {items.map((item) => (
            <li key={item} style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#0D0F12", padding: "4px 0" }}>
              - {item}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 8, height: 8, borderRadius: 999, background: swatch }} />
      <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#4B5260" }}>{label}</div>
    </div>
  );
}
