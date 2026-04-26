export type View = "landing" | "loading" | "dashboard" | "quiz" | "compare" | "simulator";

export type ElectionDate = {
  label: string;
  date: string;
};

export type Election = {
  id: string;
  title: string;
  electionDay: string;
  location: string;
  state: string;
  importantDates: ElectionDate[];
  candidateIds: string[];
};
