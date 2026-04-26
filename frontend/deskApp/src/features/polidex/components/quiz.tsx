import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { taxonomy } from "@/features/polidex/data/taxonomy";
import { UserProfile, saveProfile } from "@/features/polidex/lib/profile";
import { FONT_SANS } from "@/features/polidex/lib/style";

const QUESTIONS = taxonomy.map((topic) => ({
  id: topic.id,
  prompt: questionFor(topic.name),
  left: topic.endpoint_1,
  right: topic.endpoint_5,
  topic: topic.name,
}));

function questionFor(name: string): string {
  const map: Record<string, string> = {
    "Market Autonomy": "How much should the government regulate businesses and markets?",
    "Fiscal Discipline": "Should the government spend expansively, or live within strict means?",
    "Tax Posture": "Should taxes be progressive on high earners, or kept low and flat?",
    "Energy Policy": "Should we mandate renewables, or stay reliant on fossil fuels?",
    "Education Vouchers": "Should school funding stay public, or follow students to any school?",
    "Immigration Posture": "Should the U.S. lean toward open immigration paths, or strict enforcement?",
    "Reproductive Rights": "Should reproductive rights be broadly protected or restricted?",
    "Gun Regulation": "Should gun laws be stricter, or more permissive?",
    "Healthcare Access": "Should healthcare be universal, or driven by private markets?",
    "Climate Action": "Should climate policy be aggressive, or skeptical of intervention?",
    "Foreign Policy": "Should the U.S. act through allies, or act unilaterally?",
    "Defense Spending": "Should defense spending be reduced, or expanded?",
    "Civil Liberties": "When liberty and security clash, which way do you lean?",
    "Voting Access": "Should voting rules be expansive, or require strict ID checks?",
    "Labor Rights": "Should the law favor unions, or right-to-work?",
    "Housing Policy": "Should housing be subsidized, or left to the market?",
    "Tech Regulation": "Should big tech face strict rules, or be left alone?",
    "Criminal Justice": "Should criminal justice focus on reform, or be tough on crime?",
    "Environmental Reg": "Should environmental rules be set federally, or by states?",
    "Cultural Continuity": "Should culture lean toward progressive change, or tradition?",
  };

  return map[name] ?? `Where do you stand on ${name}?`;
}

export function Quiz({
  onDone,
  onCancel,
}: {
  onDone: (profile: UserProfile) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [importance, setImportance] = useState<Record<string, number>>({});

  const current = QUESTIONS[step];
  const value = answers[current.id] ?? 3;
  const importanceValue = importance[current.id] ?? 0.5;

  const submit = () => {
    const vector = QUESTIONS.map((q) => answers[q.id] ?? 3);
    const weights = QUESTIONS.map((q) => importance[q.id] ?? 0.5);

    const profile: UserProfile = {
      vector,
      weights,
      updatedAt: new Date().toISOString(),
    };

    saveProfile(profile);
    onDone(profile);
  };

  const next = () => {
    if (!(current.id in answers)) {
      setAnswers((prev) => ({ ...prev, [current.id]: 3 }));
    }

    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      submit();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white" style={{ fontFamily: FONT_SANS }}>
      <div style={{ width: "100%", maxWidth: 720, padding: "0 32px" }}>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={onCancel}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: "#8A919E",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            &larr; Cancel
          </button>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E" }}>
            Question {step + 1} of {QUESTIONS.length}
          </div>
        </div>

        <div style={{ height: 4, background: "#F1F3F5", borderRadius: 2, overflow: "hidden", marginBottom: 36 }}>
          <motion.div
            animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: "#0D0F12", borderRadius: 2 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                color: "#1565C0",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {current.topic}
            </div>

            <h2
              style={{
                fontFamily: FONT_SANS,
                fontSize: 26,
                fontWeight: 400,
                color: "#0D0F12",
                lineHeight: 1.3,
                marginBottom: 28,
              }}
            >
              {current.prompt}
            </h2>

            <div className="flex flex-col gap-3 md:flex-row md:items-center" style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4B5260", flex: 1, textAlign: "left", maxWidth: 140 }}>
                {current.left}
              </div>

              <div className="flex flex-1 items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = value === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: n }))}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        border: active ? "2px solid #0D0F12" : "1px solid #E2E5E9",
                        background: active ? "#0D0F12" : "#FFFFFF",
                        color: active ? "#FFFFFF" : "#0D0F12",
                        fontFamily: FONT_SANS,
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4B5260", flex: 1, textAlign: "right", maxWidth: 140 }}>
                {current.right}
              </div>
            </div>

            <div className="mt-8">
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginBottom: 8 }}>
                How important is this issue to you?
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {[
                  { v: 0.25, l: "Not much" },
                  { v: 0.5, l: "Somewhat" },
                  { v: 0.75, l: "Very" },
                  { v: 1.0, l: "Critical" },
                ].map((option) => {
                  const active = Math.abs(importanceValue - option.v) < 0.01;
                  return (
                    <button
                      key={option.v}
                      onClick={() => setImportance((prev) => ({ ...prev, [current.id]: option.v }))}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: active ? "1.5px solid #0D0F12" : "1px solid #E2E5E9",
                        background: active ? "#F8F9FA" : "#FFFFFF",
                        color: "#0D0F12",
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {option.l}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #E2E5E9",
              background: "#FFFFFF",
              color: step === 0 ? "#C5CBD3" : "#0D0F12",
              cursor: step === 0 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ChevronLeft size={14} /> Back
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={next}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#0D0F12",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {step === QUESTIONS.length - 1 ? (
              <>
                Save my profile <Check size={14} />
              </>
            ) : (
              <>
                Next <ChevronRight size={14} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
