"use client";

import { useEffect, useMemo, useState } from "react";

import { Compare } from "@/features/polidex/components/compare";
import { Dashboard } from "@/features/polidex/components/dashboard";
import { GlobalLoadingScreen } from "@/features/polidex/components/global-loading-screen";
import { Landing } from "@/features/polidex/components/landing";
import { LogicProfile } from "@/features/polidex/components/logic-profile";
import { Quiz } from "@/features/polidex/components/quiz";
import { Simulator } from "@/features/polidex/components/simulator";
import { TopNav } from "@/features/polidex/components/top-nav";
import { Politician, politicians } from "@/features/polidex/data/politicians";
import { BackendPolitician, RankedPolitician, SearchResult, checkHealth, fetchPoliticians, searchPoliticians } from "@/features/polidex/lib/api";
import { UserProfile, clearProfile, importProfileCode, loadProfile, saveProfile } from "@/features/polidex/lib/profile";
import { View } from "@/features/polidex/types";

export function PoliDexApp() {
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

  const handleProfileImport = (code: string) => {
    const next = importProfileCode(code);
    if (!next) return false;
    saveProfile(next);
    setProfile(next);
    return true;
  };

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
    return (
      <Quiz
        onCancel={() => setView("dashboard")}
        onDone={(nextProfile) => {
          setProfile(nextProfile);
          setView("compare");
        }}
      />
    );
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
        {view === "compare" && (
          <Compare
            profile={profile}
            ranked={rankedPoliticians}
            onTakeQuiz={() => setView("quiz")}
            onImportProfile={handleProfileImport}
          />
        )}
        {view === "simulator" && <Simulator list={activePoliticians} />}

        <LogicProfile entity={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
