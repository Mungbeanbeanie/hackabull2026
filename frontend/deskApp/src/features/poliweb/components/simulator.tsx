import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Politician } from "@/features/poliweb/data/politicians";
import { taxonomy } from "@/features/poliweb/data/taxonomy";
import { FONT_MONO, FONT_SANS } from "@/features/poliweb/lib/style";

import { ImageWithFallback } from "./figma/image-with-fallback";

type SimMode = "theoretical" | "functional";

type Topic = {
  id: string;
  label: string;
  alleles: string[];
};

type VoiceTier = "Male (Senior)" | "Male (Young)" | "Female (Senior)" | "Female (Young)";

type VoiceProfile = {
  tier: VoiceTier;
  voiceName: string;
};

type SimTurn = {
  id: string;
  speakerId: string;
  text: string;
  triggeredAlleles: string[];
  voice: VoiceProfile;
};

const TOPICS: Topic[] = [
  { id: "economy", label: "Economy and labor", alleles: ["p1", "p2", "p3", "p15"] },
  { id: "education", label: "Education and culture", alleles: ["p5", "p14", "p20", "p13"] },
  { id: "security", label: "Immigration and public safety", alleles: ["p6", "p8", "p18", "p11"] },
  { id: "climate", label: "Climate and energy", alleles: ["p4", "p10", "p19", "p16"] },
];

const VOICE_MAP: Record<"male-senior" | "male-young" | "female-senior" | "female-young", VoiceProfile> = {
  "male-senior": { tier: "Male (Senior)", voiceName: "Bill" },
  "male-young": { tier: "Male (Young)", voiceName: "Antoni" },
  "female-senior": { tier: "Female (Senior)", voiceName: "Bella" },
  "female-young": { tier: "Female (Young)", voiceName: "Gigi" },
};

const FEMALE_FIRST_NAMES = new Set([
  "Ashley",
  "Maria",
  "Anna",
  "Monique",
  "Veronica",
  "Lois",
  "Debbie",
  "Frederica",
  "Kat",
]);

const ALLELE_LABEL: Record<string, string> = taxonomy.reduce<Record<string, string>>((acc, allele) => {
  acc[allele.id] = allele.name;
  return acc;
}, {});

function scoreForAllele(vector: number[], alleleId: string): number {
  const idx = Number(alleleId.slice(1)) - 1;
  return vector[idx] ?? 3;
}

function marketColor(score: number): string {
  if (score <= 2.0) return "#2A7F62";
  if (score <= 3.4) return "#C97C1F";
  return "#B13A2C";
}

function getVoiceProfile(politician: Politician): VoiceProfile {
  const firstName = politician.name.split(" ")[0] ?? "";
  const isFemale = FEMALE_FIRST_NAMES.has(firstName);
  const isSenior = politician.role.includes("Senate") || politician.role === "Governor" || politician.region === "Statewide";

  if (isFemale && isSenior) return VOICE_MAP["female-senior"];
  if (isFemale && !isSenior) return VOICE_MAP["female-young"];
  if (!isFemale && isSenior) return VOICE_MAP["male-senior"];
  return VOICE_MAP["male-young"];
}

function generateTurnText({
  speaker,
  topic,
  mode,
  triggeredAlleles,
  turnIndex,
}: {
  speaker: Politician;
  topic: Topic;
  mode: SimMode;
  triggeredAlleles: string[];
  turnIndex: number;
}): string {
  const vector = mode === "theoretical" ? speaker.vector_stated : speaker.vector_actual;
  const anchorAllele = triggeredAlleles[0] ?? topic.alleles[0];
  const anchorScore = scoreForAllele(vector, anchorAllele);
  const anchorLabel = ALLELE_LABEL[anchorAllele] ?? anchorAllele;

  const opening =
    turnIndex === 0
      ? "My baseline is simple"
      : turnIndex % 3 === 0
        ? "Let me push this further"
        : turnIndex % 2 === 0
          ? "Where I disagree is the mechanism"
          : "The implementation details matter";

  let stance = "I want a balanced policy path with staged rollouts and measurable outcomes.";

  if (anchorScore >= 4.2) {
    stance = `On ${anchorLabel}, I favor a high-autonomy approach with fewer central constraints and stronger local discretion.`;
  } else if (anchorScore <= 1.8) {
    stance = `On ${anchorLabel}, I favor stronger public guardrails, broader access guarantees, and direct accountability.`;
  } else {
    stance = `On ${anchorLabel}, I support a middle track with targeted intervention and strict feedback loops.`;
  }

  const modeSuffix =
    mode === "theoretical"
      ? "This is the campaign-facing position and it emphasizes principles first."
      : "This tracks closer to the legislative record, where tradeoffs and coalition math are explicit.";

  return `${opening}: ${stance} ${modeSuffix}`;
}

