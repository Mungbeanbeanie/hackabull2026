import { Button } from "@/components/ui/button";

import { UserProfile } from "@/features/poliweb/lib/profile";
import { FONT_SANS } from "@/features/poliweb/lib/style";
import { View } from "@/features/poliweb/types";

import { BrandLogo } from "./ui/brand-logo";
import { InfoTooltip } from "./ui/info-tooltip";

export function TopNav({
  view,
  setView,
  profile,
  onTakeQuiz,
  onClearProfile,
  onHome,
}: {
  view: View;
  setView: (v: View) => void;
  profile: UserProfile | null;
  onTakeQuiz: () => void;
  onClearProfile: () => void;
  onHome: () => void;
}) {
  return (
    <div
      className="flex h-14 items-center justify-between border-b border-[#E2E5E9] bg-white px-5 md:px-8"
      style={{ fontFamily: FONT_SANS }}
    >
      <button
        onClick={onHome}
        className="flex items-center gap-3 bg-transparent p-0"
        style={{ border: "none", cursor: "pointer" }}
      >
        <BrandLogo size="sm" />
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        <InfoTooltip content="Explore politicians">
          <NavTab active={view === "dashboard"} onClick={() => setView("dashboard")} label="Politicians" />
        </InfoTooltip>
        <InfoTooltip content="Compare views">
          <NavTab active={view === "compare"} onClick={() => setView("compare")} label="Compare" />
        </InfoTooltip>
        <InfoTooltip content="Simulate a vector-grounded debate">
          <NavTab active={view === "simulator"} onClick={() => setView("simulator")} label="Simulator" />
        </InfoTooltip>
      </div>

      <div className="flex items-center gap-2">
        {profile ? (
          <>
            <div className="hidden text-xs text-[#4B5260] lg:block">Profile saved</div>
            <InfoTooltip content="Update your political beliefs">
              <Button
                variant="outline"
                size="sm"
                onClick={onTakeQuiz}
                className="h-7 border-[#E2E5E9] px-3 text-xs text-[#0D0F12]"
                style={{ fontFamily: FONT_SANS }}
              >
                Retake quiz
              </Button>
            </InfoTooltip>
            <InfoTooltip content="Delete your profile">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearProfile}
                className="h-7 border-[#E2E5E9] px-3 text-xs text-[#8A919E]"
                style={{ fontFamily: FONT_SANS }}
              >
                Clear
              </Button>
            </InfoTooltip>
          </>
        ) : (
          <InfoTooltip content="Take a quick quiz to see your alignment">
            <Button
              onClick={onTakeQuiz}
              className="h-8 bg-[#0D0F12] px-3.5 text-xs font-medium text-white hover:bg-[#161a20]"
              style={{ fontFamily: FONT_SANS }}
            >
              Take the quiz
            </Button>
          </InfoTooltip>
        )}
      </div>
    </div>
  );
}

function NavTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT_SANS,
        fontSize: 13,
        padding: "7px 14px",
        borderRadius: 8,
        background: active ? "#F1F3F5" : "transparent",
        color: active ? "#0D0F12" : "#4B5260",
        border: "none",
        cursor: "pointer",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
}
