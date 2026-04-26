export const FONT_SANS = "var(--font-plus-jakarta)";
export const FONT_MONO = "var(--font-plex-mono)";

export const consistencyColor = (value: number) => {
  if (value >= 0.96) return "#1B6B3A";
  if (value >= 0.92) return "#7A4F00";
  return "#991B1B";
};

export const consistencyLabel = (value: number) => {
  if (value >= 0.96) return "HIGH";
  if (value >= 0.92) return "MID";
  return "LOW";
};
