"use client";
 
import {
  fetchUserRepositories,
  fetchLanguageAnalytics,
  fetchDeveloperDNA,
  updateTargetRole,
  fetchAIMentorship,
  fetchAchievements,
  fetchDailyChallenge,
  submitChallengeSolution,
  fetchCommitFeed,
  fetchFederatedGradients
} from "@/lib/api";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
 
function DashboardContent() {
  const searchParams = useSearchParams();
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Authenticated Developer profile states
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [federatedGradients, setFederatedGradients] = useState<any>(null);
 
  // Tab Control state: "dna" | "repos" | "challenge" | "activity"
  const [activeTab, setActiveTab] = useState<"dna" | "repos" | "challenge" | "activity">("dna");

  // Behavior Engine & Telemetry states (LOOP 1 / LOOP 2)
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [dnaProfile, setDnaProfile] = useState<any>(null);
  const [mentorship, setMentorship] = useState("");
  const [mentorshipLoading, setMentorshipLoading] = useState(false);
  const [goalUpdating, setGoalUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Background Sync state
  const [syncingStatus, setSyncingStatus] = useState<"idle" | "syncing" | "completed">("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // RPG Achievements & Gamification States
  const [achievements, setAchievements] = useState<any>(null);

  // Commit Feed States
  const [commitFeed, setCommitFeed] = useState<any[]>([]);

  // Daily Challenge States
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [solutionCode, setSolutionCode] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

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

      // 2. Load static arrays and metrics
      const analyticsData = await fetchLanguageAnalytics(token);
      setAnalytics(analyticsData || {});
      
      // Fallback manual call to ensure we retrieve the backend's synced list
      const reposRes = await fetch(`http://localhost:8000/repositories/all?token=${token}`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setRepositories(Array.isArray(reposData) ? reposData : []);
      }

      // Fetch behavioral genome telemetry
      const dnaData = await fetchDeveloperDNA(token);
      if (dnaData && !dnaData.detail) {
        setDnaProfile(dnaData.dna || null);
        setTargetRole(dnaData.target_role || "Fullstack Developer");
        setUsername(dnaData.username || "");
        setAvatarUrl(dnaData.avatar_url || "");
      }

      // Fetch AI mentorship advice
      setMentorshipLoading(true);
      const adviceData = await fetchAIMentorship(token);
      if (adviceData && !adviceData.detail) {
        setMentorship(adviceData.advice || "");
      }

      // Fetch Achievements XP & level values
      const achievementsData = await fetchAchievements(token);
      if (achievementsData && !achievementsData.detail) {
        setAchievements(achievementsData);
      }

      // Fetch commit feeds
      const feedData = await fetchCommitFeed(token);
      if (Array.isArray(feedData)) {
        setCommitFeed(feedData);
      }

      // Fetch Daily Code Challenges
      const challengeData = await fetchDailyChallenge(token);
      if (challengeData && !challengeData.detail) {
        setDailyChallenge(challengeData);
        setSolutionCode(challengeData.code_template || "");
      }
 
      // Fetch Federated Loop 2 Gradients
      const gradData = await fetchFederatedGradients(token);
      if (gradData && !gradData.detail) {
        setFederatedGradients(gradData);
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
      setMentorshipLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [searchParams]);

  const handleGoalChange = async (newGoal: string) => {
    try {
      setGoalUpdating(true);
      const token = sessionStorage.getItem("dualloop_session_token") || "";
      if (!token) return;

      const res = await updateTargetRole(token, newGoal);
      if (res && res.status === "success") {
        setTargetRole(res.target_role);
        setDnaProfile(res.dna);
        
        // Instant update of mentoring advice and challenges
        setMentorshipLoading(true);
        const adviceData = await fetchAIMentorship(token);
        if (adviceData && !adviceData.detail) {
          setMentorship(adviceData.advice || "");
        }

        const challengeData = await fetchDailyChallenge(token);
        if (challengeData && !challengeData.detail) {
          setDailyChallenge(challengeData);
          setSolutionCode(challengeData.code_template || "");
          setSubmissionResult(null);
        }

        // Refresh achievements as well
        const achievementsData = await fetchAchievements(token);
        if (achievementsData && !achievementsData.detail) {
          setAchievements(achievementsData);
        }
        
        // Refresh federated gradients
        const gradData = await fetchFederatedGradients(token);
        if (gradData && !gradData.detail) {
          setFederatedGradients(gradData);
        }
      }
    } catch (err) {
      console.error("Failed to update target role:", err);
    } finally {
      setGoalUpdating(false);
      setMentorshipLoading(false);
    }
  };

  const handleChallengeSubmit = async () => {
    try {
      setSubmissionLoading(true);
      setSubmissionResult(null);
      const token = sessionStorage.getItem("dualloop_session_token") || "";
      if (!token) return;

      const res = await submitChallengeSolution(token, solutionCode);
      setSubmissionResult(res);

      if (res && res.status === "success") {
        // Refresh XP & Level metrics dynamically
        const achievementsData = await fetchAchievements(token);
        if (achievementsData && !achievementsData.detail) {
          setAchievements(achievementsData);
        }
        // Mark challenge as completed
        setDailyChallenge((prev: any) => prev ? { ...prev, status: "completed" } : null);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmissionResult({
        status: "failure",
        feedback: "🔴 Server evaluation timeout. Verify your FastAPI local connection matches localhost:8000."
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!mentorship) return;
    navigator.clipboard.writeText(mentorship);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("dualloop_session_token");
    window.location.href = "/";
  };

  const getRadarPoints = (dna: any) => {
    if (!dna) return "150,150 150,150 150,150 150,150 150,150";
    const center = 150;
    
    const val0 = ((dna.ui_ux_expression || 20) / 100) * 95;
    const val1 = ((dna.logic_algorithms || 20) / 100) * 95;
    const val2 = ((dna.data_integrity || 20) / 100) * 95;
    const val3 = ((dna.devops_config || 20) / 100) * 95;
    const val4 = ((dna.velocity_endurance || 20) / 100) * 95;

    const p0 = { x: center, y: center - val0 };
    const p1 = { x: center + val1 * Math.cos(-18 * Math.PI / 180), y: center + val1 * Math.sin(-18 * Math.PI / 180) };
    const p2 = { x: center + val2 * Math.cos(54 * Math.PI / 180), y: center + val2 * Math.sin(54 * Math.PI / 180) };
    const p3 = { x: center + val3 * Math.cos(126 * Math.PI / 180), y: center + val3 * Math.sin(126 * Math.PI / 180) };
    const p4 = { x: center + val4 * Math.cos(198 * Math.PI / 180), y: center + val4 * Math.sin(198 * Math.PI / 180) };

    return `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
  };

  const renderWeeklyTrendChart = (history: any[]) => {
    if (!history || history.length === 0) {
      return (
        <div className="h-32 flex items-center justify-center text-[10px] font-mono text-gray-500 border border-white/5 rounded-xl bg-white/[0.01]">
          Waiting for historical snapshots...
        </div>
      );
    }
    
    const width = 450;
    const height = 110;
    const padding = 20;
    const pointsCount = history.length;
    
    let pathD = "";
    history.forEach((h, index) => {
      const x = padding + (index / Math.max(1, pointsCount - 1)) * (width - padding * 2);
      const y = height - padding - ((h.momentum_score || 50) / 100) * (height - padding * 2);
      if (index === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    return (
      <div className="bg-[#050508]/80 border border-white/5 rounded-xl p-4 mt-6">
        <span className="text-[10px] font-mono text-gray-500 block uppercase mb-3 tracking-wider">Fit Progress Telemetry History</span>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          
          {history.length > 1 && (
            <>
              <path 
                d={pathD} 
                fill="none" 
                stroke="url(#trend-glow)" 
                strokeWidth="2.5" 
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              />
              <defs>
                <linearGradient id="trend-glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </>
          )}
          
          {history.map((h, index) => {
            const x = padding + (index / Math.max(1, pointsCount - 1)) * (width - padding * 2);
            const y = height - padding - ((h.momentum_score || 50) / 100) * (height - padding * 2);
            return (
              <g key={index} className="group">
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4" 
                  className="fill-cyan-400 stroke-cyan-950 stroke-2 hover:r-6 transition-all cursor-pointer" 
                />
                <title>{`Date: ${h.calculated_at} | Fit: ${h.momentum_score}%`}</title>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-2 px-1">
          <span>{history[0].calculated_at}</span>
          <span>Target Alignment Trend</span>
          <span>{history[history.length - 1].calculated_at}</span>
        </div>
      </div>
    );
  };

  const renderContributionHeatmap = (feed: any[]) => {
    const dateCounts: Record<string, number> = {};
    feed.forEach(c => {
      if (c.commit_date) {
        const dateStr = c.commit_date.slice(0, 10);
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    const cols = 28;
    const rows = 7;
    const totalDays = cols * rows;
    
    const cells: { date: string; count: number }[] = [];
    const today = new Date();
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = dateCounts[dateStr] || 0;
      cells.push({ date: dateStr, count });
    }

    const getHeatColor = (count: number) => {
      if (count === 0) return "bg-[#09090c] border border-white/[0.01]";
      if (count === 1) return "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400";
      if (count === 2) return "bg-emerald-800/70 border border-emerald-500/30";
      if (count === 3) return "bg-emerald-600 border border-emerald-400/40 shadow-[0_0_6px_rgba(16,185,129,0.2)]";
      return "bg-cyan-500 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.45)]";
    };

    return (
      <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mb-8">
        <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-4 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-emerald-500 rounded"></span>
          Git Contributions Timeline Heatmap
        </h3>
        <div className="flex gap-1.5 items-center overflow-x-auto py-2 custom-scrollbar">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: rows }).map((_, rowIdx) => {
                const idx = colIdx * rows + rowIdx;
                const cell = cells[idx];
                if (!cell) return null;
                return (
                  <div 
                    key={rowIdx}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${getHeatColor(cell.count)}`}
                    title={`${cell.date} | ${cell.count} commits`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 mt-4">
          <span>Observed repository contribution matrix</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#09090c] border border-white/[0.01]"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950/40 border border-emerald-500/20"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800/70"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMentorshipMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={index} className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mt-6 mb-2 border-b border-white/5 pb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-cyan-500 rounded shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("> *") || trimmed.startsWith(">")) {
        return (
          <blockquote key={index} className="border-l-2 border-cyan-500/50 bg-cyan-950/20 rounded px-4 py-3 my-4 text-[11px] italic text-cyan-300/80 leading-relaxed font-mono">
            {trimmed.replace(">", "").replace(/['"]/g, "").trim()}
          </blockquote>
        );
      }
      if (trimmed.startsWith("* `[ ]`") || trimmed.startsWith("*")) {
        const cleanLine = trimmed.replace("* `[ ]`", "").replace("*", "").trim();
        return (
          <div key={index} className="flex items-start gap-3 my-2 text-[11px] font-mono text-gray-300">
            <span className="text-cyan-500 mt-1 font-bold">▪</span>
            <span className="leading-relaxed">{cleanLine}</span>
          </div>
        );
      }
      if (trimmed === "---") {
        return <hr key={index} className="border-white/5 my-4" />;
      }
      if (trimmed) {
        return <p key={index} className="text-[11px] text-gray-400 font-mono my-2 leading-relaxed">{trimmed}</p>;
      }
      return <div key={index} className="h-2"></div>;
    });
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "Normal":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold animate-pulse">Normal</span>;
      case "Low-Moderate":
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">Low-Moderate</span>;
      case "Moderate":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">Moderate</span>;
      case "High":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold animate-pulse">High Alert</span>;
      case "Critical":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-400 text-[10px] font-mono font-bold animate-bounce">Critical Drift</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-mono">Unknown</span>;
    }
  };

  const alignmentVal = dnaProfile ? dnaProfile.career_alignment_score : 50;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (alignmentVal / 100) * circumference;

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
            <p className="text-sm text-cyan-400/70 mt-1 animate-pulse">Running loop telemetry diagnostics & genome calculation...</p>
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
                Developer diagnostic, career game systems, and background git synchronization.
              </p>
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

        {/* Stateful Tab Selector */}
        <div className="flex border-b border-white/5 mb-8 gap-6 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab("dna")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative whitespace-nowrap ${activeTab === "dna" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "dna" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            🧬 Interactive Telemetry DNA
          </button>
          <button 
            onClick={() => setActiveTab("challenge")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative whitespace-nowrap ${activeTab === "challenge" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "challenge" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            ⚔️ Daily Coding Challenge
          </button>
          <button 
            onClick={() => setActiveTab("activity")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative whitespace-nowrap ${activeTab === "activity" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "activity" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            🔥 Activity & Calendar
          </button>
          <button 
            onClick={() => setActiveTab("repos")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative whitespace-nowrap ${activeTab === "repos" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "repos" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            📁 Synced Repositories ({repositories.length})
          </button>
        </div>

        {activeTab === "dna" && (
          /* Tab 1: DNA Analytics, AI Mentorship, and RPG achievements card */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: DNA Radar & Settings */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* RPG Character Card */}
              {achievements && (
                <div className="bg-gradient-to-b from-[#111116] to-[#08080a] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-11 h-11 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-center justify-center text-xl font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                      {achievements.level}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Level {achievements.level} Coder</span>
                      <h4 className="text-sm font-extrabold text-white tracking-tight mt-0.5">
                        {dnaProfile?.developer_role_title || "Fullstack Craftsman"}
                      </h4>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>XP: <strong>{achievements.total_xp}</strong></span>
                      <span>Next Level: <strong>{achievements.next_level_xp}</strong></span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${achievements.level_progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dynamic Dimension XP Breakdown */}
                  <div className="space-y-3.5 pt-4 border-t border-white/5">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">GENOM XP BREAKDOWN</span>
                    
                    {[
                      { label: "UI/UX", xp: achievements.xp_breakdown.ui_ux, color: "from-pink-500 to-rose-500" },
                      { label: "Algorithms", xp: achievements.xp_breakdown.logic, color: "from-violet-500 to-indigo-500" },
                      { label: "Data Integrity", xp: achievements.xp_breakdown.data, color: "from-blue-500 to-cyan-500" },
                      { label: "DevOps & Config", xp: achievements.xp_breakdown.devops, color: "from-amber-500 to-orange-500" },
                      { label: "Velocity & Pacing", xp: achievements.xp_breakdown.velocity, color: "from-emerald-500 to-teal-500" },
                    ].map((d) => (
                      <div key={d.label} className="text-[10px] font-mono">
                        <div className="flex justify-between text-gray-400 mb-1">
                          <span>{d.label}</span>
                          <span className="text-white font-bold">{d.xp} XP</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${d.color} rounded-full`}
                            style={{ width: `${Math.min(100, (d.xp / 1000) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal Alignment Selector Card */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/30 to-cyan-500/30"></div>
                
                <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-cyan-500 rounded shadow-[0_0_6px_rgba(6,182,212,0.5)]"></span>
                  Goal Alignment Engine
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-mono text-gray-500 block mb-2 uppercase">Declared Target Career Path</label>
                    <select 
                      value={targetRole}
                      onChange={(e) => handleGoalChange(e.target.value)}
                      disabled={goalUpdating}
                      className="w-full bg-[#050507] border border-white/10 hover:border-cyan-500/40 rounded-xl px-3 py-2.5 text-xs text-white font-mono transition-colors outline-none focus:border-cyan-500/60 cursor-pointer"
                    >
                      <option value="Fullstack Developer">Fullstack Developer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="AI Engineer">AI Engineer</option>
                    </select>
                  </div>

                  <div className="bg-white/2 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 block uppercase">Alignment Score</span>
                      <span className="text-2xl font-extrabold text-cyan-400 mt-1 block tracking-tight">
                        {alignmentVal}%
                      </span>
                      <div className="mt-2.5">
                        {dnaProfile ? getSeverityBadge(dnaProfile.severity_level) : getSeverityBadge("Normal")}
                      </div>
                    </div>
                    
                    <div className="relative flex items-center justify-center w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r={radius} className="text-white/5 stroke-current" strokeWidth="5" fill="transparent" />
                        <circle cx="40" cy="40" r={radius} className="text-cyan-500 stroke-current drop-shadow-[0_0_6px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out" strokeWidth="5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                      </svg>
                      <span className="absolute text-[10px] font-mono font-bold text-gray-400">FIT</span>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Federated Loop 2 Telemetry Card */}
              {federatedGradients && (
                <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/20 to-cyan-500/20"></div>
                  
                  <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-purple-500 rounded shadow-[0_0_6px_rgba(147,51,234,0.5)]"></span>
                    Loop 2: Federated Learning
                  </h3>
                  
                  <div className="space-y-3.5 font-mono text-[10px]">
                    <div className="flex justify-between items-center bg-[#050507] p-2.5 border border-white/5 rounded-xl">
                      <span className="text-gray-500">CLIENT ID</span>
                      <span className="text-purple-400 font-bold tracking-wider">{federatedGradients.federated_client_id}</span>
                    </div>
 
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-gray-400">
                        <span>Avg Alignment Trajectory</span>
                        <span className="text-cyan-400 font-bold">{federatedGradients.telemetry_gradients.avg_alignment_index}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500" 
                          style={{ width: `${federatedGradients.telemetry_gradients.avg_alignment_index}%` }}
                        ></div>
                      </div>
                    </div>
 
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-gray-400">
                        <span>Pacing Trajectory Delta</span>
                        <span className={`font-bold ${federatedGradients.telemetry_gradients.trajectory_gradient_delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {federatedGradients.telemetry_gradients.trajectory_gradient_delta >= 0 ? "+" : ""}{federatedGradients.telemetry_gradients.trajectory_gradient_delta}%
                        </span>
                      </div>
                    </div>
 
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-gray-400">
                        <span>Streak Endurance Ratio</span>
                        <span className="text-amber-400 font-bold">{Math.round(federatedGradients.telemetry_gradients.streak_endurance_ratio * 100)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ width: `${federatedGradients.telemetry_gradients.streak_endurance_ratio * 100}%` }}
                        ></div>
                      </div>
                    </div>
 
                    <p className="text-[9px] text-gray-500 leading-normal mt-2 select-text border-t border-white/5 pt-3">
                      🔒 {federatedGradients.privacy_guarantee}
                    </p>
                  </div>
                </div>
              )}
 
            </div>

            {/* Right Column: AI Mentorship terminal console & Weekly progress history chart */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Terminal Card */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col min-h-[480px]">
                <div className="bg-[#07070a] px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                    <span className="text-xs font-mono font-semibold text-gray-400 ml-2">mentorship_engine_console.sh</span>
                  </div>
                  
                  {mentorship && (
                    <button 
                      onClick={handleCopyToClipboard}
                      className="px-3 py-1 text-[10px] font-mono font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 active:scale-95 shadow-[0_0_6px_rgba(6,182,212,0.1)]"
                    >
                      {copySuccess ? "✓ Copied!" : "📋 Copy Standup"}
                    </button>
                  )}
                </div>

                <div className="p-6 overflow-y-auto flex-1 max-h-[500px] custom-scrollbar">
                  <div className="bg-[#050508]/80 rounded-xl px-4 py-3 mb-6 font-mono text-[10px] text-gray-500 border border-white/5">
                    <span className="text-cyan-500/80">&gt; dualloop --evaluate-mentor --key=gemini-2.5-flash</span>
                    <div className="text-emerald-500/80">[OK] DNA Profile processed. Synchronized commit telemetry indices.</div>
                    <div className="text-cyan-500/80">[OK] Calculated alignment: {alignmentVal}%. Class: {dnaProfile?.developer_role_title || "Fullstack"}.</div>
                  </div>

                  {mentorshipLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 animate-spin shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>
                      </div>
                      <span className="text-xs font-mono text-cyan-400/80 animate-pulse">Running cognitive telemetry analysis...</span>
                    </div>
                  ) : mentorship ? (
                    <div className="prose prose-invert max-w-none">
                      {renderMentorshipMarkdown(mentorship)}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500 text-xs font-mono">
                      No active snapshots. Press Force Resync to load commits.
                    </div>
                  )}
                </div>
              </div>

              {/* Progress History SVG Line Chart & Badges Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SVG Progress chart */}
                <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                  <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-cyan-500 rounded"></span>
                    Alignment Time-Series History
                  </h3>
                  {dnaProfile && dnaProfile.history ? renderWeeklyTrendChart(dnaProfile.history) : (
                    <div className="h-32 flex items-center justify-center text-xs font-mono text-gray-500">
                      No historical telemetry logs.
                    </div>
                  )}
                </div>

                {/* RPG Unlocked Badges */}
                <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-3 bg-purple-500 rounded"></span>
                      Unlocked Achievements & Badges
                    </h3>

                    {achievements && achievements.badges && achievements.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5 max-h-44 overflow-y-auto custom-scrollbar">
                        {achievements.badges.map((badge: any) => (
                          <div 
                            key={badge.id}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-950/20 to-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400/40 rounded-xl cursor-help transition-all duration-300"
                            title={badge.desc}
                          >
                            <span className="text-lg">{badge.icon}</span>
                            <span className="text-[10px] font-mono font-bold text-gray-200">{badge.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs font-mono text-gray-500">
                        No achievement badges unlocked yet. Keep coding to earn 300+ XP in any dimension!
                      </div>
                    )}
                  </div>

                  {achievements && (
                    <div className="text-[9px] font-mono text-gray-500 mt-4 border-t border-white/5 pt-3">
                      Total XP: <strong className="text-cyan-400">{achievements.total_xp}</strong> | Dimension target: 300 XP
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {activeTab === "challenge" && (
          /* Tab 2: Interactive Daily Code Challenges from Gemini */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Challenge Description */}
            <div className="lg:col-span-1 space-y-6">
              {dailyChallenge ? (
                <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-500/40 to-amber-500/40"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-950/50 border border-amber-500/30 text-amber-400 rounded">
                      🎯 Daily Challenge
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 rounded">
                      {dailyChallenge.radar_dimension}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {dailyChallenge.title}
                  </h3>
                  
                  <hr className="border-white/5 my-4" />

                  <div className="text-xs font-mono text-gray-300 leading-relaxed space-y-3">
                    <p className="font-semibold text-gray-400">Problem Statement:</p>
                    <p className="bg-[#050507] rounded-xl p-4 border border-white/5 text-[11px] leading-relaxed select-text whitespace-pre-line text-gray-300">
                      {dailyChallenge.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500">
                    <p>🎯 Target Check: <strong>{dailyChallenge.test_criteria}</strong></p>
                    <p className="mt-1">🎁 Reward: <strong className="text-amber-400">+150 {dailyChallenge.radar_dimension} XP</strong></p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-8 text-center text-gray-500 text-xs font-mono">
                  Loading daily technical challenge parameters...
                </div>
              )}
            </div>

            {/* Right side: Code editor and console results */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Terminal Code Editor */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col min-h-[460px]">
                <div className="bg-[#07070a] px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                    <span className="text-xs font-mono font-semibold text-gray-400 ml-2">cybernetic_ide_buffer.py</span>
                  </div>
                  
                  <span className="text-[10px] font-mono text-gray-500">Python/JavaScript Mode</span>
                </div>

                <div className="p-4 flex-1 flex flex-col bg-[#050508]/60">
                  <textarea 
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    disabled={submissionLoading || dailyChallenge?.status === "completed"}
                    className="w-full flex-1 p-4 bg-[#050507] border border-white/5 rounded-xl text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500/20 select-text resize-none custom-scrollbar min-h-[250px]"
                    style={{ tabSize: 4 }}
                    spellCheck="false"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-mono text-gray-500">Write actual code logic, avoiding dummy returns.</span>
                    <button 
                      onClick={handleChallengeSubmit}
                      disabled={submissionLoading || !solutionCode.trim() || dailyChallenge?.status === "completed"}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-mono font-bold text-xs text-black transition-all duration-300 disabled:opacity-40 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                    >
                      {submissionLoading ? "⚡ Analyzing Solution..." : dailyChallenge?.status === "completed" ? "✓ Already Completed" : "⚡ Verify Code Solution"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Evaluator Output Console */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                <span className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-3 block">
                  Automated Gemini Evaluator Console
                </span>
                
                {submissionResult ? (
                  <div className={`p-4 rounded-xl border font-mono text-xs leading-relaxed ${submissionResult.status === "success" ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-rose-950/20 border-rose-500/30 text-rose-300"}`}>
                    <p className="font-bold flex items-center gap-2 mb-2">
                      {submissionResult.status === "success" ? "🟢 EVALUATION SUCCESS" : "🔴 EVALUATION FAILURE"}
                      {submissionResult.xp_awarded > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] rounded font-extrabold animate-bounce">
                          +150 XP AWARDED!
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-line leading-relaxed text-[11px] text-gray-300">
                      {submissionResult.feedback}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/5 bg-[#050507] text-[10px] font-mono text-gray-500 text-center">
                    Awaiting solution submission... Write your solution code above and press Verify.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {activeTab === "activity" && (
          /* Tab 3: Git activity log streams & HSL heatmap calendars */
          <div className="space-y-8">
            
            {/* Custom contribution heatmap calendar */}
            {renderContributionHeatmap(commitFeed)}

            {/* Scrolling Timeline Commits Feed */}
            <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-cyan-500 rounded"></span>
                Commit Contribution Activity Feed ({commitFeed.length} synced entries)
              </h3>

              {commitFeed.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-gray-500">
                  No commit logs synchronized. Commit source code changes and run Force Resync to populate data.
                </div>
              ) : (
                <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                  {commitFeed.map((c, idx) => (
                    <div key={idx} className="relative group select-text">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                      
                      <div className="bg-[#050508]/80 hover:bg-[#07070a] border border-white/[0.03] hover:border-cyan-500/20 rounded-xl p-4 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] font-mono text-gray-500">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400 font-bold">
                              sha: {c.sha}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-purple-950/20 border border-purple-500/10 text-purple-400 font-semibold">
                              repo: {c.repo_name}
                            </span>
                          </div>
                          <span>{c.commit_date}</span>
                        </div>

                        <p className="text-xs font-semibold text-gray-200 mt-2.5 font-mono line-clamp-2 leading-relaxed">
                          {c.message}
                        </p>

                        <div className="mt-2.5 text-[9px] font-mono text-gray-500">
                          Author: <strong className="text-gray-300">{c.author_name}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "repos" && (
          /* Tab 4: Synced Repositories Diagnostics list */
          <div className="space-y-6">
            <h3 className="text-sm font-bold tracking-wider font-mono text-gray-200 uppercase flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3 bg-cyan-500 rounded"></span>
              Synchronized Git repositories
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-cyan-400">
                {repositories.length} Total
              </span>
            </h3>

            {repositories.length === 0 ? (
              <div className="bg-[#0b0b0e]/50 border border-dashed border-white/10 rounded-2xl p-16 text-center shadow-xl">
                <div className="text-4xl mb-4 text-gray-600">📁</div>
                <h4 className="text-lg font-bold text-gray-300">No repositories available</h4>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  Verify that your GitHub account has accessible public or private repositories and try forcing resync.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
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
 
                      {repo.latest_commit ? (
                        <div className="mt-4 p-3 bg-white/2 border border-white/5 rounded-xl text-[10px] font-mono leading-normal">
                          <div className="flex justify-between text-gray-500 mb-1">
                            <span>LATEST COMMIT</span>
                            <span className="text-cyan-400 font-bold">{repo.latest_commit.sha}</span>
                          </div>
                          <p className="text-gray-300 line-clamp-1 leading-snug font-semibold select-text">
                            {repo.latest_commit.message}
                          </p>
                          <span className="text-[9px] text-gray-500 block mt-1">
                            By {repo.latest_commit.author_name}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-white/1 border border-white/[0.03] border-dashed rounded-xl text-[10px] font-mono text-gray-600">
                          No recent commits synced
                        </div>
                      )}
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
        )}

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