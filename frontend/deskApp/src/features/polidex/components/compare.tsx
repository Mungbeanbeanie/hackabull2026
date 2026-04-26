"use client";

import { useState } from "react";

import { politicians } from "@/features/polidex/data/politicians";
import { RankedPolitician } from "@/features/polidex/lib/api";
import { districtLabel, levelLabel, partyLabel, regionLabel } from "@/features/polidex/lib/display";
import { UserProfile, exportProfileCode } from "@/features/polidex/lib/profile";
import { FONT_MONO, FONT_SANS, consistencyLabel } from "@/features/polidex/lib/style";

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
