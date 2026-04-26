export type Donor = {
  name: string;
  tier: 2 | 3 | 4;
  amount: number;
  dimensions: string[];
};

export type Politician = {
  id: string;
  name: string;
  initials: string;
  party: "R" | "D" | "I";
  district: string;
  vector_stated: number[];
  vector_actual: number[];
  w: number;
  donors: Donor[];
  bio: string;
  photo: string;
  role: "U.S. Senate" | "U.S. House" | "Governor" | "State Senate" | "State House" | "Statewide";
  region: "North FL" | "Central FL" | "South FL" | "Statewide";
};

const v = (arr: number[]): number[] => arr;

const adherence = (a: number[], b: number[]) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return Math.max(0, 1 - (s / a.length) / 4);
};

type RawP = Omit<Politician, "w" | "photo" | "role" | "region">;

const PHOTOS = [
  "https://images.unsplash.com/photo-1579168064425-7a8f8ef3f1ea?w=400&q=75",
  "https://images.unsplash.com/photo-1531630142108-cb432ed39657?w=400&q=75",
  "https://images.unsplash.com/photo-1584940120505-117038d90b05?w=400&q=75",
  "https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?w=400&q=75",
  "https://images.unsplash.com/photo-1726226620773-aa4b24edd612?w=400&q=75",
  "https://images.unsplash.com/photo-1659355894406-977b8c4503d5?w=400&q=75",
  "https://images.unsplash.com/photo-1592878995758-02b32ddabdd3?w=400&q=75",
  "https://images.unsplash.com/photo-1594938350684-4c251b5030d1?w=400&q=75",
  "https://images.unsplash.com/photo-1740906010746-72aa48cea181?w=400&q=75",
  "https://images.unsplash.com/photo-1750741268857-7e44510f867d?w=400&q=75",
  "https://images.unsplash.com/photo-1766763845473-3cee8b8ea574?w=400&q=75",
  "https://images.unsplash.com/photo-1766763845459-08a5a630da65?w=400&q=75",
];

const META: Record<string, { role: Politician["role"]; region: Politician["region"] }> = {
  "bd-fl19": { role: "U.S. House", region: "South FL" },
  "jc-fl15": { role: "State Senate", region: "Central FL" },
  "am-flag": { role: "Statewide", region: "Statewide" },
  "rs-flgov": { role: "Governor", region: "Statewide" },
  "rs-flsen": { role: "U.S. Senate", region: "Statewide" },
  "mr-flsen": { role: "U.S. Senate", region: "Statewide" },
  "mw-fl23": { role: "U.S. House", region: "South FL" },
  "fc-fl20": { role: "U.S. House", region: "South FL" },
  "ms-fl09": { role: "U.S. House", region: "Central FL" },
  "kc-fl14": { role: "U.S. House", region: "Central FL" },
  "mw-flsd17": { role: "State Senate", region: "South FL" },
  "rs-fl08": { role: "U.S. House", region: "Central FL" },
  "ms-fl01": { role: "U.S. House", region: "North FL" },
  "as-fl04": { role: "U.S. House", region: "North FL" },
  "vs-fl27": { role: "U.S. House", region: "South FL" },
  "cm-fl26": { role: "U.S. House", region: "South FL" },
  "ds-fl17": { role: "U.S. House", region: "Central FL" },
  "mw-fl05": { role: "U.S. House", region: "North FL" },
  "kc-fl11": { role: "U.S. House", region: "Central FL" },
  "lf-fl22": { role: "U.S. House", region: "South FL" },
  "cd-fl12": { role: "U.S. House", region: "South FL" },
  "jm-fl13": { role: "U.S. House", region: "Central FL" },
  "vs-fl16": { role: "U.S. House", region: "Central FL" },
  "ms-fl06": { role: "U.S. House", region: "North FL" },
  "ds-fl21": { role: "U.S. House", region: "South FL" },
  "vs-fl07": { role: "U.S. House", region: "Central FL" },
  "ds-flag2": { role: "Statewide", region: "Statewide" },
  "cs-flsen": { role: "State Senate", region: "North FL" },
  "mp-flsen": { role: "State Senate", region: "South FL" },
  "ds-flhs2": { role: "State House", region: "South FL" },
  "ds-flhs3": { role: "State House", region: "Central FL" },
  "ml-flsen": { role: "State Senate", region: "Central FL" },
};

