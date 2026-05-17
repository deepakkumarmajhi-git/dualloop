"use client";

import {
  fetchUserRepositories,
  fetchLanguageAnalytics,
} from "@/lib/api";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = searchParams.get("token") || "";
        if (!token) {
          setError("Session token not found. Please sign in via GitHub OAuth.");
          setLoading(false);
          return;
        }

        // Fetch user repositories (will trigger backend sync using OAuth token)
        const reposData = await fetchUserRepositories(token);
        if (reposData && reposData.detail) {
          setError(reposData.detail);
          setLoading(false);
          return;
        }

        // Fetch language distribution
        const analyticsData = await fetchLanguageAnalytics(token);
        
        setAnalytics(analyticsData || {});
        
        if (Array.isArray(reposData)) {
          setRepositories(reposData);
        } else {
          setRepositories([]);
          console.warn("Expected array of repositories from backend API, but received:", reposData);
        }
      } catch (err) {
        console.error("Dashboard loading failed:", err);
        setError("Unable to synchronize your repository workspace. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center font-sans relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold tracking-wide text-gray-200">Synchronizing Workspace</h3>
            <p className="text-sm text-cyan-400/70 mt-1 animate-pulse">Retrieving repository index and metadata from GitHub...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-[#f0f6fc] font-sans relative overflow-hidden pb-16">
      {/* Background Grids & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded">
                Developer Environment
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-3 bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent">
              DualLoop Workspace
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Secure, continuous fullstack feedback loop & ML repository diagnostics dashboard.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-6 md:mt-0 px-4 py-2 text-xs font-semibold border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg transition-all text-gray-300"
          >
            Sign Out
          </button>
        </header>

        {error && (
          <div className="mb-10 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg font-bold text-sm">⚠️</div>
            <div>
              <h4 className="text-red-400 font-semibold text-sm">Synchronization Notice</h4>
              <p className="text-red-300/80 text-xs mt-1">{error}</p>
              <button 
                onClick={() => window.location.href = "/"}
                className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium transition-colors"
              >
                Re-Authenticate Session
              </button>
            </div>
          </div>
        )}

        {/* Workspace Diagnostics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Language Analytics */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#0f0f15]/90 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/30 to-cyan-500/30"></div>
              
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Language Analytics
              </h3>

              <div className="space-y-5">
                {Object.keys(analytics).length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs font-mono">
                    No programming languages synced. Add source code files to populate analytics.
                  </div>
                ) : (
                  Object.entries(analytics).map(([language, percentage], idx) => {
                    // Predefined aesthetic gradients
                    const colorStyles = [
                      { text: "text-cyan-400", bar: "bg-cyan-500", glow: "shadow-cyan-500/20" },
                      { text: "text-purple-400", bar: "bg-purple-500", glow: "shadow-purple-500/20" },
                      { text: "text-amber-400", bar: "bg-amber-500", glow: "shadow-amber-500/20" },
                      { text: "text-emerald-400", bar: "bg-emerald-500", glow: "shadow-emerald-500/20" },
                      { text: "text-rose-400", bar: "bg-rose-500", glow: "shadow-rose-500/20" },
                    ];
                    const style = colorStyles[idx % colorStyles.length];

                    return (
                      <div key={language} className="group">
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                          <span className="text-gray-300 font-mono tracking-wide">{language}</span>
                          <span className={`${style.text} font-bold`}>{String(percentage)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                          <div 
                            className={`h-full rounded-full ${style.bar} transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Distribution Index</span>
                <span className="text-cyan-400/70">Reactive Feed</span>
              </div>
            </div>

            {/* Quick Stats Summary Card */}
            <div className="bg-[#0f0f15]/90 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <h3 className="text-lg font-bold tracking-tight text-white mb-4">Diagnostics Health</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-xs text-gray-400 block">Total Projects</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">{repositories.length}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-xs text-gray-400 block">Status</span>
                  <span className="text-sm font-bold text-emerald-400 mt-2 block flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Repositories list */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-4">
              Synced Repositories
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400">
                {repositories.length}
              </span>
            </h3>

            {repositories.length === 0 ? (
              <div className="bg-[#0f0f15]/50 border border-dashed border-white/10 rounded-2xl p-16 text-center shadow-xl">
                <div className="text-4xl mb-4 text-gray-600">📁</div>
                <h4 className="text-lg font-bold text-gray-300">No repositories available</h4>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  Verify that your GitHub account has accessible public or private repositories and try re-syncing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {repositories.map((repo) => (
                  <div 
                    key={repo.id} 
                    className="group relative bg-[#0f0f15]/90 border border-white/5 hover:border-cyan-500/30 hover:shadow-cyan-500/5 hover:shadow-2xl rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/0 group-hover:bg-cyan-500/2 transition-colors duration-300 pointer-events-none"></div>
                    
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-lg font-extrabold text-white group-hover:text-cyan-400 transition-colors tracking-tight line-clamp-1">
                          {repo.name}
                        </h4>
                        <a 
                          href={repo.repo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors text-xs"
                          title="Open on GitHub"
                        >
                          ↗
                        </a>
                      </div>

                      <p className="text-gray-400 text-xs mt-3 line-clamp-2 leading-relaxed min-h-[36px]">
                        {repo.description || "Diagnostics operational. Core fullstack repository metadata successfully processed."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                          ⭐ <strong className="text-gray-300">{repo.stars}</strong>
                        </span>
                        <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                          🍴 <strong className="text-gray-300">{repo.forks}</strong>
                        </span>
                      </div>
                      
                      {repo.language && (
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">
                          {repo.language}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center font-sans relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm tracking-wide">Initializing secure session...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}