import { Election } from "@/features/polidex/types";

export const upcomingElections: Election[] = [
  {
    id: "fl-primary-2026",
    title: "2026 Florida Primary",
    electionDay: "2026-08-18",
    location: "Florida, USA",
    state: "FL",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-07-21" },
      { label: "Early Voting Starts", date: "2026-08-10" },
      { label: "Early Voting Ends",   date: "2026-08-16" },
    ],
    candidateIds: ["rs-flgov", "rs-flsen", "mr-flsen", "am-flag"],
  },
  {
    id: "fl-general-2026",
    title: "2026 Florida General",
    electionDay: "2026-11-03",
    location: "Florida, USA",
    state: "FL",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-10-05" },
      { label: "Early Voting Starts", date: "2026-10-24" },
      { label: "Early Voting Ends",   date: "2026-10-30" },
    ],
    candidateIds: ["rs-flgov", "mr-flsen", "vs-fl27", "mw-fl23"],
  },
  {
    id: "tx-primary-2026",
    title: "2026 Texas Primary",
    electionDay: "2026-03-03",
    location: "Texas, USA",
    state: "TX",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-02-02" },
      { label: "Early Voting Starts", date: "2026-02-17" },
      { label: "Early Voting Ends",   date: "2026-02-27" },
    ],
    candidateIds: ["tc-tx-sen", "ga-tx-gov", "jc-tx-20"],
  },
  {
    id: "tx-general-2026",
    title: "2026 Texas General",
    electionDay: "2026-11-03",
    location: "Texas, USA",
    state: "TX",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-10-05" },
      { label: "Early Voting Starts", date: "2026-10-19" },
      { label: "Early Voting Ends",   date: "2026-10-30" },
    ],
    candidateIds: ["tc-tx-sen", "jc-tx-sen2", "ga-tx-gov", "jc-tx-20"],
  },
];
