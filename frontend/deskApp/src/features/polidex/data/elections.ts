import { Election } from "@/features/polidex/types";

export const upcomingElections: Election[] = [
  {
    id: "fl-primary-2026",
    title: "2026 Florida Primary",
    electionDay: "2026-08-18",
    location: "Florida, USA",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-07-21" },
      { label: "Early Voting Starts", date: "2026-08-10" },
      { label: "Early Voting Ends", date: "2026-08-16" },
    ],
    candidateIds: ["rs-flgov", "rs-flsen", "mr-flsen", "am-flag"],
  },
  {
    id: "fl-general-2026",
    title: "2026 Florida General",
    electionDay: "2026-11-03",
    location: "Florida, USA",
    importantDates: [
      { label: "Voter Reg. Deadline", date: "2026-10-05" },
      { label: "Early Voting Starts", date: "2026-10-24" },
      { label: "Early Voting Ends", date: "2026-10-30" },
    ],
    candidateIds: ["rs-flgov", "mr-flsen", "vs-fl27", "mw-fl23"],
  },
];
