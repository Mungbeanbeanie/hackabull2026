import { FONT_SANS } from "@/features/polidex/lib/style";

export function ModeTab({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_SANS,
        fontSize: 13,
        padding: "8px 14px",
        borderRadius: 8,
        background: active ? "#0D0F12" : "#FFFFFF",
        border: active ? "1px solid #0D0F12" : "1px solid #E2E5E9",
        color: active ? "white" : disabled ? "#C5CBD3" : "#0D0F12",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
}
