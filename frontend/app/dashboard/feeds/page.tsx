"use client";

import { fetchUserRepositories } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  FolderOpen, 
  HardDrive, 
  GitBranch, 
  GitPullRequest, 
  AlertTriangle, 
  Trash2, 
  Eye,
  CheckCircle2,
  GitFork
} from "lucide-react";

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

const getLanguageGlowStyle = (lang: string): { bgGlow: string; borderGlow: string; category: string } => {
  const defaults = {
    bgGlow: "from-gray-500/10 via-transparent to-transparent",
    borderGlow: "group-hover:border-gray-500/30",
    category: "General Integration"
  };

  const systems: Record<string, typeof defaults> = {
    TypeScript: {
      bgGlow: "from-[#3178c6]/10 via-[#3178c6]/2 to-transparent",
      borderGlow: "group-hover:border-[#3178c6]/45 group-hover:shadow-[0_0_12px_rgba(49,120,198,0.15)]",
      category: "Frontend Stack"
    },
    JavaScript: {
      bgGlow: "from-[#f1e05a]/10 via-[#f1e05a]/2 to-transparent",
      borderGlow: "group-hover:border-[#f1e05a]/45 group-hover:shadow-[0_0_12px_rgba(241,224,90,0.15)]",
      category: "Scripting Interface"
    },
    Python: {
      bgGlow: "from-[#3572A5]/10 via-[#3572a5]/2 to-transparent",
      borderGlow: "group-hover:border-[#3572A5]/45 group-hover:shadow-[0_0_12px_rgba(53,114,165,0.15)]",
      category: "Backend / Telemetry"
    },
    Rust: {
      bgGlow: "from-[#dea584]/10 via-[#dea584]/2 to-transparent",
      borderGlow: "group-hover:border-[#dea584]/45 group-hover:shadow-[0_0_12px_rgba(222,165,132,0.15)]",
      category: "Core Station Layer"
    },
    Go: {
      bgGlow: "from-[#00ADD8]/10 via-[#00add8]/2 to-transparent",
      borderGlow: "group-hover:border-[#00ADD8]/45 group-hover:shadow-[0_0_12px_rgba(0,173,216,0.15)]",
      category: "Distributed Services"
    },
    CSS: {
      bgGlow: "from-[#563d7c]/10 via-[#563d7c]/2 to-transparent",
      borderGlow: "group-hover:border-[#563d7c]/45 group-hover:shadow-[0_0_12px_rgba(86,61,124,0.15)]",
      category: "Visual Framework"
    }
  };

  return systems[lang] || defaults;
};

