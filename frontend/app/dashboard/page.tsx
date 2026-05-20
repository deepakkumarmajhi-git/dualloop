"use client";

import {
  fetchUserRepositories,
  fetchLanguageAnalytics,
  fetchDeveloperDNA,
  updateTargetRole,
  fetchAIMentorship
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

  // Tab Control state: "dna" | "repos"
  const [activeTab, setActiveTab] = useState<"dna" | "repos">("dna");

  // Behavior Engine & Telemetry states (LOOP 1 / LOOP 2 / STEP 5)
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [dnaProfile, setDnaProfile] = useState<any>(null);
  const [mentorship, setMentorship] = useState("");
  const [mentorshipLoading, setMentorshipLoading] = useState(false);
  const [goalUpdating, setGoalUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let token = searchParams.get("token") || "";

        if (token) {
          // Save session token in the safe tab boundary storage
          sessionStorage.setItem("dualloop_session_token", token);
          
          // Sanitize the URL immediately to hide token credential traces
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else {
          // If no token in URL, lookup from active session storage
          token = sessionStorage.getItem("dualloop_session_token") || "";
        }

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
        }

        // Fetch behavioral genome telemetry (LOOP 1 / LOOP 2)
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

      } catch (err) {
        console.error("Dashboard loading failed:", err);
        setError("Unable to synchronize your repository workspace. Please try logging in again.");
      } finally {
        setLoading(false);
        setMentorshipLoading(false);
      }
    }
    load();
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
        
        // Instant update of mentoring advice
        setMentorshipLoading(true);
        const adviceData = await fetchAIMentorship(token);
        if (adviceData && !adviceData.detail) {
          setMentorship(adviceData.advice || "");
        }
      }
    } catch (err) {
      console.error("Failed to update target role:", err);
    } finally {
      setGoalUpdating(false);
      setMentorshipLoading(false);
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
    
    // Scale DNA metrics (max 100) down to max 95px SVG offset
    const val0 = ((dna.ui_ux_expression || 20) / 100) * 95;
    const val1 = ((dna.logic_algorithms || 20) / 100) * 95;
    const val2 = ((dna.data_integrity || 20) / 100) * 95;
    const val3 = ((dna.devops_config || 20) / 100) * 95;
    const val4 = ((dna.velocity_endurance || 20) / 100) * 95;

    // Computed polar angles for the 5-axis Radar Grid
    const p0 = { x: center, y: center - val0 };
    const p1 = { x: center + val1 * Math.cos(-18 * Math.PI / 180), y: center + val1 * Math.sin(-18 * Math.PI / 180) };
    const p2 = { x: center + val2 * Math.cos(54 * Math.PI / 180), y: center + val2 * Math.sin(54 * Math.PI / 180) };
    const p3 = { x: center + val3 * Math.cos(126 * Math.PI / 180), y: center + val3 * Math.sin(126 * Math.PI / 180) };
    const p4 = { x: center + val4 * Math.cos(198 * Math.PI / 180), y: center + val4 * Math.sin(198 * Math.PI / 180) };

    return `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
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

  // Circular progress calculations for the Alignment gauge
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
      {/* Dynamic Futuristic Mesh Gradients & Subtle Grid */}
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
                  Active Station v0.1
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded">
                  {username ? `@${username}` : "Authenticated"}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2.5 bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent">
                DualLoop Workspace
              </h1>
              <p className="text-gray-400 text-xs mt-1.5">
                Observed Action vs Career Intention alignment metrics & mentorship telemetry.
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-semibold border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)]"
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
        <div className="flex border-b border-white/5 mb-8 gap-6">
          <button 
            onClick={() => setActiveTab("dna")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative ${activeTab === "dna" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "dna" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            🧬 Interactive Telemetry DNA
          </button>
          <button 
            onClick={() => setActiveTab("repos")}
            className={`pb-4 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 relative ${activeTab === "repos" ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {activeTab === "repos" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            )}
            📁 Synced Repositories ({repositories.length})
          </button>
        </div>

        {activeTab === "dna" ? (
          /* Tab 1: DNA Analytics & AI Mentorship */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: DNA Radar & Settings */}
            <div className="lg:col-span-1 space-y-8">
              
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

                  {/* Circular Radial Gauge */}
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

              {/* Developer DNA Radar Chart Card */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-cyan-500 rounded shadow-[0_0_6px_rgba(6,182,212,0.5)]"></span>
                  Observed Developer DNA
                </h3>

                {dnaProfile && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 text-[9px] font-mono font-bold tracking-wide uppercase bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-md">
                      👑 CLASS: {dnaProfile.developer_role_title}
                    </span>
                  </div>
                )}

                {/* Glowing SVG Radar Chart */}
                <div className="flex justify-center my-6">
                  <svg width="240" height="240" viewBox="0 0 300 300" className="relative z-10">
                    {/* Grid Rings */}
                    {[20, 40, 60, 80, 100].map((val) => {
                      const r = (val / 100) * 95;
                      const center = 150;
                      const p0 = { x: center, y: center - r };
                      const p1 = { x: center + r * Math.cos(-18 * Math.PI / 180), y: center + r * Math.sin(-18 * Math.PI / 180) };
                      const p2 = { x: center + r * Math.cos(54 * Math.PI / 180), y: center + r * Math.sin(54 * Math.PI / 180) };
                      const p3 = { x: center + r * Math.cos(126 * Math.PI / 180), y: center + r * Math.sin(126 * Math.PI / 180) };
                      const p4 = { x: center + r * Math.cos(198 * Math.PI / 180), y: center + r * Math.sin(198 * Math.PI / 180) };
                      return (
                        <polygon 
                          key={val}
                          points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                          fill="none"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Dynamic Filled Developer DNA Polygon */}
                    <polygon 
                      points={getRadarPoints(dnaProfile)}
                      fill="rgba(6, 182, 212, 0.15)"
                      stroke="rgba(6, 182, 212, 0.8)"
                      strokeWidth="2.5"
                      className="transition-all duration-1000 ease-out"
                    />

                    {/* Axis Labels */}
                    <text x="150" y="35" textAnchor="middle" fill="#8892b0" fontSize="9" fontFamily="monospace" fontWeight="bold">UI/UX EXPRESSION</text>
                    <text x="250" y="130" textAnchor="start" fill="#8892b0" fontSize="9" fontFamily="monospace" fontWeight="bold">ALGORITHMS</text>
                    <text x="210" y="260" textAnchor="start" fill="#8892b0" fontSize="9" fontFamily="monospace" fontWeight="bold">DATA INTEGRITY</text>
                    <text x="90" y="260" textAnchor="end" fill="#8892b0" fontSize="9" fontFamily="monospace" fontWeight="bold">DEVOPS</text>
                    <text x="50" y="130" textAnchor="end" fill="#8892b0" fontSize="9" fontFamily="monospace" fontWeight="bold">VELOCITY</text>
                  </svg>
                </div>

                {dnaProfile && (
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-gray-400 mt-4 border-t border-white/5 pt-4">
                    <div className="flex justify-between"><span>UI/UX:</span> <span className="text-cyan-400 font-bold">{dnaProfile.ui_ux_expression}%</span></div>
                    <div className="flex justify-between"><span>Logic:</span> <span className="text-cyan-400 font-bold">{dnaProfile.logic_algorithms}%</span></div>
                    <div className="flex justify-between"><span>Data:</span> <span className="text-cyan-400 font-bold">{dnaProfile.data_integrity}%</span></div>
                    <div className="flex justify-between"><span>DevOps:</span> <span className="text-cyan-400 font-bold">{dnaProfile.devops_config}%</span></div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: AI Mentorship terminal console */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Terminal Card */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col min-h-[490px]">
                {/* Header block resembling terminal tab */}
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

                {/* Mentorship Console Body */}
                <div className="p-6 overflow-y-auto flex-1 max-h-[520px] custom-scrollbar">
                  
                  {/* Dynamic Status Traces */}
                  <div className="bg-[#050508]/80 rounded-xl px-4 py-3 mb-6 font-mono text-[10px] text-gray-500 border border-white/5">
                    <span className="text-cyan-500/80">&gt; dualloop --analyze --user={username || "developer"}</span>
                    <div className="text-emerald-500/80">[OK] Synchronized {repositories.length} public and private git branches.</div>
                    <div className="text-cyan-500/80">[OK] Deduced Specialization: {dnaProfile?.developer_role_title || "Fullstack"}</div>
                    <div className="text-purple-500/80">[OK] Calculated Career Alignment Score: {alignmentVal}%</div>
                  </div>

                  {mentorshipLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
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
                    <div className="text-center py-20 text-gray-500 text-xs font-mono">
                      No active behavioral snapshots found. Run sync to compute insights.
                    </div>
                  )}
                </div>
              </div>

              {/* Language Distribution Overview inside DNA tab */}
              <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <h3 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-cyan-500 rounded shadow-[0_0_6px_rgba(6,182,212,0.5)]"></span>
                  Project Language footprint
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(analytics).length === 0 ? (
                    <div className="col-span-2 py-4 text-center text-gray-500 text-xs font-mono">
                      No programming languages synced. Add source code files to populate analytics.
                    </div>
                  ) : (
                    Object.entries(analytics).map(([language, percentage], idx) => {
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
                          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                            <span className="text-gray-300 font-mono tracking-wide">{language}</span>
                            <span className={`${style.text} font-bold`}>{String(percentage)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
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
              </div>

            </div>

          </div>
        ) : (
          /* Tab 2: Synced Repositories Diagnostics list */
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
                  Verify that your GitHub account has accessible public or private repositories and try re-syncing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <div 
                    key={repo.id} 
                    className="group relative bg-[#0b0b0e]/95 border border-white/5 hover:border-cyan-500/30 hover:shadow-cyan-500/5 hover:shadow-2xl rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Glowing effect inside card on hover */}
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