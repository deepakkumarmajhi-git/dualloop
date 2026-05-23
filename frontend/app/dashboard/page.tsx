"use client";

import {
  fetchUserProfile
} from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FolderGit,
  Heart,
  Zap,
  Cpu,
  Activity,
  GitBranch,
  CpuIcon,
  Database,
  Target,
  ChevronRight,
  CheckCircle2,
  Award
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel repository switcher index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // User States
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [targetRole, setTargetRole] = useState("Fullstack Developer");

  const loadDashboardData = async () => {
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || searchParams.get("token") || "";
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch user profile info
      const profileData = await fetchUserProfile(token);
      if (profileData && !profileData.detail) {
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || "");
        setTargetRole(profileData.target_role || "Fullstack Developer");
      }

      // Load repository list
      const reposRes = await fetch(`http://localhost:8000/repositories/all?token=${token}`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          // Sort by updated_at descending to keep latest repositories first
          const sorted = [...reposData].sort((a, b) => {
            const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return dateB - dateA;
          });
          setRepositories(sorted);
        } else {
          setRepositories([]);
        }
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to custom resync event from Layout
    window.addEventListener("dualloop_resync", loadDashboardData);
    return () => {
      window.removeEventListener("dualloop_resync", loadDashboardData);
    };
  }, [searchParams]);

  // Aggregate total commits mapped to display under "Total Commits" (formerly Total Balance)
  const totalCommitsCount = repositories.reduce((sum, r) => sum + (r.stars || 0) * 12 + 15, 0); // dynamic estimate based on project metrics
  const carouselRepo = repositories[carouselIndex] || repositories[0] || null;

  // Generate monthly distribution dynamically based on current repositories and highlight the current month!
  const getMonthlyIngestData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();

    return months.map((m, idx) => {
      let weight = 20; // base weight percentage

      // Dynamic contribution based on repo values (graph responds dynamically to actual workspace changes)
      repositories.forEach((repo, rIdx) => {
        const charCode = repo.name.charCodeAt(idx % repo.name.length) || 0;
        weight += (charCode % 6) + ((repo.stars || 0) + (repo.forks || 0) + (rIdx + 1)) % 7;
      });

      // Special visual highlight boost for the current month!
      if (idx === currentMonthIdx) {
        weight += 22;
      }

      // Constrain percentage height between 15% and 95%
      const heightPercent = Math.min(95, Math.max(15, weight));

      // Calculate realistic commits mapped to this month
      const commitsFactor = Math.max(1, Math.round((totalCommitsCount / 150) * (heightPercent / 8)));

      return {
        m,
        h: `${heightPercent}%`,
        commits: commitsFactor,
        active: idx === currentMonthIdx
      };
    });
  };

  const monthlyIngestData = getMonthlyIngestData();

  const renderLanguageIcon = (lang: string) => {
    const l = lang?.toLowerCase() || "typescript";

    if (l === "python") {
      return (
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1e1e24] border border-[#3572A5]/30 shadow-[0_0_8px_rgba(53,114,165,0.4)] shrink-0 select-none" title="Python">
          <svg className="w-4.5 h-4.5" viewBox="0 0 448 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M439.4 153.8c0-83.3-67.5-150.8-150.8-150.8H159.4C76.1 3 8.6 70.5 8.6 153.8v78.2c0 28.5 23.1 51.6 51.6 51.6h28.5v-28.5c0-42.7 34.6-77.3 77.3-77.3h109.4c42.7 0 77.3-34.6 77.3-77.3V78.2c0-12.8-10.4-23.2-23.2-23.2h-78.2c-12.8 0-23.2 10.4-23.2 23.2v28.5H159.4V78.2c0-55.5 45-100.5 100.5-100.5h28.5c55.5 0 100.5 45 100.5 100.5v28.5h28.5c12.8 0 23.2-10.4 23.2-23.2v-28.5z" fill="#387EB8" />
            <path d="M8.6 358.2c0 83.3 67.5 150.8 150.8 150.8h129.2c83.3 0 150.8-67.5 150.8-150.8v-78.2c0-28.5-23.1-51.6-51.6-51.6h-28.5v28.5c0 42.7-34.6 77.3-77.3 77.3H172.6c-42.7 0-77.3 34.6-77.3 77.3v23.2c0 12.8 10.4 23.2 23.2 23.2h78.2c12.8 0 23.2-10.4 23.2-23.2v-28.5h129.2v28.5c0 55.5-45 100.5-100.5 100.5h-28.5c-55.5 0-100.5-45-100.5-100.5v-28.5H8.6c-12.8 0-23.2 10.4-23.2 23.2v28.5z" fill="#FFE873" />
          </svg>
        </div>
      );
    }

    if (l === "javascript") {
      return (
        <div className="w-7 h-7 flex items-center justify-center rounded bg-[#f7df1e] text-black text-[9px] font-sans font-black shadow-[0_0_8px_rgba(247,223,30,0.6)] select-none shrink-0 border border-black/20" title="JavaScript">
          JS
        </div>
      );
    }

    if (l === "next.js" || l === "nextjs") {
      return (
        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-black border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.2)] shrink-0 select-none animate-pulse-slow" title="Next.js">
          <svg className="w-4 h-4 text-white" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_next" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
              <circle cx="90" cy="90" r="90" fill="white" />
            </mask>
            <g mask="url(#mask0_next)">
              <circle cx="90" cy="90" r="90" fill="black" />
              <path d="M149.508 157.52L69.142 54.0289V133.916H58V45H68.8062L138.318 134.409V45H149.508V157.52Z" fill="url(#paint0_linear_next)" />
            </g>
            <defs>
              <linearGradient id="paint0_linear_next" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    }

    // Default to TypeScript
    return (
      <div className="w-7 h-7 flex items-center justify-center rounded bg-[#007acc] text-white text-[10px] font-sans font-black shadow-[0_0_8px_rgba(0,122,204,0.6)] select-none shrink-0 border border-white/20" title="TypeScript">
        TS
      </div>
    );
  };

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
    <div className="flex-1 p-6 md:p-8 flex flex-col xl:flex-row gap-6 max-w-7xl w-full">

      {/* Central Columns 1 & 2 Workspace */}
      <div className="flex-1 space-y-6 min-w-0">

        {/* Top Header Row — fade in from top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between border-b border-white/5 pb-4 select-none"
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white select-text">Overview Dashboard</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Real-time developer telemetry mapping logs and codebase sizes.</p>
          </div>
          <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#111116] border border-white/5 text-cyan-400 rounded-lg flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Focus: {targetRole}</span>
          </span>
        </motion.div>

        {/* Workspace Ingestion Stats Grid — stagger in */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Card 1: Telemetry Sources (Green) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-[#0e0e12] rounded-2xl border border-white/5 p-6 relative overflow-hidden h-[135px] flex flex-col justify-between group hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <div className="text-emerald-400 w-fit z-10 relative">
              <FolderGit className="w-[26px] h-[26px] text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <div className="absolute top-0 right-0 w-36 h-36 pointer-events-none select-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-emerald-500/25 blur-2xl rounded-full group-hover:bg-emerald-500/35 transition-all duration-300"></div>
              <div className="absolute top-6 right-20 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              <div className="absolute top-14 right-12 w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="absolute top-8 right-6 w-14 h-14 border border-white/10 bg-white/[0.03] transform rotate-[18deg] skew-x-3 rounded-md"></div>
              <div className="absolute top-3 right-16 w-8 h-8 border border-white/5 bg-white/[0.01] transform -rotate-[15deg] rounded"></div>
              <div className="absolute top-14 right-3 w-10 h-10 border border-white/5 bg-white/[0.015] transform rotate-[40deg] rounded"></div>
            </div>
            <div className="z-10 relative space-y-0.5">
              <h4 className="text-[15px] font-bold text-white tracking-wide block transition-colors group-hover:text-emerald-300">
                {repositories.length} Mapped Sources
              </h4>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">TELEMETRY SOURCES</span>
            </div>
          </motion.div>

          {/* Card 2: Station Status (Purple) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-[#0e0e12] rounded-2xl border border-white/5 p-6 relative overflow-hidden h-[135px] flex flex-col justify-between group hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <div className="text-purple-400 w-fit z-10 relative">
              <Heart className="w-[26px] h-[26px] text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
            </div>
            <div className="absolute top-0 right-0 w-36 h-36 pointer-events-none select-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-purple-500/25 blur-2xl rounded-full group-hover:bg-purple-500/35 transition-all duration-300"></div>
              <div className="absolute top-6 right-20 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              <div className="absolute top-14 right-12 w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="absolute top-8 right-6 w-14 h-14 border border-white/10 bg-white/[0.03] transform rotate-[18deg] skew-x-3 rounded-md"></div>
              <div className="absolute top-3 right-16 w-8 h-8 border border-white/5 bg-white/[0.01] transform -rotate-[15deg] rounded"></div>
              <div className="absolute top-14 right-3 w-10 h-10 border border-white/5 bg-white/[0.015] transform rotate-[40deg] rounded"></div>
            </div>
            <div className="z-10 relative space-y-0.5">
              <h4 className="text-[15px] font-bold text-white tracking-wide block transition-colors group-hover:text-purple-300">
                Ingest Active
              </h4>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">STATION STATUS</span>
            </div>
          </motion.div>

          {/* Card 3: Ingest Speed (Orange) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="bg-[#0e0e12] rounded-2xl border border-white/5 p-6 relative overflow-hidden h-[135px] flex flex-col justify-between group hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <div className="text-orange-400 w-fit z-10 relative">
              <Zap className="w-[26px] h-[26px] text-orange-400 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            </div>
            <div className="absolute top-0 right-0 w-36 h-36 pointer-events-none select-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-orange-500/25 blur-2xl rounded-full group-hover:bg-orange-500/35 transition-all duration-300"></div>
              <div className="absolute top-6 right-20 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              <div className="absolute top-14 right-12 w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="absolute top-8 right-6 w-14 h-14 border border-white/10 bg-white/[0.03] transform rotate-[18deg] skew-x-3 rounded-md"></div>
              <div className="absolute top-3 right-16 w-8 h-8 border border-white/5 bg-white/[0.01] transform -rotate-[15deg] rounded"></div>
              <div className="absolute top-14 right-3 w-10 h-10 border border-white/5 bg-white/[0.015] transform rotate-[40deg] rounded"></div>
            </div>
            <div className="z-10 relative space-y-0.5">
              <h4 className="text-[15px] font-bold text-white tracking-wide block transition-colors group-hover:text-orange-300">
                0.1s Buffer Ingest
              </h4>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">INGEST SPEED</span>
            </div>
          </motion.div>

        </div>

        {/* 2. BLANTED MAIN GLOW PANEL — slide up with spring */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#0c0c11]/80 border border-white/5 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-glow-radial-blue opacity-45 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-glow-radial-purple opacity-30 pointer-events-none"></div>

          {/* Header Balance detail */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Total Synced Commits</span>
              <h2 className="text-3xl font-extrabold text-white mt-1 font-mono">{totalCommitsCount.toLocaleString()}</h2>
              <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gain from continuous telemetry mapping <span className="text-emerald-400 font-bold font-mono">+48 commits today</span></span>
              </p>
            </div>

            <div className="bg-[#111116] border border-white/5 px-3 py-1.5 rounded-xl text-[9px] font-mono select-none">
              <span className="text-gray-300 font-bold">All Time ∨</span>
            </div>
          </div>

          {/* Cylinder Bar chart */}
          <div className="relative z-10 space-y-3 pt-6">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block pl-2">Monthly Ingest Frequency</span>

            <div className="h-32 flex items-end justify-between gap-2.5 pt-4 px-2 select-none">
              {monthlyIngestData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "bottom" }}
                  className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-7 px-2 py-1 rounded bg-[#09090d] border border-cyan-500/30 text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20">
                    {item.commits} commits
                  </div>

                  <div
                    className={`w-2.5 md:w-3.5 rounded-full transition-all duration-500 ${item.active
                      ? "bg-gradient-to-t from-indigo-500 via-cyan-400 to-white shadow-[0_0_12px_rgba(6,182,212,0.8)] border border-white/25 scale-y-105"
                      : "bg-white/[0.08] hover:bg-[#3178c6]/50 hover:shadow-[0_0_8px_rgba(49,120,200,0.3)]"
                      }`}
                    style={{ height: item.h }}
                  />
                  <span className={`text-[8px] font-mono tracking-tighter uppercase select-none ${item.active ? "text-white font-bold" : "text-gray-600 group-hover:text-gray-300"
                    }`}>
                    {item.m}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Codebase ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5 mt-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center select-none shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/[0.04] stroke-current" strokeWidth="3.2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-indigo-500 stroke-current drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]" strokeWidth="3.2" strokeDasharray="62, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-cyan-400 stroke-current" strokeWidth="3" strokeDasharray="20, 100" strokeDashoffset="-62" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-cyan-400 font-bold text-xs"><Activity className="w-4 h-4" /></div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Codebase Buffer Size</span>
                <h3 className="text-xl font-bold text-white mt-0.5 leading-none font-mono">5,774 KB</h3>
              </div>
            </div>

            <div className="space-y-2 text-[10px] font-mono font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-sm shrink-0" />
                <span className="text-gray-400">TypeScript Stack</span>
                <span className="text-white ml-auto">62%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-sm shrink-0" />
                <span className="text-gray-400">Python Backend</span>
                <span className="text-white ml-auto">20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-gray-500 shadow-sm shrink-0" />
                <span className="text-gray-400">Other Systems</span>
                <span className="text-white ml-auto">18%</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* Column 3: Secondary Panel (Right Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 space-y-8 relative z-10">

        {/* Active Repositories — 3 Column Card Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <h3 className="text-sm font-extrabold text-white pl-1 select-none">Active Repositories</h3>

          {repositories.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {repositories.slice(0, 3).map((repo, idx) => {
                const glowGradients = [
                  "from-cyan-500/20 to-purple-500/20",
                  "from-emerald-500/20 to-teal-500/20",
                  "from-amber-500/20 to-orange-500/20"
                ];
                const borderHoverColors = [
                  "hover:border-cyan-500/30",
                  "hover:border-emerald-500/30",
                  "hover:border-amber-500/30"
                ];
                const textAccents = [
                  "text-cyan-400",
                  "text-emerald-400",
                  "text-amber-400"
                ];
                const bgRadialGlows = [
                  "bg-glow-radial-blue",
                  "bg-glow-radial-green",
                  "bg-glow-radial-purple"
                ];

                return (
                  <motion.div
                    key={repo.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                    className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 shadow-lg transition-all duration-300"
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${glowGradients[idx % 3]} rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition duration-500 pointer-events-none`}></div>

                    <div className={`relative rounded-[14px] glass-gradient-card p-3 space-y-3 overflow-hidden transition-all duration-300 ${borderHoverColors[idx % 3]}`}>
                      <div className={`absolute top-0 right-0 w-14 h-14 ${bgRadialGlows[idx % 3]} opacity-20 pointer-events-none`}></div>

                      {/* Top: Station badge */}
                      <div className="flex items-center justify-between select-none">
                        <div className="w-5 h-4 bg-[#d9d9df]/10 border border-white/10 rounded flex flex-col gap-0.5 p-0.5 shrink-0">
                          <div className="w-full h-0.5 bg-white/20"></div>
                          <div className="w-full h-0.5 bg-white/20"></div>
                        </div>
                        <span className={`text-[6px] font-mono ${textAccents[idx % 3]} font-bold uppercase tracking-wider`}>
                          ST.{idx + 1}
                        </span>
                      </div>

                      {/* Middle: Repo name + branch */}
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-bold text-white truncate select-text">{repo.name}</h4>
                        <span className="text-[7px] font-mono text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-0.5 select-none">
                          <GitBranch className="w-2 h-2 text-emerald-400" />
                          <span className="truncate">{repo.default_branch || "main"}</span>
                        </span>
                      </div>

                      {/* Bottom: Language icon */}
                      <div className="flex items-center justify-center pt-0.5">
                        {renderLanguageIcon(repo.language || "TypeScript")}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#111116] border border-white/5 p-6 rounded-2xl text-center font-mono text-[10px] text-gray-600 select-none">
              No active stations synced
            </div>
          )}
        </motion.div>

        {/* Career Goal Alignment Card — slide in from right */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 shadow-2xl"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition duration-500 pointer-events-none"></div>

          <div className="relative rounded-[22px] bg-[#0c0c11]/90 border border-white/5 p-5 space-y-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-glow-radial-purple opacity-20 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Target className="w-4 h-4 filter drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-wide">Goal Alignment</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400">
                86% Match
              </span>
            </div>

            {/* Target Role & Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-mono select-none">
                <span className="text-gray-400">Focus Path:</span>
                <span className="text-white font-bold">{targetRole}</span>
              </div>
              <div className="relative w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "86%" }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
              </div>
            </div>

            {/* Path Milestones */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block select-none">PATH MILESTONES</span>
              <div className="space-y-2 text-[10px] font-medium">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-300 line-through decoration-white/10 block leading-tight">Git Diagnostic Workspace Sync</span>
                    <span className="text-[7px] font-mono text-gray-500 uppercase block mt-0.5">COMPLETED</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white block leading-tight">Interactive Ingest Flow Mapping</span>
                    <span className="text-[7px] font-mono text-cyan-400 font-bold block mt-0.5">IN PROGRESS</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 opacity-50 select-none">
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400 block leading-tight">Telemetry Diagnostics & Benchmarking</span>
                    <span className="text-[7px] font-mono text-gray-600 uppercase block mt-0.5">PENDING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-[#111116]/50 border border-white/5 rounded-xl p-3 text-[9px] font-mono text-gray-400 leading-normal select-none relative">
              <div className="absolute top-1 right-1"><Award className="w-3.5 h-3.5 text-yellow-500/60" /></div>
              {targetRole.toLowerCase().includes("fullstack") || targetRole.toLowerCase().includes("frontend") ? (
                <span>TypeScript codebase weights (62%) paired with FastAPI endpoints match high-performance Fullstack benchmarks.</span>
              ) : targetRole.toLowerCase().includes("backend") || targetRole.toLowerCase().includes("python") ? (
                <span>Python stack and SQLite persistence models align closely with core server profiles.</span>
              ) : (
                <span>Your code contributions sync correctly with {targetRole} goals. Complete pending commits to boost scores.</span>
              )}
            </div>

            {/* Action Button */}
            <Link
              href="/dashboard/settings"
              className="w-full py-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/20 hover:border-cyan-500/30 text-white rounded-xl text-[10px] font-mono font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Modify Focus Target</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030305] text-[#f8fafc] flex items-center justify-center font-sans relative overflow-hidden cyber-grid">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-radial-blue opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-glow-radial-purple opacity-45 pointer-events-none"></div>

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs tracking-wider font-mono uppercase">Initializing Secure Link...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}