function FeedsContent() {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Search & Sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");
  const [repoFilter, setRepoFilter] = useState<"all" | "recent" | "active" | "stale" | "garbage">("all");

  const loadFeeds = async () => {
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || searchParams.get("token") || "";
      if (!token) {
        setLoading(false);
        return;
      }

      // Load repository list
      const reposRes = await fetch(`http://localhost:8000/repositories/all?token=${token}`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setRepositories(Array.isArray(reposData) ? reposData : []);
      }
    } catch (err) {
      console.error("Feeds loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
    window.addEventListener("dualloop_resync", loadFeeds);
    return () => {
      window.removeEventListener("dualloop_resync", loadFeeds);
    };
  }, [searchParams]);

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

  // Filter computations
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

  const getCategorizedRepositories = () => {
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

  const getProcessedRepositories = () => {
    let list = getCategorizedRepositories();

    // Text search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(query) || 
        (r.description && r.description.toLowerCase().includes(query)) ||
        (r.languages && Object.keys(r.languages).some(l => l.toLowerCase().includes(query)))
      );
    }

    // Advanced sorting criteria
    return [...list].sort((a, b) => {
      if (sortBy === "stars") {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });
  };

  const filteredRepos = getProcessedRepositories();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 select-none gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white select-text">Mapped Feeds Repository Catalog</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Explore, search, sort, and manage synced git stations inside SQLite.</p>
        </div>
        <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#111116] border border-white/5 text-cyan-400 rounded-lg flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5" />
          <span>Mapped Stations: {repositories.length}</span>
        </span>
      </div>

      {/* Seventeen style Action Bar */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4">
        <div className="relative w-full xl:w-80 shrink-0 select-none">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full bg-[#0d0d10] border border-white/[0.05] rounded-xl pl-8 pr-14 py-2.5 text-xs text-white font-sans placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[8px] font-mono text-gray-600 uppercase select-none">
            ⌘ K
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#0d0d10] border border-white/[0.05] px-3.5 py-2 rounded-xl text-[10px] font-mono shrink-0 select-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500 uppercase">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-gray-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="updated" className="bg-[#0c0c0e] text-white">Latest Commit</option>
            <option value="stars" className="bg-[#0c0c0e] text-white">Stars</option>
            <option value="name" className="bg-[#0c0c0e] text-white">Name</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 border-l border-white/[0.04] pl-4">
          <button
            onClick={() => setRepoFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-tight transition-colors shrink-0 cursor-pointer ${
              repoFilter === "all" ? "bg-white text-black" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            All Repositories
          </button>
          <button
            onClick={() => setRepoFilter("recent")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-tight transition-colors shrink-0 cursor-pointer ${
              repoFilter === "recent" ? "bg-white text-black" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            Recent Syncs
          </button>
          <button
            onClick={() => setRepoFilter("active")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-tight transition-colors shrink-0 cursor-pointer ${
              repoFilter === "active" ? "bg-white text-black" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            Active Stations
          </button>
          <button
            onClick={() => setRepoFilter("stale")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-tight transition-colors shrink-0 cursor-pointer ${
              repoFilter === "stale" ? "bg-white text-black" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            Stale Standby
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="space-y-6">
        <h3 className="text-sm font-extrabold text-white pl-1 select-none">
          Recommended <span className="text-gray-500 font-medium font-sans">({filteredRepos.length})</span>
        </h3>

        {filteredRepos.length === 0 ? (
          <div className="bg-white/[0.01] border border-dashed border-white/[0.05] rounded-3xl p-16 text-center animate-fade-in w-full">
            <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4 select-none" />
            <h4 className="text-md font-bold text-gray-400">No matching stations found</h4>
            <p className="text-xs text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
              No repositories matched your filtering options. Try updating your filters above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => {
              const primaryLang = repo.language || "TypeScript";
              const { bgGlow, borderGlow, category } = getLanguageGlowStyle(primaryLang);
              const isConnected = repo.stars > 0 || repo.forks > 0;

              return (
                <div
                  key={repo.id}
                  className={`group relative bg-[#0d0d10] border border-white/[0.04] rounded-3xl p-6 transition-all duration-500 flex flex-col justify-between overflow-hidden ${borderGlow}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} transition-opacity duration-500 opacity-60 z-0 pointer-events-none`} />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#121216] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <span 
                        className="w-3.5 h-3.5 rounded-full block shadow-lg"
                        style={{ backgroundColor: getLanguageColor(primaryLang) }}
                      />
                    </div>
                    
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-full select-none">
                      {category}
                    </span>
                  </div>

                  <div className="relative z-10 mt-8 space-y-3">
                    <h4 className="text-sm font-extrabold text-white tracking-tight select-text group-hover:text-cyan-400 transition-colors">
                      {repo.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[36px] select-text">
                      {repo.description || "Diagnostics operational. Core fullstack repository metadata successfully processed."}
                    </p>
                  </div>

                  <div className="relative z-10 mt-5 pt-3 border-t border-white/[0.04] flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-mono text-gray-500">
                    {repo.size != null && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{repo.size >= 1024 ? `${(repo.size / 1024).toFixed(1)} MB` : `${repo.size} KB`}</span>
                      </span>
                    )}
                    {repo.default_branch && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>{repo.default_branch}</span>
                      </span>
                    )}
                  </div>

                  {/* Purge Block */}
                  {repoFilter === "garbage" && (
                    <div className="relative z-10 mt-4 flex items-center justify-between bg-red-950/20 border border-red-500/15 p-2 rounded-xl">
                      <span className="text-[9px] font-mono text-red-400 select-none flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Stale Empty Station</span>
                      </span>
                      <button
                        onClick={() => handleDeleteRepository(repo.id)}
                        disabled={deletingId === repo.id}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/35 border border-red-500/20 hover:border-red-500/40 text-red-300 rounded-lg transition-all text-[9px] font-mono font-bold flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{deletingId === repo.id ? "Purging..." : "Purge Station DB"}</span>
                      </button>
                    </div>
                  )}

                  <div className="relative z-10 mt-7 pt-4 border-t border-white/[0.04] flex items-center justify-between select-none">
                    <Link
                      href={`/dashboard/repo/${repo.id}/commits`}
                      className="text-[10px] font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 hover:translate-x-0.5 duration-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Explore Timeline &rarr;</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-gray-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className={`w-3 h-3 ${isConnected ? "text-emerald-400 animate-pulse" : "text-gray-600"}`} />
                        <span>{isConnected ? "Connected" : "Not Connected"}</span>
                      </span>
                      
                      <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 relative cursor-pointer border ${
                        isConnected ? "bg-white border-white" : "bg-[#16161a] border-white/10"
                      }`}>
                        <div className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 shadow-md ${
                          isConnected ? "translate-x-3.5 bg-black" : "translate-x-0 bg-gray-600"
                        }`} />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default function FeedsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="relative w-12 h-12 animate-spin rounded-full border-4 border-t-cyan-500 border-cyan-500/20"></div>
      </div>
    }>
      <FeedsContent />
    </Suspense>
  );
}
