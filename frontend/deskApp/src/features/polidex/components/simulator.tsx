"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Politician } from "@/features/polidex/data/politicians";
import { taxonomy } from "@/features/polidex/data/taxonomy";
import { generateSimulationTranscript, synthesizeTranscriptAudio } from "@/features/polidex/lib/api";
import { UserProfile } from "@/features/polidex/lib/profile";
import { FONT_MONO, FONT_SANS } from "@/features/polidex/lib/style";

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

type StageSlot = {
  leftPercent: number;
  topPercent: number;
};

const STAGE_W = 1280;
const STAGE_H = 720;

const PLAYBACK_SPEEDS = [
  { label: "0.75x", value: 0.75 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

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
  if (score <= 2) return "#2A7F62";
  if (score <= 3.4) return "#C97C1F";
  return "#B13A2C";
}

function getStageSlots(count: number): StageSlot[] {
  if (count <= 2) {
    return [
      { leftPercent: 24, topPercent: 50 },
      { leftPercent: 76, topPercent: 50 },
    ];
  }

  if (count === 3) {
    return [
      { leftPercent: 50, topPercent: 15 },
      { leftPercent: 22, topPercent: 78 },
      { leftPercent: 78, topPercent: 78 },
    ];
  }

  return [
    { leftPercent: 22, topPercent: 22 },
    { leftPercent: 78, topPercent: 22 },
    { leftPercent: 22, topPercent: 78 },
    { leftPercent: 78, topPercent: 78 },
  ];
}

function shortName(name: string): string {
  const [first, last] = name.split(" ");
  if (!first) return name;
  if (!last) return first;
  return `${first} ${last[0]}.`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current.length > 0 ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current.length > 0) lines.push(current);
      current = word;
    }
  }

  if (current.length > 0) lines.push(current);
  return lines;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
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

  let opening = "The implementation details matter";
  if (turnIndex === 0) {
    opening = "My baseline is simple";
  } else if (turnIndex % 3 === 0) {
    opening = "Let me push this further";
  } else if (turnIndex % 2 === 0) {
    opening = "Where I disagree is the mechanism";
  }

  let stance = `On ${anchorLabel}, I support a middle track with targeted intervention and strict feedback loops.`;
  if (anchorScore >= 4.2) {
    stance = `On ${anchorLabel}, I favor a high-autonomy approach with fewer central constraints and stronger local discretion.`;
  } else if (anchorScore <= 1.8) {
    stance = `On ${anchorLabel}, I favor stronger public guardrails, broader access guarantees, and direct accountability.`;
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

function nextSelectedIds(current: string[], id: string): string[] {
  if (current.includes(id)) {
    if (current.length <= 2) return current;
    return current.filter((x) => x !== id);
  }
  if (current.length >= 4) return current;
  return [...current, id];
}

export function Simulator({ list, profile }: Readonly<{ list: Politician[]; profile: UserProfile | null }>) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => list.slice(0, 3).map((p) => p.id));
  const [mode, setMode] = useState<SimMode>("theoretical");
  const [topicId, setTopicId] = useState<string>(TOPICS[0].id);
  const [turns, setTurns] = useState<SimTurn[]>([]);
  const [activeTurn, setActiveTurn] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [exportJob, setExportJob] = useState<"webm" | "mp4" | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportMimeType, setExportMimeType] = useState<"video/webm" | "video/mp4" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const turnAudioCacheRef = useRef<Map<string, string>>(new Map());

  const topic = useMemo(() => TOPICS.find((t) => t.id === topicId) ?? TOPICS[0], [topicId]);
  const participants = useMemo(() => list.filter((p) => selectedIds.includes(p.id)), [list, selectedIds]);

  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q));
  }, [list, query]);

  const stageSlots = useMemo(() => getStageSlots(participants.length), [participants.length]);

  const selectedTurn = turns[activeTurn] ?? null;

  const activeSpeakerId = selectedTurn?.speakerId ?? participants[0]?.id ?? null;
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) ?? null;
  const isExporting = exportJob !== null;

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
    }, Math.round(1700 / playbackSpeed));

    return () => clearInterval(timer);
  }, [isRunning, turns.length, playbackSpeed]);

  useEffect(() => {
    return () => {
      if (exportUrl !== null) {
        URL.revokeObjectURL(exportUrl);
      }
    };
  }, [exportUrl]);

  useEffect(() => {
    const player = audioRef.current;
    const currentTurn = turns[activeTurn];
    if (!player || !isRunning || !currentTurn) return;

    let canceled = false;
    const cacheKey = currentTurn.id;
    const cached = turnAudioCacheRef.current.get(cacheKey);

    const playUrl = async (url: string) => {
      if (canceled || audioRef.current == null) return;
      try {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
        await audioRef.current.play();
      } catch {
        setAudioError("Unable to autoplay this turn audio.");
      }
    };

    if (cached) {
      void playUrl(cached);
      return () => {
        canceled = true;
      };
    }

    void synthesizeTranscriptAudio(currentTurn.text, currentTurn.voice.voiceName)
      .then((res) => {
        if (canceled) return;
        const blob = new Blob([Uint8Array.from(atob(res.audioBase64), (char) => char.charCodeAt(0))], { type: res.mimeType || "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        turnAudioCacheRef.current.set(cacheKey, url);
        void playUrl(url);
      })
      .catch(() => {
        if (!canceled) setAudioError("ElevenLabs audio unavailable; transcript is still generated.");
      });

    return () => {
      canceled = true;
    };
  }, [activeTurn, isRunning, playbackSpeed, turns]);

  useEffect(() => {
    return () => {
      turnAudioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      turnAudioCacheRef.current.clear();
    };
  }, []);

  const toggleParticipant = (id: string) => {
    setSelectedIds((current) => nextSelectedIds(current, id));
  };

  const runSimulation = async () => {
    if (participants.length < 2) return;
    setTranscriptLoading(true);
    setAudioError(null);
    setExportError(null);
    try {
      const generated = await generateSimulationTranscript({
        participants: participants.map((participant) => ({
          id: participant.id,
          name: participant.name,
          party: participant.party,
          district: participant.district,
          role: participant.role,
          vector_stated: participant.vector_stated,
          vector_actual: participant.vector_actual,
        })),
        topic: { id: topic.id, label: topic.label, alleles: topic.alleles },
        mode,
        userProfile: profile
          ? {
              vector: profile.vector,
              weights: profile.weights,
              state: profile.state,
            }
          : undefined,
      });

      const participantById = new Map(participants.map((participant) => [participant.id, participant]));
      const next: SimTurn[] = generated.turns.map((turn, index) => {
        const speaker = participantById.get(turn.speakerId) ?? participants[index % participants.length];
        return {
          id: `${speaker.id}-${index}`,
          speakerId: speaker.id,
          text: turn.text,
          triggeredAlleles: turn.triggeredAlleles,
          voice: getVoiceProfile(speaker),
        };
      });

      setTurns(next);
      setActiveTurn(0);
      setIsRunning(true);
    } catch {
      const fallback = buildSimulation(participants, topic, mode);
      setTurns(fallback);
      setActiveTurn(0);
      setIsRunning(true);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTurns([]);
    setActiveTurn(0);
    setExportError(null);
    setAudioError(null);
  };

  const goPrevTurn = () => {
    setIsRunning(false);
    setActiveTurn((prev) => Math.max(0, prev - 1));
  };

  const goNextTurn = () => {
    setIsRunning(false);
    setActiveTurn((prev) => Math.min(turns.length - 1, prev + 1));
  };

  const loadParticipantImages = async () => {
    const imageEntries = await Promise.all(participants.map(async (p) => [p.id, await loadImage(p.photo)] as const));
    return new Map<string, HTMLImageElement | null>(imageEntries);
  };

  const drawStageFrame = ({
    ctx,
    frameTurn,
    images,
  }: {
    ctx: CanvasRenderingContext2D;
    frameTurn: SimTurn | null;
    images: Map<string, HTMLImageElement | null>;
  }) => {
    const gradient = ctx.createRadialGradient(STAGE_W * 0.22, STAGE_H * 0.18, 90, STAGE_W * 0.5, STAGE_H * 0.5, STAGE_W * 0.75);
    gradient.addColorStop(0, "#1D4448");
    gradient.addColorStop(0.55, "#161F29");
    gradient.addColorStop(1, "#0E1318");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#D46A3C";
    ctx.beginPath();
    ctx.ellipse(STAGE_W * 0.8, STAGE_H * 0.76, 220, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(STAGE_W / 2, STAGE_H / 2, 102, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(STAGE_W / 2, STAGE_H / 2, 96, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#D9E2EF";
    ctx.font = "600 14px var(--font-plex-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText(mode === "theoretical" ? "VTHEORETICAL" : "VLEGISLATIVE", STAGE_W / 2, STAGE_H / 2 - 5);
    ctx.fillStyle = "#F6F9FC";
    ctx.font = "400 15px var(--font-plus-jakarta), sans-serif";
    ctx.fillText(topic.label, STAGE_W / 2, STAGE_H / 2 + 18);

    participants.forEach((speaker, index) => {
      const slot = stageSlots[index] ?? { leftPercent: 50, topPercent: 50 };
      const cx = (slot.leftPercent / 100) * STAGE_W;
      const cy = (slot.topPercent / 100) * STAGE_H;
      const active = frameTurn?.speakerId === speaker.id;
      const scale = active ? 1.13 : 1;
      const size = 126 * scale;
      const ringScore = (mode === "theoretical" ? speaker.vector_stated : speaker.vector_actual)[0] ?? 3;
      const ringColor = marketColor(ringScore);

      if (active) {
        ctx.save();
        ctx.shadowBlur = 35;
        ctx.shadowColor = `${ringColor}CC`;
      }

      ctx.strokeStyle = active ? ringColor : "rgba(255,255,255,0.22)";
      ctx.lineWidth = active ? 4 : 2;
      ctx.beginPath();
      ctx.roundRect(cx - size / 2, cy - size / 2, size, size, 22);
      ctx.stroke();

      const image = images.get(speaker.id);
      if (image) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cx - size / 2 + 3, cy - size / 2 + 3, size - 6, size - 6, 18);
        ctx.clip();
        ctx.drawImage(image, cx - size / 2 + 3, cy - size / 2 + 3, size - 6, size - 6);
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.beginPath();
        ctx.roundRect(cx - size / 2 + 3, cy - size / 2 + 3, size - 6, size - 6, 18);
        ctx.fill();
      }

      if (active) ctx.restore();

      ctx.fillStyle = "#F3F7FC";
      ctx.font = "600 18px var(--font-plus-jakarta), sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(shortName(speaker.name), cx, cy + size / 2 + 24);

      ctx.fillStyle = "#ACBACB";
      ctx.font = "500 13px var(--font-plex-mono), monospace";
      ctx.fillText(`${speaker.party} / ${speaker.district}`, cx, cy + size / 2 + 43);
    });

    if (frameTurn) {
      const speaker = participants.find((p) => p.id === frameTurn.speakerId);
      const label = speaker ? `Live speaker: ${speaker.name}` : "Live speaker";
      const panelW = 340;
      const panelX = STAGE_W - panelW - 28;
      const panelY = STAGE_H - 118;

      ctx.fillStyle = "rgba(10,15,20,0.62)";
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, 90, 12);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.stroke();

      ctx.fillStyle = "#D4DCE8";
      ctx.font = "500 12px var(--font-plex-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, panelX + 14, panelY + 22);

      ctx.fillStyle = "#EEF3FA";
      ctx.font = "500 13px var(--font-plus-jakarta), sans-serif";
      const lines = wrapText(ctx, frameTurn.text, panelW - 26).slice(0, 2);
      lines.forEach((line, index) => {
        ctx.fillText(line, panelX + 14, panelY + 46 + index * 20);
      });
    }
  };

  const exportSimulationVideo = async () => {
    if (turns.length === 0 || participants.length === 0) return;

    if (globalThis.window === undefined) return;

    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    const stream = canvas.captureStream(30);
    if (!stream) {
      setExportError("Unable to capture simulation stream in this browser.");
      return;
    }

    const supportedMime = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((type) => globalThis.MediaRecorder?.isTypeSupported(type));

    if (!supportedMime || !globalThis.MediaRecorder) {
      setExportError("Video export requires MediaRecorder support (try Chrome or Edge).");
      return;
    }

    setExportError(null);
    setExportJob("webm");
    setIsRunning(false);

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: supportedMime });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    recorder.start();

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      recorder.stop();
      await stopped;
      setExportJob(null);
      setExportError("Unable to initialize export renderer.");
      return;
    }

    const imageMap = await loadParticipantImages();

    const frameDelay = Math.max(600, Math.round(1200 / playbackSpeed));

    for (let index = 0; index < turns.length; index++) {
      const frameTurn = turns[index];
      setActiveTurn(index);
      drawStageFrame({ ctx, frameTurn, images: imageMap });
      await new Promise((resolve) => globalThis.setTimeout(resolve, frameDelay));
    }

    drawStageFrame({ ctx, frameTurn: turns.at(-1) ?? null, images: imageMap });
    await new Promise((resolve) => globalThis.setTimeout(resolve, 650));

    recorder.stop();
    await stopped;

    const blob = new Blob(chunks, { type: supportedMime });
    const nextUrl = URL.createObjectURL(blob);

    if (exportUrl) URL.revokeObjectURL(exportUrl);
    setExportUrl(nextUrl);
    setExportMimeType("video/webm");
    setExportJob(null);
  };

  const exportSimulationMp4 = async () => {
    if (turns.length === 0 || participants.length === 0) return;
    if (globalThis.window === undefined) return;

    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    if (globalThis.VideoEncoder === undefined || globalThis.VideoFrame === undefined) {
      setExportError("MP4 export requires WebCodecs support (Chrome or Edge recommended).");
      return;
    }

    setExportError(null);
    setExportJob("mp4");
    setIsRunning(false);

    try {
      const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");

      const fps = 30;
      const frameDurationUs = Math.round(1_000_000 / fps);
      const config: VideoEncoderConfig = {
        codec: "avc1.42001E",
        width: STAGE_W,
        height: STAGE_H,
        bitrate: 4_000_000,
        framerate: fps,
      };

      const supported = await globalThis.VideoEncoder.isConfigSupported(config);
      if (!supported.supported) {
        setExportError("This browser cannot encode H.264 for MP4 export.");
        setExportJob(null);
        return;
      }

      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: {
          codec: "avc",
          width: STAGE_W,
          height: STAGE_H,
          frameRate: fps,
        },
        fastStart: "in-memory",
      });

      let encodeError: string | null = null;
      const encoder = new globalThis.VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta);
        },
        error: (error) => {
          encodeError = error.message;
        },
      });

      const encoderConfig = supported.config ?? config;
      encoder.configure(encoderConfig);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        encoder.close();
        setExportError("Unable to initialize export renderer.");
        setExportJob(null);
        return;
      }

      const imageMap = await loadParticipantImages();
      const turnDelayMs = Math.max(600, Math.round(1200 / playbackSpeed));

      let frameIndex = 0;
      let timestampUs = 0;

      for (let index = 0; index < turns.length; index++) {
        const frameTurn = turns[index];
        setActiveTurn(index);

        const frameCount = Math.max(1, Math.round((turnDelayMs / 1000) * fps));
        for (let localFrame = 0; localFrame < frameCount; localFrame++) {
          drawStageFrame({ ctx, frameTurn, images: imageMap });
          const frame = new globalThis.VideoFrame(canvas, { timestamp: timestampUs });
          encoder.encode(frame, { keyFrame: frameIndex % fps === 0 });
          frame.close();
          frameIndex += 1;
          timestampUs += frameDurationUs;
        }
      }

      const finalTurn = turns.at(-1) ?? null;
      const finalFrames = Math.round(0.7 * fps);
      for (let localFrame = 0; localFrame < finalFrames; localFrame++) {
        drawStageFrame({ ctx, frameTurn: finalTurn, images: imageMap });
        const frame = new globalThis.VideoFrame(canvas, { timestamp: timestampUs });
        encoder.encode(frame, { keyFrame: frameIndex % fps === 0 });
        frame.close();
        frameIndex += 1;
        timestampUs += frameDurationUs;
      }

      await encoder.flush();
      encoder.close();

      if (encodeError) {
        setExportError(`MP4 encoding failed: ${encodeError}`);
        setExportJob(null);
        return;
      }

      muxer.finalize();
      const nextUrl = URL.createObjectURL(new Blob([target.buffer], { type: "video/mp4" }));

      if (exportUrl) URL.revokeObjectURL(exportUrl);
      setExportUrl(nextUrl);
      setExportMimeType("video/mp4");
    } catch {
      setExportError("MP4 export is not available in this browser environment.");
    } finally {
      setExportJob(null);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="border-b border-[#E2E5E9] px-5 pb-4 pt-6 md:px-8">
        <h1 style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, letterSpacing: "-0.02em", color: "#0D0F12" }}>
          Simulator
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginTop: 4 }}>
          Run a vector-grounded policy debate across selected politicians, then review transcript and export playback.
        </p>
      </div>

      <div className="grid flex-1 gap-5 px-5 py-6 md:grid-cols-[340px_1fr] md:px-8" style={{ minHeight: 0, background: "#F8F9FA" }}>
        <div className="flex min-h-0 flex-col rounded-xl border border-[#E2E5E9] bg-white p-4">
          <div className="mb-3" style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#6E7686", letterSpacing: "0.08em" }}>
            Scenario Controls
          </div>

          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Topic</div>
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

          <div className="mt-4 border-t border-[#EEF2F5] pt-4">
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Adherence Override</div>
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

          <div className="mt-4 border-t border-[#EEF2F5] pt-4">
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#495163" }}>Participants ({selectedIds.length}/4)</div>
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

          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#EEF2F5] pt-4">
            <Button
              onClick={runSimulation}
              disabled={participants.length < 2 || transcriptLoading}
              className="h-9 bg-[#0D0F12] text-white hover:bg-[#202530]"
              style={{ fontFamily: FONT_SANS, fontSize: 12 }}
            >
              {transcriptLoading ? "Generating with Gemini..." : "Generate Simulation"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setIsRunning((v) => !v)}
                disabled={turns.length === 0}
                variant="outline"
                className="h-8 border-[#D7DCE3]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                {isRunning ? "Pause" : "Play"}
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
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={goPrevTurn}
                disabled={turns.length === 0 || activeTurn === 0}
                variant="outline"
                className="h-8 border-[#D7DCE3]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                Prev
              </Button>
              <Button
                onClick={goNextTurn}
                disabled={turns.length === 0 || activeTurn >= turns.length - 1}
                variant="outline"
                className="h-8 border-[#D7DCE3]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                Next
              </Button>
              <select
                value={playbackSpeed}
                onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
                className="h-8 rounded-md border border-[#D7DCE3] bg-white px-2"
                style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1A2434" }}
              >
                {PLAYBACK_SPEEDS.map((speed) => (
                  <option key={speed.value} value={speed.value}>
                    {speed.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, turns.length - 1)}
              value={Math.min(activeTurn, Math.max(0, turns.length - 1))}
              onChange={(event) => {
                setIsRunning(false);
                setActiveTurn(Number(event.target.value));
              }}
              disabled={turns.length === 0}
              className="mt-1 w-full accent-[#0F766E]"
            />
            <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#788193" }}>
              <span>Turn {turns.length === 0 ? 0 : activeTurn + 1}</span>
              <span>Total {turns.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={exportSimulationVideo}
                disabled={turns.length === 0 || isExporting}
                className="h-9 bg-[#1E3A5F] text-white hover:bg-[#1A304E]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                {exportJob === "webm" ? "Rendering WebM..." : "Export WebM"}
              </Button>
              <Button
                onClick={exportSimulationMp4}
                disabled={turns.length === 0 || isExporting}
                className="h-9 bg-[#0B6B66] text-white hover:bg-[#095A56]"
                style={{ fontFamily: FONT_SANS, fontSize: 12 }}
              >
                {exportJob === "mp4" ? "Rendering MP4..." : "Export MP4"}
              </Button>
            </div>
            {exportError && (
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#A53131" }}>{exportError}</div>
            )}
            {audioError && (
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#A53131" }}>{audioError}</div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-[#E2E5E9] bg-[#FAFBFC] p-3">
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
          <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-[#E2E5E9] bg-[#10161C]">
            <div className="absolute left-0 top-0 h-full w-full opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #2A7F62 0%, transparent 40%), radial-gradient(circle at 70% 70%, #B13A2C 0%, transparent 45%)" }} />

            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
              <div className="flex h-full w-full flex-col items-center justify-center px-2 text-center">
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#D0D8E3", letterSpacing: "0.08em" }}>
                  {mode === "theoretical" ? "VTHEORETICAL" : "VLEGISLATIVE"}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#F4F7FA", marginTop: 4 }}>{topic.label}</div>
              </div>
            </div>

            {participants.map((speaker, idx) => {
              const slot = stageSlots[idx] ?? { leftPercent: 50, topPercent: 50 };
              const active = speaker.id === activeSpeakerId;
              const ringColor = marketColor((mode === "theoretical" ? speaker.vector_stated : speaker.vector_actual)[0] ?? 3);
              return (
                <motion.div
                  key={speaker.id}
                  className="absolute"
                  style={{
                    left: `${slot.leftPercent}%`,
                    top: `${slot.topPercent}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: active ? 5 : 2,
                  }}
                  animate={{ scale: active ? 1.12 : 1, opacity: active ? 1 : 0.84 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex w-[130px] flex-col items-center gap-2 text-center sm:w-[152px]">
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 20,
                        padding: active ? 4 : 1,
                        border: active ? `2px solid ${ringColor}` : "1px solid rgba(255,255,255,0.2)",
                        boxShadow: active ? `0 0 34px ${ringColor}AA` : "none",
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
                      <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#F2F6FC", fontWeight: active ? 600 : 500 }}>
                        {shortName(speaker.name)}
                      </div>
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

          <div className="grid min-h-0 gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="min-h-0 overflow-hidden rounded-xl border border-[#E2E5E9] bg-white">
              <div className="border-b border-[#E4E8ED] px-4 py-3">
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#6E7686", letterSpacing: "0.08em" }}>
                  Live Transcript
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

            <div className="min-h-0 overflow-hidden rounded-xl border border-[#E2E5E9] bg-white">
              <div className="border-b border-[#E4E8ED] px-4 py-3">
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#6E7686", letterSpacing: "0.08em" }}>
                  Playback Export
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#445266" }}>
                  Render the current simulation to a playbackable video, then preview and download it.
                </div>
                {exportUrl ? (
                  <>
                    <video
                      controls
                      src={exportUrl}
                      className="w-full rounded-lg border border-[#D7DCE3]"
                    >
                      <track kind="captions" />
                    </video>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#6E7686" }}>
                      Format: {exportMimeType === "video/mp4" ? "MP4 (H.264)" : "WebM"}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#C9D2DE] bg-[#F8FAFC] p-4" style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#6E7686" }}>
                    No video rendered yet.
                  </div>
                )}

                <a
                  href={exportUrl ?? "#"}
                  download={exportMimeType === "video/mp4" ? "simulator-playback.mp4" : "simulator-playback.webm"}
                  onClick={(event) => {
                    if (!exportUrl) event.preventDefault();
                  }}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-[#0D0F12] text-white"
                  style={{ fontFamily: FONT_SANS, fontSize: 12, pointerEvents: exportUrl ? "auto" : "none", opacity: exportUrl ? 1 : 0.45 }}
                >
                  Download Video
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={exportCanvasRef} width={STAGE_W} height={STAGE_H} className="hidden" />
      <audio ref={audioRef} className="hidden">
        <track kind="captions" />
      </audio>
    </div>
  );
}
