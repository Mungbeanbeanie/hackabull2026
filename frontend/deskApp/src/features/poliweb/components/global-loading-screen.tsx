import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { FONT_MONO, FONT_SANS } from "@/features/poliweb/lib/style";

import { BrandLogo } from "./ui/brand-logo";

export function GlobalLoadingScreen({
  onComplete,
  backendOnline,
}: {
  onComplete: () => void;
  backendOnline: boolean | null;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white" style={{ fontFamily: FONT_SANS }}>
      <div style={{ marginBottom: 28 }}>
        <BrandLogo size="md" />
      </div>
      <div style={{ width: 280 }}>
        <div
          className="mb-3 flex items-center justify-between"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: "#8A919E",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <span>Initializing Civic Data</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: "100%", height: 3, background: "#F1F3F5", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            style={{ width: `${progress}%`, height: "100%", background: "#0D0F12" }}
            transition={{ ease: "linear" }}
          />
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: "#4B5260", textAlign: "center" }}>
          <motion.span
            key={Math.floor(progress / 33)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {progress < 30
              ? backendOnline === null
                ? "Connecting to backend..."
                : backendOnline
                  ? "Backend connected."
                  : "Backend offline — demo mode."
              : progress < 60
                ? "Loading policy vectors..."
                : progress < 90
                  ? "Calculating drift variances..."
                  : "Ready."}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
