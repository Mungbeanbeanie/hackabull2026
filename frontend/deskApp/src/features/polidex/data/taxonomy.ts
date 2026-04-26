export type Allele = {
  id: string;
  name: string;
  endpoint_1: string;
  endpoint_5: string;
  axis: "X" | "Y" | null;
};

export const taxonomy: Allele[] = [
  { id: "p1", name: "Market Autonomy", endpoint_1: "Regulated", endpoint_5: "Laissez-faire", axis: "X" },
  { id: "p2", name: "Fiscal Discipline", endpoint_1: "Expansive", endpoint_5: "Austere", axis: null },
  { id: "p3", name: "Tax Posture", endpoint_1: "Progressive", endpoint_5: "Flat/Cuts", axis: null },
  { id: "p4", name: "Energy Policy", endpoint_1: "Renewable Mandate", endpoint_5: "Fossil Continuity", axis: null },
  { id: "p5", name: "Education Vouchers", endpoint_1: "Public Only", endpoint_5: "Universal Choice", axis: null },
  { id: "p6", name: "Immigration Posture", endpoint_1: "Open Path", endpoint_5: "Restrictive", axis: null },
  { id: "p7", name: "Reproductive Rights", endpoint_1: "Protected", endpoint_5: "Restricted", axis: "Y" },
  { id: "p8", name: "Gun Regulation", endpoint_1: "Strict", endpoint_5: "Permissive", axis: null },
  { id: "p9", name: "Healthcare Access", endpoint_1: "Universal", endpoint_5: "Market-Based", axis: null },
  { id: "p10", name: "Climate Action", endpoint_1: "Aggressive", endpoint_5: "Skeptical", axis: null },
  { id: "p11", name: "Foreign Policy", endpoint_1: "Multilateral", endpoint_5: "Unilateral", axis: null },
  { id: "p12", name: "Defense Spending", endpoint_1: "Reduced", endpoint_5: "Expanded", axis: null },
  { id: "p13", name: "Civil Liberties", endpoint_1: "Maximal", endpoint_5: "Security First", axis: null },
  { id: "p14", name: "Voting Access", endpoint_1: "Expansive", endpoint_5: "Strict ID", axis: null },
  { id: "p15", name: "Labor Rights", endpoint_1: "Pro-Union", endpoint_5: "Right-to-Work", axis: null },
  { id: "p16", name: "Housing Policy", endpoint_1: "Subsidized", endpoint_5: "Market-Driven", axis: null },
  { id: "p17", name: "Tech Regulation", endpoint_1: "Strict", endpoint_5: "Hands-Off", axis: null },
  { id: "p18", name: "Criminal Justice", endpoint_1: "Reform", endpoint_5: "Tough-on-Crime", axis: null },
  { id: "p19", name: "Environmental Reg", endpoint_1: "Strong EPA", endpoint_5: "State Control", axis: null },
  { id: "p20", name: "Cultural Continuity", endpoint_1: "Progressive", endpoint_5: "Traditional", axis: null },
];
