"use client";

import { useEffect, useMemo, useState } from "react";

import { Compare } from "@/features/poliweb/components/compare";
import { Dashboard } from "@/features/poliweb/components/dashboard";
import { GlobalLoadingScreen } from "@/features/poliweb/components/global-loading-screen";
import { Landing } from "@/features/poliweb/components/landing";
import { LogicProfile } from "@/features/poliweb/components/logic-profile";
import { Quiz } from "@/features/poliweb/components/quiz";
import { Simulator } from "@/features/poliweb/components/simulator";
import { TopNav } from "@/features/poliweb/components/top-nav";
import { Politician, politicians } from "@/features/poliweb/data/politicians";
import { BackendPolitician, RankedPolitician, SearchResult, checkHealth, fetchPoliticians, searchPoliticians } from "@/features/poliweb/lib/api";
import { UserProfile, clearProfile, loadProfile } from "@/features/poliweb/lib/profile";
import { View } from "@/features/poliweb/types";

export function PoliWebApp() {
  const [view, setView] = useState<View>("landing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [rankedResults, setRankedResults] = useState<SearchResult[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activePoliticians, setActivePoliticians] = useState<Politician[]>(politicians);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
    fetchPoliticians()
      .then((backendList: BackendPolitician[]) => {
        const merged = backendList
          .map((bp) => {
            const base = politicians.find((p) => p.id === bp.id);
            return base ? { ...base, vector_actual: bp.vector } : null;
          })
          .filter((p): p is Politician => p !== null);
        if (merged.length > 0) setActivePoliticians(merged);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    searchPoliticians(profile.vector, profile.weights, false, [])
      .then(setRankedResults)
      .catch((err) => console.error("backend search failed:", err));
  }, [profile]);

  const rankedPoliticians = useMemo((): RankedPolitician[] => {
    if (rankedResults.length === 0) return [];
    return rankedResults
      .map((r) => {
        const politician = activePoliticians.find((p) => p.id === r.id);
        return politician ? { politician, sim: r.score } : null;
      })
      .filter((x): x is { politician: Politician; sim: number } => x !== null);
  }, [rankedResults, activePoliticians]);

  const selected = activePoliticians.find((p) => p.id === selectedId) ?? null;

  if (view === "landing") {
    return <Landing onInit={() => setView("loading")} />;
  }

  if (view === "loading") {
    return (
      <GlobalLoadingScreen
        backendOnline={backendOnline}
        onComplete={() => {
          setIsDataLoaded(true);
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "quiz") {
    return <Quiz onCancel={() => setView("dashboard")} onDone={(nextProfile) => { setProfile(nextProfile); setView("compare"); }} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <TopNav
        view={view}
        setView={setView}
        profile={profile}
        onTakeQuiz={() => setView("quiz")}
        onClearProfile={() => {
          clearProfile();
          setProfile(null);
        }}
        onHome={() => {
          setSelectedId(null);
          setView("landing");
        }}
      />

      <div className="relative flex flex-1" style={{ minHeight: 0 }}>
        {view === "dashboard" && (
          <Dashboard list={activePoliticians} selectedId={selectedId} onSelect={setSelectedId} isLoading={!isDataLoaded} />
        )}
        {view === "compare" && <Compare profile={profile} ranked={rankedPoliticians} onTakeQuiz={() => setView("quiz")} />}
        {view === "simulator" && <Simulator list={activePoliticians} />}

        <LogicProfile entity={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
