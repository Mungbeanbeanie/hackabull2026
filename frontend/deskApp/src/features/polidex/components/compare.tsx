import { useState } from "react";

import { politicians } from "@/features/polidex/data/politicians";
import { RankedPolitician } from "@/features/polidex/lib/api";
import { UserProfile } from "@/features/polidex/lib/profile";
import { FONT_SANS } from "@/features/polidex/lib/style";

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
}: {
  profile: UserProfile | null;
  ranked?: RankedPolitician[];
  isRanking?: boolean;
  backendOnline?: boolean | null;
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
            <ModeTab active={mode === "match"} onClick={() => setMode("match")} label="Best Matches For Me" />
          </InfoTooltip>
          <InfoTooltip content="Take the quiz to unlock vs mode" disabled={!!profile}>
            <ModeTab active={mode === "vsYou"} onClick={() => setMode("vsYou")} label="Me vs Politician" />
          </InfoTooltip>
          <ModeTab active={mode === "vsPol"} onClick={() => setMode("vsPol")} label="Compare Politicians" />
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