const raw: RawP[] = [
  {
    id: "bd-fl19", name: "Byron Donalds", initials: "BD", party: "R", district: "FL-19",
    vector_stated: v([3,4,4,5,5,5,5,5,5,2,5,5,4,4,4,5,5,5,5,4]),
    vector_actual: v([3,4,3,5,5,5,4,5,5,2,5,5,5,4,4,5,5,5,5,3]),
    bio: "U.S. Representative. Conservative fiscal posture; vocal on school choice.",
    donors: [
      { name: "Ballard Partners", tier: 3, amount: 48000, dimensions: ["p1", "p4"] },
      { name: "Academica Corp", tier: 3, amount: 32000, dimensions: ["p5"] },
      { name: "Club for Growth PAC", tier: 4, amount: 95000, dimensions: ["p1", "p3"] },
      { name: "NRA Victory Fund", tier: 4, amount: 22000, dimensions: ["p8"] },
      { name: "Donalds Family Trust", tier: 2, amount: 5000, dimensions: ["p20"] },
    ],
  },
  {
    id: "jc-fl15", name: "Jay Collins", initials: "JC", party: "R", district: "FL-Sen-14",
    vector_stated: v([4,4,4,4,5,4,4,5,4,3,5,5,4,4,4,4,5,5,4,4]),
    vector_actual: v([3,3,3,3,4,4,3,4,3,3,4,4,3,4,4,4,4,4,4,4]),
    bio: "State senator, veteran. Defense and veterans' affairs focus.",
    donors: [
      { name: "Lockheed Martin PAC", tier: 3, amount: 28000, dimensions: ["p12"] },
      { name: "Veterans for America", tier: 4, amount: 41000, dimensions: ["p11", "p12"] },
      { name: "FL Realtors PAC", tier: 4, amount: 15000, dimensions: ["p16"] },
      { name: "Publix Super Markets", tier: 3, amount: 12000, dimensions: ["p2"] },
      { name: "Collins Family", tier: 2, amount: 8000, dimensions: ["p20"] },
    ],
  },
  {
    id: "am-flag", name: "Ashley Moody", initials: "AM", party: "R", district: "FL-Sen",
    vector_stated: v([4,4,4,4,4,4,5,4,4,3,4,5,3,4,3,4,4,5,4,4]),
    vector_actual: v([4,3,3,3,4,5,5,4,4,2,4,5,2,4,3,4,3,5,4,4]),
    bio: "U.S. Senator (FL). Former Attorney General. Tough-on-crime, immigration enforcement.",
    donors: [
      { name: "GEO Group PAC", tier: 3, amount: 35000, dimensions: ["p6", "p18"] },
      { name: "Florida Chamber", tier: 3, amount: 28000, dimensions: ["p1"] },
      { name: "FOP State Lodge", tier: 4, amount: 18000, dimensions: ["p18"] },
      { name: "Disney Worldwide", tier: 3, amount: 9000, dimensions: ["p17"] },
      { name: "Moody Family", tier: 2, amount: 6000, dimensions: ["p20"] },
    ],
  },
  {
    id: "rs-flgov", name: "Ron DeSantis", initials: "RD", party: "R", district: "FL-Gov",
    vector_stated: v([4,5,5,4,5,4,5,4,4,2,5,5,3,4,3,4,5,5,4,5]),
    vector_actual: v([4,4,4,3,5,5,5,4,3,2,5,5,2,4,3,4,4,5,4,5]),
    bio: "Governor of Florida. Education reform, anti-DEI legislation.",
    donors: [
      { name: "Citadel LLC", tier: 3, amount: 75000, dimensions: ["p1", "p17"] },
      { name: "Friends of Ron PAC", tier: 4, amount: 200000, dimensions: ["p5", "p20"] },
      { name: "Academica Corp", tier: 3, amount: 50000, dimensions: ["p5"] },
      { name: "U.S. Sugar Corp", tier: 3, amount: 30000, dimensions: ["p4", "p19"] },
      { name: "DeSantis Family", tier: 2, amount: 4000, dimensions: ["p20"] },
    ],
  },
  {
    id: "rs-flsen", name: "Rick Scott", initials: "RS", party: "R", district: "FL-Sen",
    vector_stated: v([5,5,5,4,4,4,4,4,3,3,4,5,3,4,3,4,5,4,4,4]),
    vector_actual: v([5,5,5,4,4,4,4,4,3,3,4,5,3,4,3,4,5,4,4,4]),
    bio: "U.S. Senator. Hospital executive background. Healthcare and fiscal hawk.",
    donors: [
      { name: "HCA Healthcare", tier: 3, amount: 42000, dimensions: ["p9"] },
      { name: "New Republican PAC", tier: 4, amount: 120000, dimensions: ["p1"] },
      { name: "Florida Power & Light", tier: 3, amount: 25000, dimensions: ["p4", "p19"] },
      { name: "Scott Family", tier: 2, amount: 10000, dimensions: ["p20"] },
      { name: "Carnival Cruise PAC", tier: 3, amount: 14000, dimensions: ["p17"] },
    ],
  },
  {
    id: "mr-flsen", name: "Marco Rubio", initials: "MR", party: "R", district: "FL-Sen",
    vector_stated: v([4,4,4,3,4,4,5,4,3,3,5,5,3,3,3,4,4,5,3,4]),
    vector_actual: v([4,4,4,3,4,4,5,4,3,3,5,5,3,3,3,4,4,5,3,4]),
    bio: "U.S. Senator. Foreign affairs, tax policy, family economics.",
    donors: [
      { name: "Reclaim America PAC", tier: 4, amount: 85000, dimensions: ["p11"] },
      { name: "Disney Worldwide", tier: 3, amount: 22000, dimensions: ["p17"] },
      { name: "AIPAC", tier: 4, amount: 38000, dimensions: ["p11"] },
      { name: "Lockheed Martin", tier: 3, amount: 18000, dimensions: ["p12"] },
      { name: "Rubio Family", tier: 2, amount: 7000, dimensions: ["p20"] },
    ],
  },
  {
    id: "mw-fl23", name: "Debbie Wasserman Schultz", initials: "DW", party: "D", district: "FL-25",
    vector_stated: v([2,2,2,2,1,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    vector_actual: v([2,2,2,2,1,2,1,2,1,2,3,3,2,2,2,2,2,2,2,2]),
    bio: "U.S. Representative. Healthcare advocacy, women's rights.",
    donors: [
      { name: "EMILY's List", tier: 4, amount: 65000, dimensions: ["p7"] },
      { name: "AIPAC", tier: 4, amount: 28000, dimensions: ["p11"] },
      { name: "AFSCME", tier: 4, amount: 22000, dimensions: ["p15"] },
      { name: "Comcast PAC", tier: 3, amount: 15000, dimensions: ["p17"] },
      { name: "DWS Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "fc-fl20", name: "Frederica Wilson", initials: "FW", party: "D", district: "FL-24",
    vector_stated: v([1,2,1,2,1,1,1,2,1,1,2,3,1,1,1,2,2,2,1,2]),
    vector_actual: v([1,2,1,2,1,1,1,2,1,1,2,3,1,1,1,2,2,2,1,2]),
    bio: "U.S. Representative. Education, urban policy, civil rights.",
    donors: [
      { name: "NEA Advocacy Fund", tier: 4, amount: 32000, dimensions: ["p5", "p15"] },
      { name: "AFSCME", tier: 4, amount: 28000, dimensions: ["p15"] },
      { name: "CBC PAC", tier: 4, amount: 18000, dimensions: ["p18"] },
      { name: "AT&T PAC", tier: 3, amount: 9000, dimensions: ["p17"] },
      { name: "Wilson Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ms-fl09", name: "Maxwell Frost", initials: "MF", party: "D", district: "FL-10",
    vector_stated: v([2,2,2,1,2,1,1,1,1,1,2,2,1,1,1,1,2,2,1,1]),
    vector_actual: v([2,2,2,1,2,2,1,1,1,1,2,2,1,1,1,2,2,2,1,1]),
    bio: "U.S. Representative. Gun-violence prevention, climate.",
    donors: [
      { name: "Giffords PAC", tier: 4, amount: 45000, dimensions: ["p8"] },
      { name: "Sunrise Movement", tier: 4, amount: 28000, dimensions: ["p10", "p19"] },
      { name: "AFL-CIO", tier: 4, amount: 22000, dimensions: ["p15"] },
      { name: "WFP PAC", tier: 4, amount: 14000, dimensions: ["p9"] },
      { name: "Frost Family", tier: 2, amount: 1000, dimensions: ["p20"] },
    ],
  },
  {
    id: "kc-fl14", name: "Kathy Castor", initials: "KC", party: "D", district: "FL-14",
    vector_stated: v([2,2,2,1,2,2,1,2,1,1,2,3,2,2,2,2,2,2,1,2]),
    vector_actual: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    bio: "U.S. Representative. Climate and energy policy lead.",
    donors: [
      { name: "League of Conservation Voters", tier: 4, amount: 38000, dimensions: ["p10", "p19"] },
      { name: "TECO Energy", tier: 3, amount: 12000, dimensions: ["p4"] },
      { name: "AFSCME", tier: 4, amount: 18000, dimensions: ["p15"] },
      { name: "Disney Worldwide", tier: 3, amount: 10000, dimensions: ["p17"] },
      { name: "Castor Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "mw-flsd17", name: "Lori Berman", initials: "LB", party: "D", district: "FL-Sen-26",
    vector_stated: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    vector_actual: v([2,3,2,2,2,2,1,3,1,2,2,3,2,2,2,3,2,3,2,2]),
    bio: "State Senator. Healthcare and reproductive rights.",
    donors: [
      { name: "Planned Parenthood", tier: 4, amount: 28000, dimensions: ["p7"] },
      { name: "FL Education Assoc", tier: 4, amount: 18000, dimensions: ["p5", "p15"] },
      { name: "AHF Healthcare", tier: 3, amount: 12000, dimensions: ["p9"] },
      { name: "FL Realtors", tier: 4, amount: 8000, dimensions: ["p16"] },
      { name: "Berman Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "rs-fl08", name: "Bill Posey", initials: "BP", party: "R", district: "FL-8",
    vector_stated: v([4,4,4,4,4,4,4,5,3,4,4,5,3,4,3,4,4,4,4,4]),
    vector_actual: v([4,4,4,4,4,4,4,5,3,4,4,5,3,4,3,4,4,4,4,4]),
    bio: "U.S. Representative. Aerospace district focus.",
    donors: [
      { name: "Boeing PAC", tier: 3, amount: 22000, dimensions: ["p12"] },
      { name: "SpaceX", tier: 3, amount: 18000, dimensions: ["p17"] },
      { name: "NRA", tier: 4, amount: 15000, dimensions: ["p8"] },
      { name: "FL Chamber", tier: 3, amount: 12000, dimensions: ["p1"] },
      { name: "Posey Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ms-fl01", name: "Matt Gaetz", initials: "MG", party: "R", district: "FL-1",
    vector_stated: v([5,5,4,5,5,5,5,5,4,3,5,4,4,5,4,4,5,5,5,5]),
    vector_actual: v([5,4,4,5,5,5,5,5,4,3,5,4,4,5,4,4,5,5,5,5]),
    bio: "Former U.S. Representative. Anti-establishment conservative.",
    donors: [
      { name: "Friends of Matt PAC", tier: 4, amount: 95000, dimensions: ["p1", "p20"] },
      { name: "Crypto Innovation PAC", tier: 4, amount: 42000, dimensions: ["p17"] },
      { name: "NRA Victory", tier: 4, amount: 22000, dimensions: ["p8"] },
      { name: "FL Cattlemen", tier: 4, amount: 8000, dimensions: ["p19"] },
      { name: "Gaetz Family", tier: 2, amount: 12000, dimensions: ["p20"] },
    ],
  },
  {
    id: "as-fl04", name: "Aaron Bean", initials: "AB", party: "R", district: "FL-4",
    vector_stated: v([4,4,4,4,5,4,5,4,4,3,4,5,3,4,3,4,4,5,4,4]),
    vector_actual: v([4,4,4,4,5,4,5,4,4,3,4,5,3,4,3,4,4,5,4,4]),
    bio: "U.S. Representative. Education committee member.",
    donors: [
      { name: "Academica Corp", tier: 3, amount: 28000, dimensions: ["p5"] },
      { name: "Florida Chamber", tier: 3, amount: 18000, dimensions: ["p1"] },
      { name: "JAX Chamber PAC", tier: 4, amount: 14000, dimensions: ["p2"] },
      { name: "NRA", tier: 4, amount: 10000, dimensions: ["p8"] },
      { name: "Bean Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "vs-fl27", name: "Maria Salazar", initials: "MS", party: "R", district: "FL-27",
    vector_stated: v([4,4,3,3,4,3,4,3,3,3,5,4,3,3,3,3,3,4,3,3]),
    vector_actual: v([4,4,3,3,4,4,4,3,3,3,5,4,3,3,3,3,3,4,3,3]),
    bio: "U.S. Representative. Latin American policy focus.",
    donors: [
      { name: "Cuban American PAC", tier: 4, amount: 38000, dimensions: ["p11"] },
      { name: "FL Chamber", tier: 3, amount: 18000, dimensions: ["p1"] },
      { name: "AIPAC", tier: 4, amount: 22000, dimensions: ["p11"] },
      { name: "Univision PAC", tier: 3, amount: 8000, dimensions: ["p17"] },
      { name: "Salazar Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "cm-fl26", name: "Carlos Gimenez", initials: "CG", party: "R", district: "FL-28",
    vector_stated: v([4,4,4,3,4,4,4,4,3,3,5,4,3,4,3,3,4,4,3,3]),
    vector_actual: v([4,4,4,3,4,4,4,4,3,3,5,4,3,4,3,4,4,4,4,3]),
    bio: "U.S. Representative. Former Miami-Dade mayor.",
    donors: [
      { name: "Carnival Corp", tier: 3, amount: 32000, dimensions: ["p17"] },
      { name: "Royal Caribbean", tier: 3, amount: 28000, dimensions: ["p17"] },
      { name: "Florida Power & Light", tier: 3, amount: 18000, dimensions: ["p4"] },
      { name: "Cuban American PAC", tier: 4, amount: 14000, dimensions: ["p11"] },
      { name: "Gimenez Family", tier: 2, amount: 5000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ds-fl17", name: "Scott Franklin", initials: "SF", party: "R", district: "FL-18",
    vector_stated: v([4,4,4,4,4,4,4,4,4,3,5,5,3,4,3,4,4,4,4,4]),
    vector_actual: v([4,4,4,4,4,4,4,4,4,3,5,5,3,4,3,4,4,4,4,4]),
    bio: "U.S. Representative. Naval aviator background.",
    donors: [
      { name: "Publix Super Markets", tier: 3, amount: 22000, dimensions: ["p2"] },
      { name: "Lockheed Martin", tier: 3, amount: 18000, dimensions: ["p12"] },
      { name: "FL Citrus PAC", tier: 4, amount: 12000, dimensions: ["p19"] },
      { name: "NRA", tier: 4, amount: 9000, dimensions: ["p8"] },
      { name: "Franklin Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "mw-fl05", name: "John Rutherford", initials: "JR", party: "R", district: "FL-5",
    vector_stated: v([4,4,4,4,4,4,5,5,4,4,4,5,3,4,3,4,4,5,4,4]),
    vector_actual: v([4,4,4,4,4,4,5,5,4,4,4,5,3,4,3,4,4,5,4,4]),
    bio: "U.S. Representative. Former sheriff. Law enforcement.",
    donors: [
      { name: "FOP PAC", tier: 4, amount: 38000, dimensions: ["p18"] },
      { name: "GEO Group", tier: 3, amount: 22000, dimensions: ["p18"] },
      { name: "NRA Victory", tier: 4, amount: 18000, dimensions: ["p8"] },
      { name: "JAX Chamber", tier: 4, amount: 9000, dimensions: ["p2"] },
      { name: "Rutherford Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "kc-fl11", name: "Daniel Webster", initials: "DB", party: "R", district: "FL-11",
    vector_stated: v([4,4,4,4,4,4,5,4,3,4,4,4,3,4,4,4,4,4,4,5]),
    vector_actual: v([4,4,4,4,4,4,5,4,3,4,4,4,3,4,4,4,4,4,4,5]),
    bio: "U.S. Representative. Long-tenured social conservative.",
    donors: [
      { name: "FL Family Action", tier: 4, amount: 22000, dimensions: ["p7", "p20"] },
      { name: "Disney Worldwide", tier: 3, amount: 14000, dimensions: ["p17"] },
      { name: "AHCA PAC", tier: 4, amount: 9000, dimensions: ["p9"] },
      { name: "FL Chamber", tier: 3, amount: 12000, dimensions: ["p1"] },
      { name: "Webster Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "lf-fl22", name: "Lois Frankel", initials: "LF", party: "D", district: "FL-22",
    vector_stated: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    vector_actual: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    bio: "U.S. Representative. Women's caucus, foreign affairs.",
    donors: [
      { name: "EMILY's List", tier: 4, amount: 32000, dimensions: ["p7"] },
      { name: "AIPAC", tier: 4, amount: 22000, dimensions: ["p11"] },
      { name: "AFSCME", tier: 4, amount: 14000, dimensions: ["p15"] },
      { name: "NEA", tier: 4, amount: 12000, dimensions: ["p5"] },
      { name: "Frankel Family", tier: 2, amount: 1000, dimensions: ["p20"] },
    ],
  },
  {
    id: "cd-fl12", name: "Sheila Cherfilus-McCormick", initials: "SC", party: "D", district: "FL-20",
    vector_stated: v([2,2,2,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,1,1]),
    vector_actual: v([2,2,2,2,1,2,1,1,1,1,2,2,1,1,2,1,2,2,1,1]),
    bio: "U.S. Representative. Healthcare access, $1000/month proposal.",
    donors: [
      { name: "Trinity Health Care", tier: 3, amount: 88000, dimensions: ["p9"] },
      { name: "AFL-CIO", tier: 4, amount: 22000, dimensions: ["p15"] },
      { name: "CBC PAC", tier: 4, amount: 14000, dimensions: ["p18"] },
      { name: "EMILY's List", tier: 4, amount: 18000, dimensions: ["p7"] },
      { name: "Cherfilus Family", tier: 2, amount: 25000, dimensions: ["p20"] },
    ],
  },
  {
    id: "jm-fl13", name: "Anna Paulina Luna", initials: "AL", party: "R", district: "FL-13",
    vector_stated: v([5,5,4,5,5,5,5,5,4,3,5,5,4,5,4,4,5,5,5,5]),
    vector_actual: v([5,4,4,4,5,5,5,5,4,3,5,5,4,5,4,4,5,5,4,5]),
    bio: "U.S. Representative. Veteran, populist conservative.",
    donors: [
      { name: "Friends of Luna PAC", tier: 4, amount: 65000, dimensions: ["p20"] },
      { name: "Crypto PAC", tier: 4, amount: 32000, dimensions: ["p17"] },
      { name: "NRA Victory", tier: 4, amount: 22000, dimensions: ["p8"] },
      { name: "FL Chamber", tier: 3, amount: 12000, dimensions: ["p1"] },
      { name: "Luna Family", tier: 2, amount: 3000, dimensions: ["p20"] },
    ],
  },
  {
    id: "vs-fl16", name: "Vern Buchanan", initials: "VB", party: "R", district: "FL-16",
    vector_stated: v([5,5,5,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,3,4]),
    vector_actual: v([5,5,5,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,4,4]),
    bio: "U.S. Representative. Auto/business owner. Tax policy.",
    donors: [
      { name: "Auto Dealers PAC", tier: 4, amount: 48000, dimensions: ["p1", "p17"] },
      { name: "FL Chamber", tier: 3, amount: 28000, dimensions: ["p1"] },
      { name: "AHCA PAC", tier: 4, amount: 18000, dimensions: ["p9"] },
      { name: "FL Realtors", tier: 4, amount: 14000, dimensions: ["p16"] },
      { name: "Buchanan Family", tier: 2, amount: 22000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ms-fl06", name: "Mike Waltz", initials: "MW", party: "R", district: "FL-6",
    vector_stated: v([4,4,4,4,4,4,4,4,3,3,5,5,3,4,3,4,4,5,4,4]),
    vector_actual: v([4,4,4,4,4,4,4,4,3,3,5,5,3,4,3,4,4,5,4,4]),
    bio: "Former U.S. Representative. Special forces background.",
    donors: [
      { name: "Lockheed Martin", tier: 3, amount: 32000, dimensions: ["p12"] },
      { name: "Veterans for America", tier: 4, amount: 22000, dimensions: ["p11", "p12"] },
      { name: "AIPAC", tier: 4, amount: 28000, dimensions: ["p11"] },
      { name: "FL Chamber", tier: 3, amount: 14000, dimensions: ["p1"] },
      { name: "Waltz Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ds-fl21", name: "Brian Mast", initials: "BM", party: "R", district: "FL-21",
    vector_stated: v([4,4,4,4,4,4,5,5,3,3,5,5,3,4,3,4,4,5,3,4]),
    vector_actual: v([4,4,4,4,4,4,5,5,3,3,5,5,3,4,3,4,4,5,4,4]),
    bio: "U.S. Representative. Veteran, environmental advocate.",
    donors: [
      { name: "AIPAC", tier: 4, amount: 38000, dimensions: ["p11"] },
      { name: "Everglades Trust", tier: 3, amount: 18000, dimensions: ["p19"] },
      { name: "Lockheed Martin", tier: 3, amount: 22000, dimensions: ["p12"] },
      { name: "NRA Victory", tier: 4, amount: 14000, dimensions: ["p8"] },
      { name: "Mast Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "vs-fl07", name: "Cory Mills", initials: "CM", party: "R", district: "FL-7",
    vector_stated: v([5,4,4,4,5,5,5,5,4,3,5,5,4,4,3,4,5,5,4,5]),
    vector_actual: v([5,4,4,4,5,5,5,5,4,3,5,5,4,4,3,4,5,5,4,5]),
    bio: "U.S. Representative. Defense contractor background.",
    donors: [
      { name: "Mills Defense Holdings", tier: 2, amount: 85000, dimensions: ["p12"] },
      { name: "NRA Victory", tier: 4, amount: 22000, dimensions: ["p8"] },
      { name: "Heritage Action", tier: 4, amount: 28000, dimensions: ["p20"] },
      { name: "FL Chamber", tier: 3, amount: 12000, dimensions: ["p1"] },
      { name: "Mills Family", tier: 2, amount: 18000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ds-flag2", name: "James Uthmeier", initials: "JU", party: "R", district: "FL-AG",
    vector_stated: v([4,4,4,4,5,5,5,4,4,3,4,5,3,5,3,4,4,5,4,4]),
    vector_actual: v([4,4,4,4,5,5,5,4,4,3,4,5,2,5,3,4,3,5,4,4]),
    bio: "Florida Attorney General. Election integrity, immigration.",
    donors: [
      { name: "Friends of Ron PAC", tier: 4, amount: 42000, dimensions: ["p20"] },
      { name: "GEO Group", tier: 3, amount: 28000, dimensions: ["p18"] },
      { name: "FL Chamber", tier: 3, amount: 18000, dimensions: ["p1"] },
      { name: "Heritage Action", tier: 4, amount: 12000, dimensions: ["p20"] },
      { name: "Uthmeier Family", tier: 2, amount: 2000, dimensions: ["p20"] },
    ],
  },
  {
    id: "cs-flsen", name: "Tracie Davis", initials: "TD", party: "D", district: "FL-Sen-5",
    vector_stated: v([2,2,2,2,2,2,1,2,1,2,2,3,2,1,2,2,2,2,2,2]),
    vector_actual: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    bio: "State Senator. Voting access, criminal justice reform.",
    donors: [
      { name: "FL Education Assoc", tier: 4, amount: 28000, dimensions: ["p5"] },
      { name: "ACLU PAC", tier: 4, amount: 18000, dimensions: ["p13", "p14"] },
      { name: "AFSCME", tier: 4, amount: 14000, dimensions: ["p15"] },
      { name: "EMILY's List", tier: 4, amount: 12000, dimensions: ["p7"] },
      { name: "Davis Family", tier: 2, amount: 1000, dimensions: ["p20"] },
    ],
  },
  {
    id: "mp-flsen", name: "Shevrin Jones", initials: "SJ", party: "D", district: "FL-Sen-34",
    vector_stated: v([2,2,2,1,1,1,1,2,1,1,2,3,1,1,2,2,2,2,1,1]),
    vector_actual: v([2,2,2,2,1,2,1,2,1,1,2,3,1,1,2,2,2,2,1,2]),
    bio: "State Senator. LGBTQ rights, education access.",
    donors: [
      { name: "Equality Florida", tier: 4, amount: 38000, dimensions: ["p20"] },
      { name: "FL Education Assoc", tier: 4, amount: 22000, dimensions: ["p5"] },
      { name: "AHF Healthcare", tier: 3, amount: 12000, dimensions: ["p9"] },
      { name: "AFSCME", tier: 4, amount: 14000, dimensions: ["p15"] },
      { name: "Jones Family", tier: 2, amount: 1000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ds-flhs2", name: "Daniel Perez", initials: "DP", party: "R", district: "FL-Hs-116",
    vector_stated: v([4,4,4,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,4,4]),
    vector_actual: v([4,4,4,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,4,4]),
    bio: "Florida House Speaker. Insurance, business.",
    donors: [
      { name: "FL Realtors PAC", tier: 4, amount: 48000, dimensions: ["p16"] },
      { name: "FL Insurance Council", tier: 3, amount: 32000, dimensions: ["p1"] },
      { name: "Disney Worldwide", tier: 3, amount: 18000, dimensions: ["p17"] },
      { name: "FL Chamber", tier: 3, amount: 22000, dimensions: ["p1"] },
      { name: "Perez Family", tier: 2, amount: 4000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ds-flhs3", name: "Anna Eskamani", initials: "AE", party: "D", district: "FL-Hs-42",
    vector_stated: v([1,2,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,1,1]),
    vector_actual: v([1,2,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,1,1]),
    bio: "State Representative. Reproductive rights, housing.",
    donors: [
      { name: "Planned Parenthood", tier: 4, amount: 42000, dimensions: ["p7"] },
      { name: "FL Rising PAC", tier: 4, amount: 28000, dimensions: ["p15", "p16"] },
      { name: "AFSCME", tier: 4, amount: 18000, dimensions: ["p15"] },
      { name: "EMILY's List", tier: 4, amount: 22000, dimensions: ["p7"] },
      { name: "Eskamani Family", tier: 2, amount: 1000, dimensions: ["p20"] },
    ],
  },
  {
    id: "ml-flsen", name: "Joe Gruters", initials: "JG", party: "R", district: "FL-Sen-22",
    vector_stated: v([5,5,5,4,5,5,5,4,4,3,5,5,3,4,3,4,5,5,4,5]),
    vector_actual: v([5,5,5,4,5,5,5,4,4,3,5,5,3,4,3,4,5,5,4,5]),
    bio: "State Senator. Trump-aligned conservative.",
    donors: [
      { name: "FL Chamber", tier: 3, amount: 28000, dimensions: ["p1"] },
      { name: "FL Realtors", tier: 4, amount: 22000, dimensions: ["p16"] },
      { name: "NRA", tier: 4, amount: 18000, dimensions: ["p8"] },
      { name: "Heritage Action", tier: 4, amount: 14000, dimensions: ["p20"] },
      { name: "Gruters Family", tier: 2, amount: 8000, dimensions: ["p20"] },
    ],
  },
];

export const politicians: Politician[] = raw.map((p, i) => ({
  ...p,
  w: adherence(p.vector_stated, p.vector_actual),
  photo: PHOTOS[i % PHOTOS.length],
  role: META[p.id]?.role ?? "U.S. House",
  region: META[p.id]?.region ?? "Statewide",
}));
