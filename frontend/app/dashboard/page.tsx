"use client";

import {
  fetchUserRepositories,
  fetchUserProfile
} from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Shell: "#89e051",
    PHP: "#4F5D95",
    Vue: "#41b883",
    React: "#61dafb",
    Svelte: "#ff3e00",
  };

  if (colors[lang]) return colors[lang];

  let hash = 0;
  for (let i = 0; i < lang.length; i++) {
    hash = lang.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 75%, 55%)`;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated Developer profile states
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [organizations, setOrganizations] = useState<Array<{ name: string; avatar_url?: string }>>([]);

  const handleRoleChange = async (newRole: string) => {
    setUpdatingRole(true);
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || "";
      const res = await fetch(`http://localhost:8000/user/role?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ target_role: newRole })
      });

      if (res.ok) {
        setTargetRole(newRole);
      } else {
        console.error("Failed to update target role on backend");
      }
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingRole(false);
    }
  };

  // Background Sync state
  const [syncingStatus, setSyncingStatus] = useState<"idle" | "syncing" | "completed">("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Health Filter & CRUD Deletion states
  const [repoFilter, setRepoFilter] = useState<"all" | "recent" | "active" | "stale" | "garbage">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteRepository = async (repoId: number) => {
    if (!confirm("Are you sure you want to delete this repository from your local station database? This will purge all associated local commit diagnostics in SQLite.")) {
      return;
    }

    setDeletingId(repoId);
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || "";
      const res = await fetch(`http://localhost:8000/repositories/${repoId}?token=${token}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setRepositories(prev => prev.filter(r => r.id !== repoId));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("An error occurred while trying to purge this repository.");
    } finally {
      setDeletingId(null);
    }
  };

  const loadDashboardData = async (forceSync = false) => {
    try {
      if (forceSync) {
        setIsRefreshing(true);
        setSyncingStatus("syncing");
      }

      let token = searchParams.get("token") || "";

      if (token) {
        sessionStorage.setItem("dualloop_session_token", token);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        token = sessionStorage.getItem("dualloop_session_token") || "";
      }

      if (!token) {
        setError("Session token not found. Please sign in via GitHub OAuth.");
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 1. Ingest repositories and commits in background
      const syncData = await fetchUserRepositories(token);
      if (syncData && syncData.detail) {
        setError(syncData.detail);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (syncData && syncData.status === "syncing") {
        setSyncingStatus("syncing");
      }

      // Fetch user profile info
      const profileData = await fetchUserProfile(token);
      if (profileData && !profileData.detail) {
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || "");
        setTargetRole(profileData.target_role || "Fullstack Developer");
        setBio(profileData.bio || null);
        setFollowers(profileData.followers || 0);
        setFollowing(profileData.following || 0);
        setOrganizations(Array.isArray(profileData.organizations) ? profileData.organizations : []);
      }

      // Load repository list
      const reposRes = await fetch(`http://localhost:8000/repositories/all?token=${token}`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setRepositories(Array.isArray(reposData) ? reposData : []);
      }

      if (forceSync || syncData?.status === "syncing") {
        // Quick 4-second timeout to transition status indicator cleanly
        setTimeout(() => setSyncingStatus("completed"), 4000);
      }

    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Unable to synchronize your repository workspace. Please try logging in again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [searchParams]);

  const handleSignOut = () => {
    sessionStorage.removeItem("dualloop_session_token");
    window.location.href = "/";
  };

  // Filter computations for Workspace Birds-Eye Monitor
  const garbageRepos = repositories.filter(r => {
    const hasNoLanguages = !r.languages || Object.keys(r.languages).length === 0;
    return hasNoLanguages && (r.stars || 0) === 0 && (r.forks || 0) === 0;
  });

  const activeRepos = [...repositories]
    .sort((a, b) => ((b.stars || 0) + (b.forks || 0)) - ((a.stars || 0) + (a.forks || 0)))
    .filter(r => (r.stars || 0) > 0 || (r.forks || 0) > 0)
    .slice(0, 10);

  const displayActiveRepos = activeRepos.length > 0 ? activeRepos : [...repositories]
    .sort((a, b) => ((b.stars || 0) + (b.forks || 0)) - ((a.stars || 0) + (a.forks || 0)))
    .slice(0, 6);

  const sortedByUpdatedDesc = [...repositories].sort((a, b) => {
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  });

  const recentRepos = sortedByUpdatedDesc.filter(r => {
    if (!r.updated_at) return false;
    const diffDays = (new Date().getTime() - new Date(r.updated_at).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 180;
  });
  const displayRecentRepos = recentRepos.length > 0 ? recentRepos : sortedByUpdatedDesc.slice(0, 10);

  const sortedByUpdatedAsc = [...repositories].sort((a, b) => {
    return new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
  });

  const staleRepos = sortedByUpdatedAsc.filter(r => {
    if (!r.updated_at) return true;
    const diffDays = (new Date().getTime() - new Date(r.updated_at).getTime()) / (1000 * 3600 * 24);
    return diffDays > 180;
  });
  const displayStaleRepos = staleRepos.length > 0 ? staleRepos : sortedByUpdatedAsc.slice(0, 10);

  const getFilteredRepositories = () => {
    switch (repoFilter) {
      case "recent":
        return displayRecentRepos;
      case "active":
        return displayActiveRepos;
      case "stale":
        return displayStaleRepos;
      case "garbage":
        return garbageRepos;
      case "all":
      default:
        return repositories;
    }
  };

  const filteredRepos = getFilteredRepositories();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold tracking-wide text-gray-200">Synchronizing Workspace</h3>
            <p className="text-sm text-cyan-400/70 mt-1 animate-pulse">Running telemetry repository mapping & commit synchronization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040406] text-[#f0f6fc] font-sans relative overflow-hidden pb-16">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">

        {/* Top Header with Profile Card */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8 mb-10">
          <div className="flex items-center gap-4">
            {avatarUrl && (
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500"></div>
                <img
                  src={avatarUrl}
                  alt={username}
                  className="relative w-16 h-16 rounded-full border-2 border-white/10 shadow-xl"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded shadow-[0_0_6px_rgba(6,182,212,0.2)]">
                  Active Station v0.2
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded">
                  {username ? `@${username}` : "Authenticated"}
                </span>

                {/* Target Role Switching Selector */}
                <div className="flex items-center gap-1.5 bg-[#050508]/60 border border-white/5 pl-2.5 pr-1.5 py-0.5 rounded-lg">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Focus:</span>
                  <select
                    value={targetRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={updatingRole}
                    className="bg-transparent text-[9px] font-mono text-cyan-400 font-bold focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="Fullstack Developer" className="bg-[#050508] text-white">Fullstack Developer</option>
                    <option value="Frontend Developer" className="bg-[#050508] text-white">Frontend Developer</option>
                    <option value="Backend Developer" className="bg-[#050508] text-white">Backend Developer</option>
                    <option value="DevOps Engineer" className="bg-[#050508] text-white">DevOps Engineer</option>
                  </select>
                </div>
                {syncingStatus === "syncing" && (
                  <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 rounded animate-pulse">
                    🛰️ Syncing Commits in background...
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2.5 bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent">
                DualLoop Workspace
              </h1>
              <p className="text-gray-400 text-xs mt-1.5">
                Developer repository dashboard, commit tracking logs, and continuous workspace synchronization.
              </p>

              {/* Profile Bio & Stats Row */}
              <div className="mt-3 flex flex-col gap-2">
                {bio && (
                  <p className="text-[11px] text-gray-300/80 italic leading-relaxed max-w-lg">
                    "{bio}"
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="text-gray-500">Followers</span>
                    <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded font-bold">{followers}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="text-gray-500">Following</span>
                    <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded font-bold">{following}</span>
                  </div>
                  {organizations.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500">Orgs</span>
                      <div className="flex items-center gap-1">
                        {organizations.map((org, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] font-mono font-bold hover:bg-amber-500/20 transition-colors cursor-default"
                            title={org.name}
                          >
                            {org.avatar_url && (
                              <img src={org.avatar_url} alt={org.name} className="w-3 h-3 rounded-full" />
                            )}
                            {org.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              className="px-4 py-2 text-xs font-mono font-bold bg-[#0b0b0e] border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl transition-all duration-300 text-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isRefreshing ? "⏳ Ingesting..." : "🔄 Force Resync"}
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-semibold border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-300"
            >
              Sign Out
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-10 p-5 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm">⚠️</div>
            <div>
              <h4 className="text-red-400 font-semibold text-xs">Synchronization Notice</h4>
              <p className="text-red-300/80 text-[11px] mt-1">{error}</p>
              <button
                onClick={handleSignOut}
                className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
              >
                Re-Authenticate Session
              </button>
            </div>
          </div>
        )}



          /* Synced Repositories Diagnostics list */
        <div className="space-y-6">
          {/* Birds-Eye Filter Console */}
          <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-5 mb-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-3 bg-cyan-500 rounded"></span>
                <span className="text-xs font-mono font-bold tracking-wider text-gray-200 uppercase">
                  Workspace Birds-Eye Monitor
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRepoFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${repoFilter === "all"
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                      : "bg-[#050508]/40 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
                    }`}
                >
                  📁 All ({repositories.length})
                </button>
                <button
                  onClick={() => setRepoFilter("recent")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${repoFilter === "recent"
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                      : "bg-[#050508]/40 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
                    }`}
                >
                  ✨ Recent ({displayRecentRepos.length})
                </button>
                <button
                  onClick={() => setRepoFilter("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${repoFilter === "active"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                      : "bg-[#050508]/40 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
                    }`}
                >
                  🔥 Active ({displayActiveRepos.length})
                </button>
                <button
                  onClick={() => setRepoFilter("stale")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${repoFilter === "stale"
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.1)]"
                      : "bg-[#050508]/40 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
                    }`}
                >
                  ⏳ Stale ({displayStaleRepos.length})
                </button>
                <button
                  onClick={() => setRepoFilter("garbage")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${repoFilter === "garbage"
                      ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                      : "bg-[#050508]/40 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
                    }`}
                >
                  🗑️ Garbage/Empty ({garbageRepos.length})
                </button>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold tracking-wider font-mono text-gray-200 uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-cyan-500 rounded"></span>
            {repoFilter === "all" ? "Synchronized Git repositories" : `${repoFilter.charAt(0).toUpperCase() + repoFilter.slice(1)} view`}
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-cyan-400">
              {filteredRepos.length} filtered
            </span>
          </h3>

          {filteredRepos.length === 0 ? (
            <div className="bg-[#0b0b0e]/50 border border-dashed border-white/10 rounded-2xl p-16 text-center shadow-xl animate-fade-in w-full">
              <div className="text-4xl mb-4 text-gray-600">📁</div>
              <h4 className="text-lg font-bold text-gray-300">
                {repoFilter === "garbage" ? "Workspace is Clean!" : "No repositories available"}
              </h4>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                {repoFilter === "garbage"
                  ? "Fantastic! No empty or garbage repositories were detected on your local developer station."
                  : "No repositories fit the selected filter criteria. Try changing the monitor view above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="group relative bg-[#0b0b0e]/95 border border-white/5 hover:border-cyan-500/30 hover:shadow-cyan-500/5 hover:shadow-2xl rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/0 group-hover:bg-cyan-500/[0.01] transition-colors duration-300 pointer-events-none"></div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors tracking-tight line-clamp-1">
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

                    {/* Repository Metadata: Size, Branch, PRs */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      {repo.size != null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md text-gray-400">
                          💾 <strong className="text-gray-300">{repo.size >= 1024 ? `${(repo.size / 1024).toFixed(1)} MB` : `${repo.size} KB`}</strong>
                        </span>
                      )}
                      {repo.default_branch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md text-gray-400">
                          🌿 <strong className="text-emerald-400">{repo.default_branch}</strong>
                        </span>
                      )}
                      {(repo.open_pull_requests > 0 || repo.merged_pull_requests > 0) && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md text-gray-400">
                          {repo.open_pull_requests > 0 && (
                            <span className="text-green-400">🟢 {repo.open_pull_requests} Open</span>
                          )}
                          {repo.open_pull_requests > 0 && repo.merged_pull_requests > 0 && (
                            <span className="text-gray-600">·</span>
                          )}
                          {repo.merged_pull_requests > 0 && (
                            <span className="text-purple-400">🟣 {repo.merged_pull_requests} Merged</span>
                          )}
                        </span>
                      )}
                    </div>

                    {repo.latest_commit ? (
                      <div className="mt-3 p-3 bg-white/2 border border-white/5 rounded-xl text-[10px] font-mono leading-normal">
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>LATEST COMMIT</span>
                          <span className="text-cyan-400 font-bold">{repo.latest_commit.sha}</span>
                        </div>
                        <p className="text-gray-300 line-clamp-1 leading-snug font-semibold select-text">
                          {repo.latest_commit.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-gray-500">
                            By {repo.latest_commit.author_name}
                          </span>
                          {(repo.latest_commit.additions > 0 || repo.latest_commit.deletions > 0) && (
                            <div className="flex items-center gap-2">
                              {repo.latest_commit.additions > 0 && (
                                <span className="text-emerald-400 font-bold">+{repo.latest_commit.additions}</span>
                              )}
                              {repo.latest_commit.deletions > 0 && (
                                <span className="text-red-400 font-bold">-{repo.latest_commit.deletions}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-white/1 border border-white/[0.03] border-dashed rounded-xl text-[10px] font-mono text-gray-600">
                        No recent commits synced
                      </div>
                    )}

                    {/* Premium Segmented Language Tech Stack Progress Bar */}
                    {repo.languages && Object.keys(repo.languages).length > 0 && (
                      <div className="mt-5 space-y-2.5">
                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-white/5 gap-[2px]">
                          {Object.entries(repo.languages).map(([lang, pct]: [string, any]) => {
                            const color = getLanguageColor(lang);
                            return (
                              <div
                                key={lang}
                                className="h-full transition-all duration-300 hover:scale-y-125 cursor-pointer first:rounded-l-full last:rounded-r-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: color,
                                  boxShadow: `0 0 6px ${color}30`
                                }}
                                title={`${lang}: ${pct}%`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-mono text-gray-400">
                          {Object.entries(repo.languages).map(([lang, pct]: [string, any]) => {
                            const color = getLanguageColor(lang);
                            return (
                              <span key={lang} className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-md hover:border-white/10 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-gray-300">{lang}</span>
                                <span className="text-cyan-400 font-bold">{pct}%</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Garbage Purge Banner & CRUD Local Deletion Trigger */}
                    {repoFilter === "garbage" && (
                      <div className="mt-4 flex items-center justify-between bg-red-950/20 border border-red-500/15 p-2.5 rounded-xl">
                        <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                          ⚠️ Stale / Empty Skeleton
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRepository(repo.id);
                          }}
                          disabled={deletingId === repo.id}
                          className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/35 text-red-300 rounded-lg transition-all duration-200 text-[10px] font-mono font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          title="Delete from local database"
                        >
                          🗑️ {deletingId === repo.id ? "Purging..." : "Purge Local DB"}
                        </button>
                      </div>
                    )}

                    <div className="mt-5 flex justify-center">
                      <Link href={`/dashboard/repo/${repo.id}/commits`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-mono font-bold transition-colors border border-cyan-500/20 hover:border-cyan-500/40">
                        View Commits Timeline &rarr;
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                        ⭐ <strong className="text-gray-300">{repo.stars}</strong>
                      </span>
                      <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        🍴 <strong className="text-gray-300">{repo.forks}</strong>
                      </span>
                    </div>

                    {repo.language && (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 font-medium">
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
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm tracking-wide font-mono">Initializing secure session...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}