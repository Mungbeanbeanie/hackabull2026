"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";

import { Compare } from "@/features/polidex/components/compare";
import { Dashboard } from "@/features/polidex/components/dashboard";
import { GlobalLoadingScreen } from "@/features/polidex/components/global-loading-screen";
import { Landing } from "@/features/polidex/components/landing";
import { Quiz } from "@/features/polidex/components/quiz";
import { Simulator } from "@/features/polidex/components/simulator";
import { TopNav } from "@/features/polidex/components/top-nav";
import { Politician, politicians } from "@/features/polidex/data/politicians";
import { BackendPolitician, RankedPolitician, SearchResult, checkHealth, fetchPoliticians, localSearch, regionSort, searchPoliticians } from "@/features/polidex/lib/api";
import { UserProfile, clearProfile, loadProfile, importProfileCode, saveProfile, DEMO_PROFILE } from "@/features/polidex/lib/profile";
import { View } from "@/features/polidex/types";

type ProfileSide = "left" | "right";

type SelectedProfile = {
  politicianId: string;
  side: ProfileSide;
} | null;

const LazyLogicProfile = lazy(() =>
  import("@/features/polidex/components/logic-profile").then((module) => ({ default: module.LogicProfile })),
);

export function PoliDexApp() {
  const [view, setView] = useState<View>("landing");
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile() ?? DEMO_PROFILE);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [rankedResults, setRankedResults] = useState<SearchResult[]>(() => {
    const p = loadProfile() ?? DEMO_PROFILE;
    return localSearch(politicians, p.vector, p.weights, false);
  });
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activePoliticians, setActivePoliticians] = useState<Politician[]>(politicians);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
    fetchPoliticians()
      .then((backendList: BackendPolitician[]) => {
        const backendById = new Map(backendList.map((backendPolitician) => [backendPolitician.id, backendPolitician]));
        const patched = politicians.map((p) => {
          const backendPolitician = backendById.get(p.id);
          return backendPolitician ? { ...p, vector_actual: backendPolitician.vector, photo: backendPolitician.imageUrl ?? p.photo } : p;
        });
        setActivePoliticians(patched);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;

    const base = localSearch(activePoliticians, profile.vector, profile.weights, false);
    const sorted = profile.state ? regionSort(base, profile.state, activePoliticians) : base;
    setRankedResults(sorted);

    searchPoliticians(profile.vector, profile.weights, false, [])
      .then((results) => {
        const backendSorted = profile.state ? regionSort(results, profile.state, activePoliticians) : results;
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

  const selected = activePoliticians.find((p) => p.id === selectedProfile?.politicianId) ?? null;

  const handleOpenProfile = (politicianId: string, side: ProfileSide) => {
    setSelectedProfile((current) => {
      if (current?.politicianId === politicianId) return null;
      return { politicianId, side };
    });
  };

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
          setSelectedProfile(null);
          setView("landing");
        }}
      />

      <div className="relative flex flex-1" style={{ minHeight: 0 }}>
        {view === "dashboard" && (
          <Dashboard
            list={activePoliticians}
            selectedId={selectedProfile?.politicianId ?? null}
            onSelect={handleOpenProfile}
            isLoading={!isDataLoaded}
          />
        )}
        {view === "compare" && (
          <Compare
            profile={profile}
            ranked={rankedPoliticians}
            backendOnline={backendOnline}
            onTakeQuiz={() => setView("quiz")}
            onImportProfile={handleImportProfile}
            onOpenProfile={handleOpenProfile}
            selectedProfileId={selectedProfile?.politicianId ?? null}
          />
        )}
        {view === "simulator" && <Simulator list={activePoliticians} />}

        <AnimatePresence mode="wait">
          {selected && (
            <Suspense fallback={null}>
              <LazyLogicProfile
                key={`${selectedProfile?.politicianId ?? "none"}-${selectedProfile?.side ?? "right"}`}
                entity={selected}
                side={selectedProfile?.side ?? "right"}
                onClose={() => setSelectedProfile(null)}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
