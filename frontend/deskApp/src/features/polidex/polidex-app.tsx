"use client";

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
import { BackendPolitician, RankedPolitician, SearchResult, checkHealth, fetchPoliticians, localSearch, regionSort, searchPoliticians } from "@/features/polidex/lib/api";
import { UserProfile, clearProfile, loadProfile, importProfileCode, saveProfile, DEMO_PROFILE } from "@/features/polidex/lib/profile";
import { View } from "@/features/polidex/types";

export function PoliDexApp() {
  const [view, setView] = useState<View>("landing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile() ?? DEMO_PROFILE);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [rankedResults, setRankedResults] = useState<SearchResult[]>(() => {
    const p = loadProfile() ?? DEMO_PROFILE;
    return localSearch(politicians, p.vector, p.weights, false);
  });
  const [isRanking, setIsRanking] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activePoliticians, setActivePoliticians] = useState<Politician[]>(politicians);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
    fetchPoliticians()
      .then((backendList: BackendPolitician[]) => {
        const merged = backendList
          .map((bp) => {
            const base = politicians.find((p) => p.id === bp.id);
            return base ? { ...base, vector_actual: bp.vector, photo: bp.imageUrl ?? base.photo } : null;
          })
          .filter((p): p is Politician => p !== null);
        if (merged.length > 0) setActivePoliticians(merged);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    // Seed immediately from local data — never block on backend
    const base = localSearch(activePoliticians, profile.vector, profile.weights, false);
    const sorted = profile.region ? regionSort(base, profile.region, activePoliticians) : base;
    setRankedResults(sorted);
    // Attempt backend upgrade silently in background
    searchPoliticians(profile.vector, profile.weights, false, [])
      .then((results) => {
        const backendSorted = profile.region ? regionSort(results, profile.region, activePoliticians) : results;
        setRankedResults(backendSorted);
      })
      .catch(() => {});
  }, [profile, backendOnline, activePoliticians]);

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

  const handleImportProfile = (code: string): boolean => {
    const imported = importProfileCode(code);
    if (!imported) return false;
    saveProfile(imported);
    setProfile(imported);
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
        {view === "compare" && <Compare profile={profile} ranked={rankedPoliticians} isRanking={isRanking} backendOnline={backendOnline} onTakeQuiz={() => setView("quiz")} onImportProfile={handleImportProfile} />}
        {view === "simulator" && <Simulator list={activePoliticians} />}

        <LogicProfile entity={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
