import { motion } from "motion/react";

import { FONT_SANS } from "@/features/polidex/lib/style";

export function ListBox({
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
