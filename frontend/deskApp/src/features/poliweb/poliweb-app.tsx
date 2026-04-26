"use client";

import { useState } from "react";

import { Compare } from "@/features/poliweb/components/compare";
import { Dashboard } from "@/features/poliweb/components/dashboard";
import { GlobalLoadingScreen } from "@/features/poliweb/components/global-loading-screen";
import { Landing } from "@/features/poliweb/components/landing";
import { LogicProfile } from "@/features/poliweb/components/logic-profile";
import { Quiz } from "@/features/poliweb/components/quiz";
import { TopNav } from "@/features/poliweb/components/top-nav";
import { politicians } from "@/features/poliweb/data/politicians";
import { UserProfile, clearProfile, loadProfile } from "@/features/poliweb/lib/profile";
import { View } from "@/features/poliweb/types";

export function PoliWebApp() {
  const [view, setView] = useState<View>("landing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const selected = politicians.find((p) => p.id === selectedId) ?? null;

  if (view === "landing") {
    return <Landing onInit={() => setView("loading")} />;
  }

  if (view === "loading") {
    return (
      <GlobalLoadingScreen
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
          <Dashboard list={politicians} selectedId={selectedId} onSelect={setSelectedId} isLoading={!isDataLoaded} />
        )}
        {view === "compare" && <Compare profile={profile} onTakeQuiz={() => setView("quiz")} />}

        <LogicProfile entity={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
