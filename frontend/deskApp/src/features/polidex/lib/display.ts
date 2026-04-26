import { Politician } from "@/features/polidex/data/politicians";

const STATE_NAMES: Record<string, string> = {
  FL: "Florida",
  TX: "Texas",
};

export function partyLabel(party: Politician["party"]): string {
  if (party === "R") return "Republican";
  if (party === "D") return "Democrat";
  return "Independent";
}

export function districtLabel(district: string): string {
  if (district === "FL-Gov") return "Florida Governor";
  if (district === "FL-Sen") return "Florida U.S. Senate";
  if (district === "TX-Gov") return "Texas Governor";
  if (district === "TX-Sen") return "Texas U.S. Senate";

  const flStateSenate = district.match(/^FL-Sen-(\d+)$/);
  if (flStateSenate) return `Florida State Senate District ${flStateSenate[1]}`;

  const flHouse = district.match(/^FL-(\d+)$/);
  if (flHouse) return `Florida U.S. House District ${flHouse[1]}`;

  const txHouse = district.match(/^TX-(\d+)$/);
  if (txHouse) return `Texas U.S. House District ${txHouse[1]}`;

  return district;
}

export function regionLabel(region: Politician["region"]): string {
  return region.replace(" FL", " Florida");
}

export function locationLabel(p: Politician): string {
  if (p.region !== "Statewide") return regionLabel(p.region);
  return STATE_NAMES[p.state] ?? p.state;
}

export function levelLabel(role: Politician["role"]): "Federal" | "State" {
  if (role.startsWith("U.S.") || role === "Governor") return "Federal";
  return "State";
}
