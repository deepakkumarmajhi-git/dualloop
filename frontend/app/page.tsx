"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Infinity, 
  Search, 
  BarChart3, 
  Terminal, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  ArrowRight, 
  ArrowUpRight, 
  Sparkles, 
  Lock
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "languages" | "diagnostics">("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("dualloop_session_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030305] text-[#f8fafc] overflow-x-hidden font-sans cyber-grid-coarse">
      
      {/* Decorative Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-glow-radial-blue opacity-50 z-0"></div>
      <div className="absolute top-[400px] right-1/4 w-[700px] h-[700px] bg-glow-radial-purple opacity-40 z-0"></div>
      <div className="absolute bottom-[200px] left-1/3 w-[600px] h-[600px] bg-glow-radial-blue opacity-30 z-0"></div>

      {/* Grid overlay for technical vibe */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0"></div>

      {/* Header / Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            {/* Elegant Infinity Logo */}
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Infinity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              DualLoop
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider text-gray-400 select-none">
            <a href="#features" className="hover:text-cyan-400 transition-colors">FEATURES</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">DEMO CONSOLE</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">SECURITY</a>
            <a href="#tech" className="hover:text-cyan-400 transition-colors">TECH STACK</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="relative group px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl overflow-hidden glass-panel border border-cyan-500/30 text-cyan-400 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 flex items-center gap-2"
            >
              {isLoggedIn ? (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Active Console
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Launch Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Active badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full mb-8 shadow-inner animate-pulse-slow select-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
            Continuous Fullstack Telemetry Dashboard
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none bg-gradient-to-b from-white via-[#e2e8f0] to-[#64748b] bg-clip-text text-transparent select-text">
          The Fastest Way to Build <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Tomorrow's Developer Metrics.</span>
        </h1>

        <p className="mt-6 text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed select-text">
          DualLoop connects securely to GitHub using modern OAuth 2.0 protocols to track, synchronize, and analyze repository statistics, commit pipelines, and isolated code language matrices inside a dark cybernetic station.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-xl text-sm transition-all duration-200 hover:bg-[#e6edf3] hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2.5 active:scale-98"
          >
            {/* Highly visible aesthetic GitHub Logo */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>{isLoggedIn ? "Access Dashboard" : "Sign In with GitHub"}</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0b0b0f]/80 text-gray-300 font-semibold rounded-xl text-sm transition-all duration-200 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 active:scale-98"
          >
            Explore Diagnostics
          </a>
        </div>
      </section>

      {/* Interactive Telemetry Mockup Console Section */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-6 py-12 scroll-mt-20">
        <div className="text-center mb-10 select-none">
          <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Live Sandbox Diagnostics</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
            Explore Workspace Ingest Maps
          </h2>
          <p className="text-gray-400 text-xs mt-2">
            Click the telemetry feeds below to preview isolated data compiling in real-time.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center gap-2 mb-6 select-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-300 border ${
              activeTab === "overview"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>OVERVIEW</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("languages")}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-300 border ${
              activeTab === "languages"
                ? "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>TECH DISTRIBUTION</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-300 border ${
              activeTab === "diagnostics"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>LOGS TRACE</span>
            </span>
          </button>
        </div>

        {/* Glassmorphic Mockup Container */}
        <div className="relative group rounded-3xl p-1 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 shadow-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl opacity-10 blur-xl group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
          
          <div className="relative rounded-[22px] bg-[#0c0c11] border border-white/5 overflow-hidden">
            {/* Terminal Window Header */}
            <div className="px-5 py-3.5 bg-[#09090d] border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">dualloop-station-diagnostic-console // telemetry.map</span>
              {/* Ultra-visible Aesthetic GitHub Logo */}
              <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </div>

            {/* Injected Content Window */}
            <div className="p-8 min-h-[280px] flex flex-col justify-between font-sans">
              
              {activeTab === "overview" && (
                <div className="animate-fade-in space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded select-none">
                        RECONSTRUCTED SYNCED STATION
                      </span>
                      <h3 className="text-xl font-bold mt-2 select-text">next-turbopack-workspace</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-md select-text">
                        Continuous developer workspace synchronizer, isolated metrics tracking, and persistent telemetry operations.
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1 select-none">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>4.82 MB</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 select-none">
                    <div className="bg-[#111117] border border-white/5 p-3.5 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-cyan-400">1.2k</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Stars</div>
                    </div>
                    <div className="bg-[#111117] border border-white/5 p-3.5 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-purple-400">340</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Forks</div>
                    </div>
                    <div className="bg-[#111117] border border-white/5 p-3.5 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-amber-400">14</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Open PRs</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-mono select-text">
                    <div className="flex justify-between text-gray-500 mb-1 select-none">
                      <span>LATEST COMMITS SYSTEM</span>
                      <span className="text-cyan-400 font-bold">sha-a4fe261b</span>
                    </div>
                    <span className="text-gray-200 font-semibold">feat: compile production bundle safely with multi-tenant locks</span>
                  </div>
                </div>
              )}

              {activeTab === "languages" && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded select-none">
                      LANGUAGE DOCK ENGINE
                    </span>
                    <h3 className="text-xl font-bold mt-2">Workspace Composition</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Isolated algorithms index accurate developer work allocations securely.
                    </p>
                  </div>

                  {/* Multi-segmented bar */}
                  <div className="space-y-3 select-none">
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5 p-0.5 gap-[2px]">
                      <div className="h-full rounded-l-full bg-cyan-400" style={{ width: "62%" }} title="TypeScript: 62%" />
                      <div className="h-full bg-purple-500" style={{ width: "20%" }} title="Rust: 20%" />
                      <div className="h-full bg-amber-400" style={{ width: "10%" }} title="CSS: 10%" />
                      <div className="h-full rounded-r-full bg-gray-500" style={{ width: "8%" }} title="HTML: 8%" />
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        TypeScript <strong className="text-white">62%</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Rust <strong className="text-white">20%</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        CSS <strong className="text-white">10%</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-500" />
                        HTML <strong className="text-white">8%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "diagnostics" && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-amber-950/40 border border-amber-500/30 text-amber-400 rounded select-none">
                      STATION TELEMETRY ENGINE
                    </span>
                    <h3 className="text-xl font-bold mt-2 select-text">Active Core Diagnostic Logs</h3>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-4 rounded-xl font-mono text-[10px] text-gray-400 space-y-1.5 select-text leading-relaxed">
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">[02:30:14]</span> 
                      <span>Connecting telemetry to GitHub OAuth...</span> 
                      <span className="text-emerald-400 font-bold ml-auto">[OK]</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">[02:30:15]</span> 
                      <span>Ingesting local database fallback stations...</span> 
                      <span className="text-emerald-400 font-bold ml-auto">[OK]</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">[02:30:16]</span> 
                      <span>Computing language analytics arrays...</span> 
                      <span className="text-emerald-400 font-bold ml-auto">[OK]</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">[02:30:17]</span> 
                      <span>Validating token credentials owner matching user...</span> 
                      <span className="text-purple-400 font-bold ml-auto">[SECURE]</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono select-none">
                <span>Diag Engine: Online</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Integrated Copilot Station</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 scroll-mt-16">
        <div className="text-center mb-16 select-none">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            STATION SPECIFICATIONS
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
            Engineered for Workspace Intelligence
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Every layer is strictly isolated, fast, and secure. Your credentials and synced metrics are never leaked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] mb-6 group-hover:scale-110 transition duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Multi-tenant Security</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We leverage safe JWT decoding locks so that all metrics remain strictly restricted to the authenticated developer owner.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] mb-6 group-hover:scale-110 transition duration-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Advanced Diagnostics</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculate developer language ratios instantly and monitor branch activities, sizes, and pull requests in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] mb-6 group-hover:scale-110 transition duration-300">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">SQLite Local Standby</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Equipped with a standalone, fallback local database configuration. Enjoy full persistence with zero configurations needed.
            </p>
          </div>
        </div>
      </section>

      {/* Modern, Beautiful Footer */}
      <footer className="relative z-10 bg-[#060609] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 select-none">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600">
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">DualLoop</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Empowering developers with secure, high-fidelity developer dashboards, repository analytics, and commit-telemetry logs.
            </p>
            <div className="text-[10px] text-gray-500 font-mono select-none">
              &copy; {new Date().getFullYear()} DualLoop Console. All rights reserved.
            </div>
          </div>

          {/* Site Map Links */}
          <div className="space-y-4 select-none">
            <h5 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">SITEMAP</h5>
            <ul className="space-y-2 text-xs text-gray-500 font-mono">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Workspace Features</a></li>
              <li><a href="#demo" className="hover:text-cyan-400 transition-colors">Sandbox Demo</a></li>
              <li><Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-cyan-400 transition-colors">Console Dashboard</Link></li>
            </ul>
          </div>

          {/* Email Subscription */}
          <div className="space-y-4">
            <h5 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest select-none">STATION BULLETINS</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed select-none">
              Get major telemetry logs and station firmware alerts directly.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter workspace email"
                className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black text-xs font-bold font-mono rounded-xl transition-all duration-200 hover:bg-gray-200 active:scale-95 shrink-0"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </footer>

    </div>
  );
}