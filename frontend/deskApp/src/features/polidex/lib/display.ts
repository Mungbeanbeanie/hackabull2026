import { Politician } from "@/features/polidex/data/politicians";

export function partyLabel(party: Politician["party"]): string {
  if (party === "R") return "Republican";
  if (party === "D") return "Democrat";
  return "Independent";
}

export function districtLabel(district: string): string {
  if (district === "FL-Gov") return "Florida Governor";
  if (district === "FL-Sen") return "Florida U.S. Senate";

  const stateSenate = district.match(/^FL-Sen-(\d+)$/);
  if (stateSenate) return `Florida State Senate District ${stateSenate[1]}`;

  const usHouse = district.match(/^FL-(\d+)$/);
  if (usHouse) return `Florida U.S. House District ${usHouse[1]}`;

  return district.replace(/^FL\b/g, "Florida");
}

export function regionLabel(region: Politician["region"]): string {
  return region.replace(" FL", " Florida");
}

export function levelLabel(role: Politician["role"]): "Federal" | "State" {
  if (role.startsWith("U.S.") || role === "Governor") return "Federal";
  return "State";
}
