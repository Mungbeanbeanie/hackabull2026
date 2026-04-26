import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";

import { Politician } from "@/features/poliweb/data/politicians";
import { FONT_MONO, FONT_SANS, consistencyColor, consistencyLabel } from "@/features/poliweb/lib/style";

import { ImageWithFallback } from "./figma/image-with-fallback";
import { InfoTooltip } from "./ui/info-tooltip";

type Sort = "drift" | "adherence" | "name";
type PartyFilter = "ALL" | "R" | "D" | "I";
type LevelFilter = "ALL" | "Federal" | "State";

export function Dashboard({
  list,
  selectedId,
  onSelect,
  isLoading: externalIsLoading,
}: {
  list: Politician[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  const [isMountLoading, setIsMountLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsMountLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = externalIsLoading || isMountLoading;

  const [q, setQ] = useState("");
  const [party, setParty] = useState<PartyFilter>("ALL");
  const [level, setLevel] = useState<LevelFilter>("ALL");
  const [sort, setSort] = useState<Sort>("drift");

  const isFederal = (role: Politician["role"]) => role.startsWith("U.S.") || role === "Governor";

  const filtered = useMemo(() => {
    let result = list.filter((p) => {
      if (party !== "ALL" && p.party !== party) return false;
      if (level === "Federal" && !isFederal(p.role)) return false;
      if (level === "State" && isFederal(p.role)) return false;
      if (q && !(p.name.toLowerCase().includes(q.toLowerCase()) || p.district.toLowerCase().includes(q.toLowerCase()))) {
        return false;
      }
      return true;
    });

    if (sort === "drift") result = [...result].sort((a, b) => a.w - b.w);
    if (sort === "adherence") result = [...result].sort((a, b) => b.w - a.w);
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [list, q, party, level, sort]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="border-b border-[#E2E5E9] px-5 pb-4 pt-6 md:px-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between">
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#0D0F12" }}>Politicians</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 2 }}>
              Showing {filtered.length} of {list.length} - sorted by{" "}
              {sort === "drift"
                ? "biggest gap between promises and votes"
                : sort === "adherence"
                  ? "most consistent"
                  : "name"}
              .
            </div>
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
              placeholder="Search name or district..."
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

        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <FilterGroup
            label="Party"
            value={party}
            options={[
              { k: "ALL" as PartyFilter, l: "All" },
              { k: "R", l: "Republican" },
              { k: "D", l: "Democrat" },
              { k: "I", l: "Independent" },
            ]}
            onChange={(value) => setParty(value as PartyFilter)}
          />
          <FilterGroup
            label="Level"
            value={level}
            options={[
              { k: "ALL" as LevelFilter, l: "All" },
              { k: "Federal", l: "Federal" },
              { k: "State", l: "State" },
            ]}
            onChange={(value) => setLevel(value as LevelFilter)}
          />
          <FilterGroup
            label="Sort"
            value={sort}
            options={[
              { k: "drift" as Sort, l: "Biggest Gap" },
              { k: "adherence", l: "Most Consistent" },
              { k: "name", l: "A-Z" },
            ]}
            onChange={(value) => setSort(value as Sort)}
          />
        </div>
      </div>

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
                  onClick={() => onSelect(politician.id)}
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
  onClick: () => void;
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
            {politician.party} - {politician.district}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#4B5260", marginTop: 4 }}>
            {politician.role} - {politician.region}
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

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: (T | { k: T; l: string })[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.09em" }}>{label}</div>
      <div style={{ display: "flex", background: "#F8F9FA", border: "1px solid #E2E5E9", borderRadius: 8, padding: 2 }}>
        {options.map((option) => {
          const key = (typeof option === "string" ? option : option.k) as T;
          const labelText = typeof option === "string" ? option : option.l;
          const active = key === value;

          return (
            <InfoTooltip key={key} content={`Filter by ${labelText}`}>
              <button
                onClick={() => onChange(key)}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  background: active ? "#FFFFFF" : "transparent",
                  boxShadow: active ? "0 0 0 1px #C5CBD3" : "none",
                  color: active ? "#0D0F12" : "#4B5260",
                }}
              >
                {labelText}
              </button>
            </InfoTooltip>
          );
        })}
      </div>
    </div>
  );
}
