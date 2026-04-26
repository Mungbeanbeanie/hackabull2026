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
  state: string;
};

const v = (arr: number[]): number[] => arr;

type RawP = Omit<Politician, "w" | "photo" | "role" | "region" | "state">;

const FALLBACK_PHOTOS = [
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

// Official congressional headshots from bioguide.congress.gov.
// State-level officials (no federal bioguide) fall back to FALLBACK_PHOTOS.
const B = "https://bioguide.congress.gov/bioguide/photo";
const PHOTO_BY_ID: Record<string, string> = {
  // Florida federal
  "bd-fl19":  `${B}/D/D000032.jpg`, // Byron Donalds
  "rs-flgov": `${B}/D/D000600.jpg`, // Ron DeSantis (former FL-6)
  "rs-flsen": `${B}/S/S001217.jpg`, // Rick Scott
  "mr-flsen": `${B}/R/R000595.jpg`, // Marco Rubio
  "mw-fl23":  `${B}/W/W000797.jpg`, // Debbie Wasserman Schultz
  "fc-fl20":  `${B}/W/W000808.jpg`, // Frederica Wilson
  "ms-fl09":  `${B}/F/F000476.jpg`, // Maxwell Frost
  "kc-fl14":  `${B}/C/C001066.jpg`, // Kathy Castor
  "rs-fl08":  `${B}/P/P000599.jpg`, // Bill Posey
  "ms-fl01":  `${B}/G/G000578.jpg`, // Matt Gaetz
  "as-fl04":  `${B}/B/B001316.jpg`, // Aaron Bean
  "vs-fl27":  `${B}/S/S001235.jpg`, // Maria Salazar
  "cm-fl26":  `${B}/G/G000592.jpg`, // Carlos Gimenez
  "ds-fl17":  `${B}/F/F000475.jpg`, // Scott Franklin
  "mw-fl05":  `${B}/R/R000609.jpg`, // John Rutherford
  "kc-fl11":  `${B}/W/W000806.jpg`, // Daniel Webster
  "lf-fl22":  `${B}/F/F000462.jpg`, // Lois Frankel
  "cd-fl12":  `${B}/C/C001121.jpg`, // Sheila Cherfilus-McCormick
  "jm-fl13":  `${B}/L/L000601.jpg`, // Anna Paulina Luna
  "vs-fl16":  `${B}/B/B001260.jpg`, // Vern Buchanan
  "ms-fl06":  `${B}/W/W000823.jpg`, // Mike Waltz
  "ds-fl21":  `${B}/M/M001199.jpg`, // Brian Mast
  "vs-fl07":  `${B}/M/M001212.jpg`, // Cory Mills
  // Texas federal
  "tc-tx-sen":  `${B}/C/C001098.jpg`, // Ted Cruz
  "jc-tx-sen2": `${B}/C/C001056.jpg`, // John Cornyn
  "jc-tx-20":   `${B}/C/C001091.jpg`, // Joaquin Castro
  "dc-tx-02":   `${B}/C/C001120.jpg`, // Dan Crenshaw
  "cr-tx-21":   `${B}/R/R000614.jpg`, // Chip Roy
  "mm-tx-10":   `${B}/M/M001157.jpg`, // Michael McCaul
  "hc-tx-28":   `${B}/C/C001063.jpg`, // Henry Cuellar
  "sg-tx-29":   `${B}/G/G000587.jpg`, // Sylvia Garcia
  "ve-tx-16":   `${B}/E/E000299.jpg`, // Veronica Escobar
  "ca-tx-32":   `${B}/A/A000378.jpg`, // Colin Allred
  // State-level officials — Wikipedia thumbnails (no federal bioguide)
  "am-flag":    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Senator_Ashley_Moody_Official_Portrait.jpg/330px-Senator_Ashley_Moody_Official_Portrait.jpg",
  "mw-flsd17":  "https://upload.wikimedia.org/wikipedia/commons/b/b2/Senator_Lori_Berman.jpg",
  "mp-flsen":   "https://upload.wikimedia.org/wikipedia/commons/1/16/Shevrin_Jones.jpg",
  "ds-flhs3":   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Anna_Eskamani.jpg/330px-Anna_Eskamani.jpg",
  "ml-flsen":   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Florida_State_Senator_Joe_Gruters_%28cropped%29.png/330px-Florida_State_Senator_Joe_Gruters_%28cropped%29.png",
  "ds-flag2":   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Official_portrait_of_Attorney_General_James_Uthmeier%2C_2025_%28cropped%29.jpg/330px-Official_portrait_of_Attorney_General_James_Uthmeier%2C_2025_%28cropped%29.jpg",
  "cs-flsen":   "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Rep_Tracie_Davis.jpg/330px-Rep_Tracie_Davis.jpg",
  "ds-flhs2":   "https://upload.wikimedia.org/wikipedia/commons/d/d9/Official_Portrait_of_Daniel_Perez.jpg",
  "ga-tx-gov":  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/2024-GovernorAbbott-Portrait.jpg/330px-2024-GovernorAbbott-Portrait.jpg",
  "kp-tx-ag":   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/K_Paxton.jpg/330px-K_Paxton.jpg",
  // jc-fl15 (Jay Collins) — no Wikipedia photo found; falls back to FALLBACK_PHOTOS
};

const META: Record<string, { role: Politician["role"]; region: Politician["region"]; state: string }> = {
  "bd-fl19":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "jc-fl15":   { role: "State Senate", region: "Central FL", state: "FL" },
  "am-flag":   { role: "Statewide",    region: "Statewide",  state: "FL" },
  "rs-flgov":  { role: "Governor",     region: "Statewide",  state: "FL" },
  "rs-flsen":  { role: "U.S. Senate",  region: "Statewide",  state: "FL" },
  "mr-flsen":  { role: "U.S. Senate",  region: "Statewide",  state: "FL" },
  "mw-fl23":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "fc-fl20":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "ms-fl09":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "kc-fl14":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "mw-flsd17": { role: "State Senate", region: "South FL",   state: "FL" },
  "rs-fl08":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "ms-fl01":   { role: "U.S. House",   region: "North FL",   state: "FL" },
  "as-fl04":   { role: "U.S. House",   region: "North FL",   state: "FL" },
  "vs-fl27":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "cm-fl26":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "ds-fl17":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "mw-fl05":   { role: "U.S. House",   region: "North FL",   state: "FL" },
  "kc-fl11":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "lf-fl22":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "cd-fl12":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "jm-fl13":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "vs-fl16":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "ms-fl06":   { role: "U.S. House",   region: "North FL",   state: "FL" },
  "ds-fl21":   { role: "U.S. House",   region: "South FL",   state: "FL" },
  "vs-fl07":   { role: "U.S. House",   region: "Central FL", state: "FL" },
  "ds-flag2":  { role: "Statewide",    region: "Statewide",  state: "FL" },
  "cs-flsen":  { role: "State Senate", region: "North FL",   state: "FL" },
  "mp-flsen":  { role: "State Senate", region: "South FL",   state: "FL" },
  "ds-flhs2":  { role: "State House",  region: "South FL",   state: "FL" },
  "ds-flhs3":  { role: "State House",  region: "Central FL", state: "FL" },
  "ml-flsen":  { role: "State Senate", region: "Central FL", state: "FL" },
  "tc-tx-sen":  { role: "U.S. Senate", region: "Statewide",  state: "TX" },
  "jc-tx-sen2": { role: "U.S. Senate", region: "Statewide",  state: "TX" },
  "ga-tx-gov":  { role: "Governor",    region: "Statewide",  state: "TX" },
  "jc-tx-20":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "dc-tx-02":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "cr-tx-21":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "mm-tx-10":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "kp-tx-ag":   { role: "Statewide",   region: "Statewide",  state: "TX" },
  "hc-tx-28":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "sg-tx-29":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "ve-tx-16":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
  "ca-tx-32":   { role: "U.S. House",  region: "Statewide",  state: "TX" },
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
  {
    id: "tc-tx-sen", name: "Ted Cruz", initials: "TC", party: "R", district: "TX-Sen",
    vector_stated: v([5,5,5,4,5,4,5,5,3,2,4,5,3,4,2,4,5,5,4,5]),
    vector_actual:  v([5,5,5,3,5,4,5,5,3,2,4,5,2,4,2,4,5,5,4,5]),
    bio: "U.S. Senator (TX). Strict constitutionalist, fiscal hawk, immigration enforcement.",
    donors: [
      { name: "Club for Growth",     tier: 4, amount: 180000, dimensions: ["p1","p3"] },
      { name: "Texas Petroleum PAC", tier: 3, amount: 62000,  dimensions: ["p4","p19"] },
      { name: "NRA Victory Fund",    tier: 4, amount: 28000,  dimensions: ["p8"] },
      { name: "Cruz Family",         tier: 2, amount: 5000,   dimensions: ["p20"] },
    ],
  },
  {
    id: "jc-tx-sen2", name: "John Cornyn", initials: "JC", party: "R", district: "TX-Sen",
    vector_stated: v([4,4,4,4,4,4,4,4,4,3,4,5,3,4,3,4,4,4,4,4]),
    vector_actual:  v([4,4,4,4,4,4,4,4,4,3,4,5,3,4,3,4,4,4,4,4]),
    bio: "U.S. Senator (TX). Senate Majority Whip. National security, bipartisan dealmaker.",
    donors: [
      { name: "AT&T Inc PAC",        tier: 3, amount: 45000, dimensions: ["p15"] },
      { name: "Lockheed Martin PAC", tier: 3, amount: 38000, dimensions: ["p12"] },
      { name: "Texas Realtors PAC",  tier: 4, amount: 22000, dimensions: ["p16"] },
      { name: "Cornyn Family",       tier: 2, amount: 4000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "ga-tx-gov", name: "Greg Abbott", initials: "GA", party: "R", district: "TX-Gov",
    vector_stated: v([4,5,5,4,5,4,5,4,4,2,5,5,3,4,3,4,5,5,4,5]),
    vector_actual:  v([4,4,4,3,5,5,5,4,3,2,5,5,2,4,3,4,4,5,4,4]),
    bio: "Governor of Texas. Border security, school choice, tort reform.",
    donors: [
      { name: "Texans for Lawsuit Reform", tier: 3, amount: 120000, dimensions: ["p3"] },
      { name: "Texas Petroleum PAC",       tier: 3, amount: 55000,  dimensions: ["p4","p19"] },
      { name: "Liberty Institute",         tier: 4, amount: 35000,  dimensions: ["p2","p5"] },
      { name: "Abbott Family",             tier: 2, amount: 6000,   dimensions: ["p20"] },
    ],
  },
  {
    id: "jc-tx-20", name: "Joaquin Castro", initials: "JC", party: "D", district: "TX-20",
    vector_stated: v([2,2,2,3,2,3,2,3,4,4,3,2,4,3,4,3,2,2,4,3]),
    vector_actual:  v([2,2,2,3,2,3,2,3,4,4,3,2,4,3,4,3,2,2,4,3]),
    bio: "U.S. Representative (TX-20). Progressive on immigration, housing, education.",
    donors: [
      { name: "SEIU Political Fund", tier: 4, amount: 42000, dimensions: ["p14"] },
      { name: "Emily's List",        tier: 4, amount: 28000, dimensions: ["p10"] },
      { name: "Act Blue TX",         tier: 3, amount: 65000, dimensions: ["p20"] },
      { name: "Castro Family",       tier: 2, amount: 3000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "dc-tx-02", name: "Dan Crenshaw", initials: "DC", party: "R", district: "TX-2",
    vector_stated: v([4,4,4,4,4,4,4,4,3,3,5,5,3,4,3,4,4,4,4,4]),
    vector_actual:  v([4,4,4,4,4,4,4,4,3,3,5,5,3,4,3,4,4,4,4,4]),
    bio: "U.S. Representative (TX-2). Navy SEAL veteran. National security, fiscal discipline.",
    donors: [
      { name: "Texans for Dan PAC",  tier: 4, amount: 88000, dimensions: ["p12","p20"] },
      { name: "Lockheed Martin PAC", tier: 3, amount: 42000, dimensions: ["p12"] },
      { name: "NRA Victory Fund",    tier: 4, amount: 18000, dimensions: ["p8"] },
      { name: "ExxonMobil PAC",      tier: 3, amount: 22000, dimensions: ["p4","p19"] },
      { name: "Crenshaw Family",     tier: 2, amount: 4000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "cr-tx-21", name: "Chip Roy", initials: "CR", party: "R", district: "TX-21",
    vector_stated: v([5,5,5,5,5,5,5,5,3,2,4,4,3,4,2,4,5,5,4,5]),
    vector_actual:  v([5,5,5,5,5,5,5,5,3,2,4,4,3,4,2,4,5,5,4,5]),
    bio: "U.S. Representative (TX-21). Freedom Caucus. Hardcore fiscal conservative, border hawk.",
    donors: [
      { name: "Club for Growth",    tier: 4, amount: 145000, dimensions: ["p1","p3"] },
      { name: "Heritage Action",    tier: 4, amount: 62000,  dimensions: ["p20"] },
      { name: "NRA Victory Fund",   tier: 4, amount: 24000,  dimensions: ["p8"] },
      { name: "Texas Cattle PAC",   tier: 3, amount: 14000,  dimensions: ["p19"] },
      { name: "Roy Family",         tier: 2, amount: 5000,   dimensions: ["p20"] },
    ],
  },
  {
    id: "mm-tx-10", name: "Michael McCaul", initials: "MM", party: "R", district: "TX-10",
    vector_stated: v([4,4,4,3,4,4,4,4,3,3,5,5,3,4,3,4,4,4,4,3]),
    vector_actual:  v([4,4,4,3,4,4,4,4,3,3,5,5,3,4,3,4,4,4,4,3]),
    bio: "U.S. Representative (TX-10). House Foreign Affairs Committee. Bipartisan national security.",
    donors: [
      { name: "Boeing PAC",          tier: 3, amount: 38000, dimensions: ["p12"] },
      { name: "Raytheon PAC",        tier: 3, amount: 32000, dimensions: ["p12"] },
      { name: "AT&T Inc PAC",        tier: 3, amount: 22000, dimensions: ["p15","p17"] },
      { name: "AIPAC",               tier: 4, amount: 28000, dimensions: ["p11"] },
      { name: "McCaul Family",       tier: 2, amount: 18000, dimensions: ["p20"] },
    ],
  },
  {
    id: "kp-tx-ag", name: "Ken Paxton", initials: "KP", party: "R", district: "TX-AG",
    vector_stated: v([5,5,5,4,5,5,5,4,3,2,4,4,3,4,2,4,5,5,4,5]),
    vector_actual:  v([5,4,5,4,5,5,5,4,3,2,4,4,2,4,2,4,5,5,4,4]),
    bio: "Texas Attorney General. Election integrity crusader. Impeached, acquitted by Senate.",
    donors: [
      { name: "Defend TX Liberty PAC", tier: 4, amount: 175000, dimensions: ["p20"] },
      { name: "Texas Petroleum PAC",   tier: 3, amount: 48000,  dimensions: ["p4","p19"] },
      { name: "NRA",                   tier: 4, amount: 22000,  dimensions: ["p8"] },
      { name: "Paxton Family",         tier: 2, amount: 8000,   dimensions: ["p20"] },
    ],
  },
  {
    id: "hc-tx-28", name: "Henry Cuellar", initials: "HC", party: "D", district: "TX-28",
    vector_stated: v([3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]),
    vector_actual:  v([3,3,3,3,3,3,3,3,3,3,4,4,3,3,3,3,3,3,3,3]),
    bio: "U.S. Representative (TX-28). Moderate Democrat. Bipartisan on energy and border.",
    donors: [
      { name: "Natural Gas PAC",    tier: 3, amount: 38000, dimensions: ["p4"] },
      { name: "Border Security PAC",tier: 4, amount: 28000, dimensions: ["p6"] },
      { name: "IBEW PAC",           tier: 4, amount: 18000, dimensions: ["p15"] },
      { name: "Cuellar Family",     tier: 2, amount: 4000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "sg-tx-29", name: "Sylvia Garcia", initials: "SG", party: "D", district: "TX-29",
    vector_stated: v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    vector_actual:  v([2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2]),
    bio: "U.S. Representative (TX-29). Healthcare access, workers' rights, housing.",
    donors: [
      { name: "SEIU Political Fund", tier: 4, amount: 32000, dimensions: ["p14","p15"] },
      { name: "AFL-CIO",             tier: 4, amount: 24000, dimensions: ["p15"] },
      { name: "EMILY's List",        tier: 4, amount: 18000, dimensions: ["p7"] },
      { name: "Garcia Family",       tier: 2, amount: 2000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "ve-tx-16", name: "Veronica Escobar", initials: "VE", party: "D", district: "TX-16",
    vector_stated: v([2,2,1,2,2,1,1,1,1,1,2,2,1,2,2,2,2,2,2,2]),
    vector_actual:  v([2,2,1,2,2,1,1,1,1,1,2,2,1,2,2,2,2,2,2,2]),
    bio: "U.S. Representative (TX-16). Immigration reform, reproductive rights, El Paso.",
    donors: [
      { name: "RAICES Action Fund",  tier: 4, amount: 28000, dimensions: ["p6"] },
      { name: "EMILY's List",        tier: 4, amount: 22000, dimensions: ["p7"] },
      { name: "AFL-CIO",             tier: 4, amount: 14000, dimensions: ["p15"] },
      { name: "Act Blue TX",         tier: 3, amount: 38000, dimensions: ["p20"] },
      { name: "Escobar Family",      tier: 2, amount: 2000,  dimensions: ["p20"] },
    ],
  },
  {
    id: "ca-tx-32", name: "Colin Allred", initials: "CA", party: "D", district: "TX-32",
    vector_stated: v([2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2,3,2,2]),
    vector_actual:  v([2,2,2,2,2,2,2,2,2,2,3,3,2,2,2,2,2,3,2,2]),
    bio: "Former U.S. Representative (TX-32). NFL veteran, civil rights attorney. Ran for Senate 2024.",
    donors: [
      { name: "NFL Alumni PAC",     tier: 3, amount: 22000, dimensions: ["p20"] },
      { name: "Act Blue TX",        tier: 3, amount: 85000, dimensions: ["p20"] },
      { name: "EMILY's List",       tier: 4, amount: 28000, dimensions: ["p7"] },
      { name: "AFSCME",             tier: 4, amount: 18000, dimensions: ["p15"] },
      { name: "Allred Family",      tier: 2, amount: 3000,  dimensions: ["p20"] },
    ],
  },
];

export const politicians: Politician[] = raw.map((p, i) => {
  let s = 0;
  for (let j = 0; j < 20; j++) s += Math.abs(p.vector_stated[j] - p.vector_actual[j]);
  return {
    ...p,
    w: Math.max(0, 1 - (s / 20) / 4),
    photo: PHOTO_BY_ID[p.id] ?? FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length],
    role: META[p.id]?.role ?? "U.S. House",
    region: META[p.id]?.region ?? "Statewide",
    state: META[p.id]?.state ?? "FL",
  };
});
