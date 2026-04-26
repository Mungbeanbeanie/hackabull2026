import { useState } from "react";

import { politicians } from "@/features/polidex/data/politicians";
import { RankedPolitician } from "@/features/polidex/lib/api";
<<<<<<< HEAD
import { districtLabel, levelLabel, partyLabel, regionLabel } from "@/features/polidex/lib/display";
import { cosine } from "@/features/polidex/lib/math";
import { UserProfile, exportProfileCode } from "@/features/polidex/lib/profile";
import { FONT_MONO, FONT_SANS, consistencyLabel } from "@/features/polidex/lib/style";
=======
import { UserProfile } from "@/features/polidex/lib/profile";
import { FONT_SANS } from "@/features/polidex/lib/style";
>>>>>>> 350677096779c6b7fbe67051a5beb12c83b77f3a

import { InfoTooltip } from "./ui/info-tooltip";
import { MatchView } from "./compare/match-view";
import { ModeTab } from "./compare/mode-tab";
import { PolPolView } from "./compare/pol-pol-view";
import { VersusView } from "./compare/versus-view";

type Mode = "match" | "vsYou" | "vsPol";

export function Compare({
  profile,
  ranked = [],
  isRanking = false,
  backendOnline = null,
  onTakeQuiz,
  onImportProfile,
}: {
  profile: UserProfile | null;
  ranked?: RankedPolitician[];
  isRanking?: boolean;
  backendOnline?: boolean | null;
  onTakeQuiz: () => void;
  onImportProfile: (code: string) => boolean;
}) {
  const [mode, setMode] = useState<Mode>(profile ? "match" : "vsPol");
  const [vsYouSel, setVsYouSel] = useState<string>(politicians[0].id);
  const [vsPolSels, setVsPolSels] = useState<string[]>([politicians[0].id, politicians[6].id]);
  const [profileCodeInput, setProfileCodeInput] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const profileCode = profile ? exportProfileCode(profile) : null;

  const handleCopyCode = async () => {
    if (!profileCode) return;
    try {
      await navigator.clipboard.writeText(profileCode);
      setProfileMessage("Profile code copied.");
    } catch {
      setProfileMessage("Could not copy profile code.");
    }
  };

  const handleImportCode = () => {
    const ok = onImportProfile(profileCodeInput);
    setProfileMessage(ok ? "Profile restored from code." : "Invalid profile code.");
    if (ok) setProfileCodeInput("");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="border-b border-[#E2E5E9] px-5 pb-4 pt-6 md:px-8">
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#0D0F12" }}>Compare</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>
          See where your views overlap with politicians, or stack multiple politicians side by side.
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <InfoTooltip content="Take the quiz to unlock personal matches" disabled={!!profile}>
              <ModeTab active={mode === "match"} onClick={() => setMode("match")} label="Best Matches For Me" />
            </InfoTooltip>
            <InfoTooltip content="Take the quiz to unlock vs mode" disabled={!!profile}>
              <ModeTab active={mode === "vsYou"} onClick={() => setMode("vsYou")} label="Me vs Politician" />
            </InfoTooltip>
            <ModeTab active={mode === "vsPol"} onClick={() => setMode("vsPol")} label="Compare Politicians" />
          </div>

          <div className="flex flex-col gap-1 xl:items-end">
            <div className="flex items-center gap-1.5">
              <input
                value={profileCodeInput}
                onChange={(event) => setProfileCodeInput(event.target.value)}
                placeholder="Code"
                className="w-[170px] rounded-md border border-[#D8DEE7] bg-white px-2.5 py-1.5 outline-none"
                style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#1B2533" }}
              />
              <button
                onClick={handleImportCode}
                className="rounded-md border border-[#0D0F12] bg-[#0D0F12] px-2.5 py-1.5"
                style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#FFFFFF" }}
              >
                Restore
              </button>
              {profileCode && (
                <button
                  onClick={handleCopyCode}
                  className="rounded-md border border-[#D8DEE7] bg-white px-2.5 py-1.5"
                  style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#0D0F12" }}
                >
                  Copy My Code
                </button>
              )}
            </div>
            {profileMessage && <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#6A7280" }}>{profileMessage}</div>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: "#F8F9FA" }}>
        {mode === "match" && profile && <MatchView ranked={ranked} isRanking={isRanking} backendOnline={backendOnline} />}
        {mode === "vsYou" && profile && <VersusView profile={profile} sel={vsYouSel} setSel={setVsYouSel} ranked={ranked} />}
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
<<<<<<< HEAD

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

function MatchView({ profile, ranked }: { profile: UserProfile; ranked: RankedPolitician[] }) {
  const sortedRanked = useMemo(() => {
    if (ranked.length > 0) return ranked;
    return politicians
      .map((politician) => ({ politician, sim: cosine(profile.vector, politician.vector_actual) }))
      .sort((a, b) => b.sim - a.sim);
  }, [profile, ranked]);

  const top = sortedRanked[0];
  const rest = sortedRanked.slice(1, 7);
  const worst = sortedRanked[sortedRanked.length - 1];

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
            {partyLabel(top.politician.party)} - {districtLabel(top.politician.district)} - {top.politician.role}
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
          {partyLabel(politician.party)} - {districtLabel(politician.district)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 500, color: "#0D0F12" }}>{Math.round(sim * 100)}%</div>
      </div>
    </motion.div>
  );
}

function SearchablePoliticianPicker({
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
    let base = politicians.filter((politician) => !excludeIds.includes(politician.id) || politician.id === value);

    base = base.filter((politician) => {
      if (party !== "ALL" && politician.party !== party) return false;
      if (level !== "ALL" && levelLabel(politician.role) !== level) return false;
      if (region !== "ALL" && politician.region !== region) return false;
      if (role !== "ALL" && politician.role !== role) return false;

      if (consistency !== "ALL") {
        const score = politician.w;
        if (consistency === "HIGH" && score < 0.96) return false;
        if (consistency === "MID" && (score < 0.92 || score >= 0.96)) return false;
        if (consistency === "LOW" && score >= 0.92) return false;
      }

      if (drift !== "ALL") {
        const avgDrift = averageDrift(politician);
        if (drift === "LOW" && avgDrift > 0.5) return false;
        if (drift === "MID" && (avgDrift <= 0.5 || avgDrift > 1.25)) return false;
        if (drift === "HIGH" && avgDrift <= 1.25) return false;
      }

      return true;
    });

    if (q) {
      base = base.filter((politician) => {
      const searchText = [
        politician.name,
        partyLabel(politician.party),
        districtLabel(politician.district),
        politician.role,
        regionLabel(politician.region),
      ]
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
    <div
      style={{
        background: "white",
        border: "1px solid #E2E5E9",
        borderRadius: 12,
        padding: 14,
      }}
    >
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
          onChange={(event) => setQuery(event.target.value)}
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
          <PickerSelect
            label="Party"
            value={party}
            onChange={(next) => setParty(next as "ALL" | Politician["party"])}
            options={[
              { value: "ALL", label: "All parties" },
              { value: "R", label: "Republican" },
              { value: "D", label: "Democrat" },
              { value: "I", label: "Independent" },
            ]}
          />
          <PickerSelect
            label="Level"
            value={level}
            onChange={(next) => setLevel(next as "ALL" | "Federal" | "State")}
            options={[
              { value: "ALL", label: "All levels" },
              { value: "Federal", label: "Federal" },
              { value: "State", label: "State" },
            ]}
          />
          <PickerSelect
            label="Region"
            value={region}
            onChange={(next) => setRegion(next as "ALL" | Politician["region"])}
            options={[
              { value: "ALL", label: "All regions" },
              { value: "North FL", label: "North Florida" },
              { value: "Central FL", label: "Central Florida" },
              { value: "South FL", label: "South Florida" },
              { value: "Statewide", label: "Statewide" },
            ]}
          />
          <PickerSelect
            label="Office"
            value={role}
            onChange={(next) => setRole(next as "ALL" | Politician["role"])}
            options={[
              { value: "ALL", label: "All offices" },
              { value: "U.S. Senate", label: "U.S. Senate" },
              { value: "U.S. House", label: "U.S. House" },
              { value: "Governor", label: "Governor" },
              { value: "State Senate", label: "State Senate" },
              { value: "State House", label: "State House" },
              { value: "Statewide", label: "Statewide" },
            ]}
          />
          <PickerSelect
            label="Consistency"
            value={consistency}
            onChange={(next) => setConsistency(next as "ALL" | "HIGH" | "MID" | "LOW")}
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
            onChange={(next) => setDrift(next as "ALL" | "LOW" | "MID" | "HIGH")}
            options={[
              { value: "ALL", label: "All drift bands" },
              { value: "LOW", label: "Low drift" },
              { value: "MID", label: "Medium drift" },
              { value: "HIGH", label: "High drift" },
            ]}
          />
          <PickerSelect
            label="Sort"
            value={sort}
            onChange={(next) => setSort(next as "name" | "alignment" | "drift")}
            options={[
              { value: "name", label: "Name" },
              { value: "alignment", label: "Most consistent first" },
              { value: "drift", label: "Most drift first" },
            ]}
          />
        </div>
      )}

      <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-[#E2E5E9]">
        {candidates.map((politician) => {
          const isActive = politician.id === value;
          return (
            <button
              key={politician.id}
              onClick={() => onChange(politician.id)}
              className="flex w-full items-center gap-3 border-b border-[#EEF1F5] px-3 py-2.5 text-left last:border-b-0"
              style={{ background: isActive ? "#EEF5FF" : "#FFFFFF" }}
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
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: "#1B6B3A" }}>{Math.round(politician.w * 100)}%</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#8A919E" }}>{consistencyLabel(politician.w)}</div>
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

function averageDrift(politician: Politician): number {
  const diffs = politician.vector_stated.map((value, index) => Math.abs(value - politician.vector_actual[index]));
  const total = diffs.reduce((sum, value) => sum + value, 0);
  return total / diffs.length;
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

  const handleRemove = (index: number) => {
    if (selected.length > 2) {
      const updated = [...selected];
      updated.splice(index, 1);
      setSelected(updated);
    }
  };

  const [addPoliticianQuery, setAddPoliticianQuery] = useState("");

  const addPoliticianByName = () => {
    if (selected.length >= 4) return;
    const query = addPoliticianQuery.trim().toLowerCase();
    if (!query) return;

    const match = politicians.find((politician) => {
      if (selected.includes(politician.id)) return false;
      const haystack = [politician.name, politician.role, districtLabel(politician.district), partyLabel(politician.party)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });

    if (!match) return;
    setSelected([...selected, match.id]);
    setAddPoliticianQuery("");
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
          <div className="rounded-xl border border-dashed border-[#C5CBD3] bg-white p-5 md:col-span-2 lg:col-span-2" style={{ minHeight: 124 }}>
            <input
              value={addPoliticianQuery}
              onChange={(event) => setAddPoliticianQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPoliticianByName();
                }
              }}
              placeholder="Add politician"
              className="h-11 w-full rounded-md border border-[#D8DEE7] bg-white px-3 outline-none"
              style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#0D0F12" }}
            />
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
=======
>>>>>>> 350677096779c6b7fbe67051a5beb12c83b77f3a
