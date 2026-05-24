"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Infinity, 
  Target, 
  Brain, 
  Lock, 
  Play, 
  ArrowRight, 
  ChevronRight, 
  Terminal, 
  Search, 
  BarChart3, 
  HardDrive, 
  Sparkles, 
  Code2, 
  Activity
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
    <div className="relative min-h-screen bg-[#030305] text-[#f8fafc] overflow-x-hidden font-sans cyber-grid-coarse pb-12 selection:bg-cyan-500/30 selection:text-white">
      
      {/* Dynamic Glow Blobs */}
      <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-glow-radial-blue opacity-40 pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="absolute top-[300px] right-1/4 w-[700px] h-[700px] bg-glow-radial-purple opacity-30 pointer-events-none z-0"></div>
      <div className="absolute bottom-[200px] left-1/3 w-[600px] h-[600px] bg-glow-radial-blue opacity-25 pointer-events-none z-0"></div>

      {/* Grid overlay for technical vibe */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

      {/* Floating Navigation Capsule */}
      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-50">
        <nav className="glass-panel border border-white/5 rounded-full px-6 py-3.5 backdrop-blur-xl flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Infinity className="w-5 h-5 text-white" />
            </div>
            <span className="text-md font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              DualLoop
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-gray-400 select-none">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a href="#home" className="text-white border-b-2 border-cyan-400 pb-0.5 font-bold transition-all">Home</a>
            <a href="#demo" className="hover:text-white transition-colors duration-200">Workflow</a>
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#security" className="hover:text-white transition-colors duration-200">Security</a>
            <a href="#footer" className="hover:text-white transition-colors duration-200">Contact</a>
          </div>

          {/* Call-to-action button */}
          <div className="flex items-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="relative group px-5 py-2 text-xs font-semibold rounded-full overflow-hidden bg-[#0d0d14] border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Container Grid */}
      <main id="home" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 lg:pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content Section */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* High-tech pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-950/40 via-cyan-950/20 to-transparent border border-indigo-500/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-300 uppercase">
                AI Companion for Developers
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] text-white">
              Dual Loop. <br />
              Real Progress. <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Aligned
              </span> with You.
            </h1>

            <p className="text-sm sm:text-[15px] text-gray-400 max-w-lg leading-relaxed select-text font-normal">
              DualLoop is your AI companion that analyzes your GitHub interactions and project workflow to help you focus, adapt, and ship — consistently.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs tracking-wider transition-all duration-300 shadow-[0_4px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.45)] flex items-center justify-center gap-2 active:scale-98"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <span className="uppercase">{isLoggedIn ? "Launch Active Console" : "Connect with GitHub"}</span>
              </Link>
              <a
                href="#demo"
                className="px-6 py-3.5 bg-[#0b0b10]/90 text-gray-300 font-semibold rounded-xl text-xs tracking-wider transition-all duration-300 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 active:scale-98"
              >
                <Play className="w-3 h-3 text-cyan-400" />
                <span>Learn How It Works</span>
              </a>
            </div>
          </div>

          {/* Hero Right Visual Overlapping Loop Component */}
          <div className="lg:col-span-6 flex items-center justify-center select-none py-12 lg:py-0">
            <div className="relative w-[340px] sm:w-[480px] h-[340px] flex items-center justify-center animate-float">
              
              {/* Inner Loop Circle (Left) */}
              <div className="absolute left-0 w-[220px] sm:w-[280px] h-[220px] sm:h-[280px] rounded-full border border-cyan-500/20 bg-cyan-950/[0.03] backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] group/inner">
                <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-95 pointer-events-none animate-pulse-ring-cyan"></div>
                
                {/* Visual Icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 mb-2 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] group-hover/inner:scale-110 transition duration-300">
                  <Code2 className="w-4.5 h-4.5" />
                </div>
                
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">Inner Loop</span>
                
                {/* List items */}
                <div className="mt-3.5 space-y-1 text-center">
                  <div className="text-xs font-semibold text-white/90 group-hover/inner:text-white transition duration-200">Focus</div>
                  <div className="text-xs font-semibold text-white/70 group-hover/inner:text-white transition duration-200">Build</div>
                  <div className="text-xs font-semibold text-white/50 group-hover/inner:text-white transition duration-200">Ship</div>
                </div>
              </div>

              {/* Outer Loop Circle (Right) */}
              <div className="absolute right-0 w-[220px] sm:w-[280px] h-[220px] sm:h-[280px] rounded-full border border-purple-500/20 bg-purple-950/[0.03] backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-purple-400/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group/outer">
                <div className="absolute inset-0 rounded-full border border-purple-500/10 scale-95 pointer-events-none animate-pulse-ring-purple"></div>
                
                {/* Visual Icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/20 text-purple-400 mb-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover/outer:scale-110 transition duration-300">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>

                <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold">Outer Loop</span>

                {/* List items */}
                <div className="mt-3.5 space-y-1 text-center">
                  <div className="text-xs font-semibold text-white/90 group-hover/outer:text-white transition duration-200">Review</div>
                  <div className="text-xs font-semibold text-white/70 group-hover/outer:text-white transition duration-200">Learn</div>
                  <div className="text-xs font-semibold text-white/50 group-hover/outer:text-white transition duration-200">Improve</div>
                </div>
              </div>

              {/* Intersection Overlap Central Badge */}
              <div className="absolute z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#030305]/95 border border-white/10 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,0.85)] pointer-events-none glow-white-filter">
                <Infinity className="w-5 h-5 text-indigo-400" />
              </div>

              {/* Glowing Ambient Rings */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-purple-500/5 blur-3xl pointer-events-none rounded-full"></div>
            </div>
          </div>

        </div>
      </main>

      {/* Grid of 4 bottom premium cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Goal-Oriented */}
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 hover:from-cyan-500/20 hover:to-indigo-500/20 shadow-lg transition-all duration-300 cursor-pointer">
            <div className="relative rounded-[15px] bg-[#0c0c12]/90 border border-white/5 p-6 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-all duration-300">
                <Target className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5">
                  <span>Goal-Oriented</span>
                </h4>
                <p className="text-[12px] text-gray-400 leading-normal">
                  Define what matters. We help you stay aligned and make real progress.
                </p>
              </div>
              <div className="flex items-center text-[10px] font-mono text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 select-none">
                <span>Configure target</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: GitHub Native */}
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 hover:from-indigo-500/20 hover:to-purple-500/20 shadow-lg transition-all duration-300 cursor-pointer">
            <div className="relative rounded-[15px] bg-[#0c0c12]/90 border border-white/5 p-6 space-y-4 hover:border-indigo-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-all duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors duration-200">
                  GitHub Native
                </h4>
                <p className="text-[12px] text-gray-400 leading-normal">
                  Seamlessly integrates with your repos, issues, PRs, and activity.
                </p>
              </div>
              <div className="flex items-center text-[10px] font-mono text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 select-none">
                <span>View integrations</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: AI-Powered Insights */}
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 hover:from-purple-500/20 hover:to-pink-500/20 shadow-lg transition-all duration-300 cursor-pointer">
            <div className="relative rounded-[15px] bg-[#0c0c12]/90 border border-white/5 p-6 space-y-4 hover:border-purple-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-all duration-300">
                <Brain className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-purple-300 transition-colors duration-200">
                  AI-Powered Insights
                </h4>
                <p className="text-[12px] text-gray-400 leading-normal">
                  Understands your context and suggests what to do next — uniquely for you.
                </p>
              </div>
              <div className="flex items-center text-[10px] font-mono text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 select-none">
                <span>Read documentation</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Privacy First */}
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/5 to-white/0 hover:from-cyan-500/20 hover:to-emerald-500/20 shadow-lg transition-all duration-300 cursor-pointer">
            <div className="relative rounded-[15px] bg-[#0c0c12]/90 border border-white/5 p-6 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-all duration-300">
                <Lock className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
                  Privacy First
                </h4>
                <p className="text-[12px] text-gray-400 leading-normal">
                  Your code and data stay private and always under your control.
                </p>
              </div>
              <div className="flex items-center text-[10px] font-mono text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 select-none">
                <span>Security matrix</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Partners Brand Logos Row */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-8 select-none">
        <div className="text-center mb-6">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Trusted by developers building the future
          </p>
        </div>
        
        {/* Logos Flexbox Container */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 hover:opacity-45 transition-opacity duration-300">
          
          {/* Vercel */}
          <div className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs">
            <svg className="w-4.5 h-4 text-white fill-current" viewBox="0 0 76 65" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5273 0L75.0546 65H0L37.5273 0Z" />
            </svg>
            <span>Vercel</span>
          </div>

          {/* Linear */}
          <div className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs">
            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>Linear</span>
          </div>

          {/* Supabase */}
          <div className="flex items-center gap-1.5 text-white font-semibold tracking-wide text-xs">
            <svg className="w-4 h-4.5 text-emerald-400 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.397 11.233H13.68l4.475-9.673a.8.8 0 00-1.258-.87L3.064 12.016a.8.8 0 00.569 1.341h7.717l-4.475 9.673a.8.8 0 001.258.87l13.833-11.326a.8.8 0 00-.569-1.341z" />
            </svg>
            <span>supabase</span>
          </div>

          {/* Docker */}
          <div className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs">
            <svg className="w-5 h-4.5 text-cyan-400 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.983 11.078h2.119c.102 0 .186-.083.186-.185V8.774a.186.186 0 00-.186-.186h-2.119c-.103 0-.186.083-.186.186v2.119c0 .102.083.185.186.185m-2.954 0h2.118c.103 0 .187-.083.187-.185V8.774a.187.187 0 00-.187-.186h-2.118c-.103 0-.186.083-.186.186v2.119c0 .102.083.185.186.185m-2.935 0h2.119c.102 0 .185-.083.185-.185V8.774a.185.185 0 00-.185-.186H8.094c-.102 0-.185.083-.185.186v2.119c0 .102.083.185.185.185m-2.936 0h2.12c.102 0 .185-.083.185-.185V8.774a.185.185 0 00-.185-.186h-2.12c-.102 0-.185.083-.185.186v2.119c0 .102.083.185.185.185m-2.955 0h2.119c.102 0 .186-.083.186-.185V8.774a.186.186 0 00-.186-.186H2.203c-.102 0-.186.083-.186.186v2.119c0 .102.083.185.186.185m2.955-2.937h2.119c.102 0 .185-.083.185-.185V5.838a.185.185 0 00-.185-.186H5.158c-.102 0-.185.083-.185.186v2.119c0 .102.083.185.185.185m2.936 0h2.119c.102 0 .185-.083.185-.185V5.838a.185.185 0 00-.185-.186H8.094c-.102 0-.185.083-.185.186v2.119c0 .102.083.185.185.185m2.954 0h2.119c.103 0 .186-.083.186-.185V5.838a.186.186 0 00-.186-.186h-2.119c-.103 0-.186.083-.186.186v2.119c0 .102.083.185.186.185m-2.954-2.918h2.119c.102 0 .185-.083.185-.185V2.9a.185.185 0 00-.185-.185H8.094c-.102 0-.185.082-.185.185v2.119c0 .102.083.185.185.185m-5.69 8.793c0 .102.083.185.185.185h2.12c.102 0 .185-.083.185-.185v-2.12a.185.185 0 00-.185-.185h-2.12a.185.185 0 00-.185.185v2.12zm17.082-6.986c-.472-.51-1.515-.967-2.69-.967h-.821v3.567h.82c1.176 0 2.219-.456 2.69-.967.438-.474.658-1.077.658-1.633 0-.556-.22-1.159-.657-1.633M23.824 8.86c-.56 2.054-2.017 4.335-5.306 4.335h-3.41c-.408 0-.742.333-.742.741v.324c0 .272-.11.518-.287.7-.181.18-.427.29-.7.29h-.148c-.694 0-1.259-.565-1.259-1.26v-.37c0-.82-.667-1.488-1.487-1.488H8.56c-.23 0-.46.037-.68.11a3.7 3.7 0 01-.676.155c-.947.073-1.85-.29-2.522-.998C3.996 10.74 3.655 9.774 3.714 8.8c.12-1.996.953-3.6 2.453-4.73l.118-.088.163-.047c.5-.148.97-.24 1.405-.282V.833h.741c.408 0 .742.333.742.74v.853c0 .083.067.15.15.15h1.22c.083 0 .15-.067.15-.15v-.853c0-.407.333-.74.741-.74h.742v1.743c0 .083.068.15.15.15h1.221c.082 0 .15-.067.15-.15V.833h.742c.407 0 .741.333.741.74v1.547c0 .102.083.185.185.185h2.12c.102 0 .185-.083.185-.185V1.573h.742c.407 0 .741.333.741.74v2.545c0 .356.24.673.585.766a5.772 5.772 0 013.978 4.236" />
            </svg>
            <span>docker</span>
          </div>

          {/* Tailwind CSS */}
          <div className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs">
            <svg className="w-5 h-3 text-cyan-400 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19 12.001 19c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
            </svg>
            <span>Tailwind CSS</span>
          </div>

        </div>
      </section>

      {/* Interactive Live Sandbox Demo Console Section (Elegantly Preserved) */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center mb-10 select-none">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Live Sandbox Diagnostics</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
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
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all duration-300 border ${
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
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all duration-300 border ${
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
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all duration-300 border ${
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
          
          <div className="relative rounded-[22px] bg-[#0c0c11]/95 border border-white/5 overflow-hidden">
            
            {/* Terminal Window Header */}
            <div className="px-5 py-3.5 bg-[#09090d] border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">dualloop-station-diagnostic-console // telemetry.map</span>
              <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </div>

            {/* Injected Content Window */}
            <div className="p-6 md:p-8 min-h-[280px] flex flex-col justify-between font-sans">
              
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
                    <div className="bg-[#111117]/80 border border-white/5 p-3.5 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-cyan-400">1.2k</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Stars</div>
                    </div>
                    <div className="bg-[#111117]/80 border border-white/5 p-3.5 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-purple-400">340</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Forks</div>
                    </div>
                    <div className="bg-[#111117]/80 border border-white/5 p-3.5 rounded-xl text-center">
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

                  <div className="space-y-3 select-none">
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5 p-0.5 gap-[2px]">
                      <div className="h-full rounded-l-full bg-cyan-400" style={{ width: "62%" }} title="TypeScript: 62%" />
                      <div className="h-full bg-purple-500" style={{ width: "20%" }} title="Python: 20%" />
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
                        Python <strong className="text-white">20%</strong>
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

      {/* Feature Highlights specification (re-styled) */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/5 scroll-mt-16">
        <div className="text-center mb-16 select-none">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
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
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Multi-tenant Security</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We leverage safe JWT decoding locks so that all metrics remain strictly restricted to the authenticated developer owner.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] mb-6 group-hover:scale-110 transition duration-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Advanced Diagnostics</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculate developer language ratios instantly and monitor branch activities, sizes, and pull requests in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] mb-6 group-hover:scale-110 transition duration-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">SQLite Local Standby</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Equipped with a standalone, fallback local database configuration. Enjoy full persistence with zero configurations needed.
            </p>
          </div>

        </div>
      </section>

      {/* Modern, Beautiful Footer */}
      <footer id="footer" className="relative z-10 bg-[#060609] border-t border-white/5 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Logo and Tagline */}
          <div className="lg:col-span-2 space-y-4 text-left">
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
          <div className="space-y-4 select-none text-left">
            <h5 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">SITEMAP</h5>
            <ul className="space-y-2 text-xs text-gray-500 font-mono">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Workspace Features</a></li>
              <li><a href="#demo" className="hover:text-cyan-400 transition-colors">Sandbox Demo</a></li>
              <li><Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-cyan-400 transition-colors">Console Dashboard</Link></li>
            </ul>
          </div>

          {/* Email Subscription */}
          <div className="space-y-4 text-left">
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
                className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
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