function buildSimulation(participants: Politician[], topic: Topic, mode: SimMode): SimTurn[] {
  const count = Math.max(8, participants.length * 3);
  const turns: SimTurn[] = [];

  for (let i = 0; i < count; i++) {
    const speaker = participants[i % participants.length];
    const vector = mode === "theoretical" ? speaker.vector_stated : speaker.vector_actual;

    const triggeredAlleles = [...topic.alleles]
      .sort((a, b) => Math.abs(scoreForAllele(vector, b) - 3) - Math.abs(scoreForAllele(vector, a) - 3))
      .slice(0, 2);

    turns.push({
      id: `${speaker.id}-${i}`,
      speakerId: speaker.id,
      text: generateTurnText({ speaker, topic, mode, triggeredAlleles, turnIndex: i }),
      triggeredAlleles,
      voice: getVoiceProfile(speaker),
    });
  }

  return turns;
}

export function Simulator({ list }: { list: Politician[] }) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => list.slice(0, 3).map((p) => p.id));
  const [mode, setMode] = useState<SimMode>("theoretical");
  const [topicId, setTopicId] = useState<string>(TOPICS[0].id);
  const [turns, setTurns] = useState<SimTurn[]>([]);
  const [activeTurn, setActiveTurn] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const topic = useMemo(() => TOPICS.find((t) => t.id === topicId) ?? TOPICS[0], [topicId]);
  const participants = useMemo(() => list.filter((p) => selectedIds.includes(p.id)), [list, selectedIds]);

  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q));
  }, [list, query]);

  const activeSpeakerId = turns[activeTurn]?.speakerId ?? participants[0]?.id ?? null;
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) ?? null;

  useEffect(() => {
    if (!isRunning || turns.length === 0) return;

    const timer = setInterval(() => {
      setActiveTurn((prev) => {
        if (prev >= turns.length - 1) {
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [isRunning, turns.length]);

  const toggleParticipant = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        if (current.length <= 2) return current;
        return current.filter((x) => x !== id);
      }
      if (current.length >= 4) return current;
      return [...current, id];
    });
  };

  const runSimulation = () => {
    if (participants.length < 2) return;
    const next = buildSimulation(participants, topic, mode);
    setTurns(next);
    setActiveTurn(0);
    setIsRunning(true);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTurns([]);
    setActiveTurn(0);
  };

  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      style={{
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(40,123,120,0.16), transparent 45%), radial-gradient(900px 450px at 90% 10%, rgba(214,113,62,0.14), transparent 50%), #F4F6F8",
      }}
    >
      <div className="border-b border-[#D7DCE3] px-5 pb-4 pt-6 md:px-8">
        <h1 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 300, letterSpacing: "-0.02em", color: "#0D0F12" }}>
          Synthesized Discourse Simulator
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163", marginTop: 6 }}>
          Select 2-4 politicians, choose a policy lane, then run a vector-grounded debate with voice-tier mapping.
        </p>
      </div>

      <div className="grid flex-1 gap-4 px-5 py-5 md:grid-cols-[340px_1fr] md:px-8" style={{ minHeight: 0 }}>
        <div className="flex min-h-0 flex-col rounded-2xl border border-[#D7DCE3] bg-white/90 p-4 backdrop-blur">
          <div className="mb-3" style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#6E7686", letterSpacing: "0.08em" }}>
            SCENARIO CONTROLS
          </div>

          <label style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Topic</label>
          <div className="mt-1 grid grid-cols-1 gap-2">
            {TOPICS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTopicId(item.id)}
                className="rounded-lg border px-3 py-2 text-left"
                style={{
                  borderColor: topicId === item.id ? "#0F766E" : "#D7DCE3",
                  background: topicId === item.id ? "rgba(15,118,110,0.08)" : "#FFFFFF",
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: topicId === item.id ? "#0F5B57" : "#223043",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Adherence Override</label>
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-lg bg-[#EEF2F5] p-1">
              <button
                onClick={() => setMode("theoretical")}
                style={{
                  borderRadius: 8,
                  border: "none",
                  background: mode === "theoretical" ? "white" : "transparent",
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  padding: "7px 9px",
                  color: "#0D0F12",
                  boxShadow: mode === "theoretical" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Theoretical
              </button>
              <button
                onClick={() => setMode("functional")}
                style={{
                  borderRadius: 8,
                  border: "none",
                  background: mode === "functional" ? "white" : "transparent",
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  padding: "7px 9px",
                  color: "#0D0F12",
                  boxShadow: mode === "functional" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Functional
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Participants ({selectedIds.length}/4)</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or district"
              className="mt-1 w-full rounded-lg border border-[#D7DCE3] px-3 py-2 outline-none"
              style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}
            />
            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-[#E4E8ED]">
              {visibleCandidates.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleParticipant(p.id)}
                    className="flex w-full items-center justify-between border-b border-[#EEF1F5] px-3 py-2 text-left last:border-b-0"
                    style={{
                      background: selected ? "rgba(15,118,110,0.08)" : "white",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#0D0F12" }}>{p.name}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#788193", marginTop: 1 }}>
                        {p.party} / {p.district}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `1px solid ${selected ? "#0F766E" : "#AAB3C2"}`,
                        background: selected ? "#0F766E" : "transparent",
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-2" style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#788193" }}>
              You must keep at least 2 and at most 4 speakers selected.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Button
              onClick={runSimulation}
              disabled={participants.length < 2}
              className="h-9 bg-[#0F5B57] text-white hover:bg-[#0B4744]"
              style={{ fontFamily: FONT_SANS, fontSize: 12 }}
            >
              Generate Debate
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setIsRunning((v) => !v)}
                disabled={turns.length === 0}
                variant="outline"
                className="h-8 border-[#D7DCE3]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                {isRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                onClick={resetSimulation}
                disabled={turns.length === 0}
                variant="outline"
                className="h-8 border-[#D7DCE3]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#D7DCE3] bg-[#FAFBFC] p-3">
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#6E7686", letterSpacing: "0.06em" }}>VOICE TIER MAP</div>
            <div className="mt-2 grid grid-cols-1 gap-1" style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#263246" }}>
              <div>Male (Senior) {"->"} Bill / Callum</div>
              <div>Male (Young) {"->"} Antoni / Marcus</div>
              <div>Female (Senior) {"->"} Bella / Dorothy</div>
              <div>Female (Young) {"->"} Gigi / Nicole</div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 gap-4 md:grid-rows-[minmax(320px,1fr)_minmax(180px,1fr)]">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[#D7DCE3] bg-[#0E1318]">
            <div className="absolute left-0 top-0 h-full w-full opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #2A7F62 0%, transparent 40%), radial-gradient(circle at 70% 70%, #B13A2C 0%, transparent 45%)" }} />

            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
              <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#D0D8E3", letterSpacing: "0.08em" }}>
                  {mode === "theoretical" ? "VTHEORETICAL" : "VLEGISLATIVE"}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#F4F7FA", marginTop: 4 }}>{topic.label}</div>
              </div>
            </div>

            {participants.map((speaker, idx) => {
              const angle = (idx / participants.length) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(angle) * 165;
              const y = Math.sin(angle) * 125;
              const active = speaker.id === activeSpeakerId;
              const ringColor = marketColor((mode === "theoretical" ? speaker.vector_stated : speaker.vector_actual)[0] ?? 3);
              return (
                <motion.div
                  key={speaker.id}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  animate={{ scale: active ? 1.03 : 1, opacity: active ? 1 : 0.85 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: 20,
                        padding: active ? 3 : 1,
                        border: active ? `1px solid ${ringColor}` : "1px solid rgba(255,255,255,0.2)",
                        boxShadow: active ? `0 0 28px ${ringColor}88` : "none",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <ImageWithFallback
                        src={speaker.photo}
                        alt={speaker.name}
                        loading="lazy"
                        className="h-full w-full rounded-[16px]"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="text-center">
                      <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#F2F6FC" }}>{speaker.name}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#B5C0CF", marginTop: 1 }}>{speaker.party} / {speaker.district}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div className="absolute bottom-3 right-3 rounded-md border border-white/20 bg-black/25 px-2 py-1" style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#D2D8E0" }}>
              {activeSpeaker == null ? "No active speaker" : `Live speaker: ${activeSpeaker.name}`}
            </div>
          </div>

          <div className="min-h-0 overflow-hidden rounded-2xl border border-[#D7DCE3] bg-white">
            <div className="border-b border-[#E4E8ED] px-4 py-3">
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#6E7686", letterSpacing: "0.08em" }}>
                LIVE TRANSCRIPTION HUD
              </div>
            </div>
            <div className="h-full max-h-[280px] space-y-2 overflow-y-auto p-4">
              {turns.length === 0 && (
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#6B7282" }}>
                  No transcript yet. Generate a debate to start simulated turn-taking.
                </div>
              )}
              {turns.map((turn, idx) => {
                const speaker = participants.find((p) => p.id === turn.speakerId);
                const isActive = idx === activeTurn;
                return (
                  <div
                    key={turn.id}
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: isActive ? "#0F766E" : "#E4E8ED",
                      background: isActive ? "rgba(15,118,110,0.06)" : "#FBFCFD",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: "#1A2434" }}>
                        {speaker?.name ?? "Unknown"}
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#6E7686" }}>
                        Voice: {turn.voice.voiceName} ({turn.voice.tier})
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#2C394E", marginTop: 6 }}>{turn.text}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {turn.triggeredAlleles.map((alleleId) => (
                        <span
                          key={`${turn.id}-${alleleId}`}
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 10,
                            borderRadius: 999,
                            border: "1px solid #C7D1DE",
                            background: "#EEF3F8",
                            color: "#334055",
                            padding: "2px 7px",
                          }}
                        >
                          {alleleId}: {ALLELE_LABEL[alleleId]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
