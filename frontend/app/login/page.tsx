"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchUserProfile } from "@/lib/api";
import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Lock, Code2, GitBranch, ArrowRight, LogOut, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const token = sessionStorage.getItem("dualloop_session_token") || "";
        const profile = await fetchUserProfile(token || undefined);
        if (profile && !profile.detail) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Session verification check failed:", err);
      }
    };
    checkActiveSession();
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:8000/auth/github/login";
  };

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    sessionStorage.removeItem("dualloop_session_token");
    setIsLoggedIn(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030307] text-[#f8fafc] flex items-center justify-center overflow-hidden font-sans">
      
      {/* Background cyber grid and subtle space atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none z-0"></div>
      
      {/* Dynamic ambient color glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none z-0"></div>
      
      {/* Top Brand Logo - Absolute position */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 select-none group">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-200">
            <InfinityIcon className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-wide text-white">DualLoop</span>
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="relative z-10 max-w-6xl w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Glowing Visual GitHub Orb & Orbitals */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none w-full min-h-[500px] py-10 lg:py-0">
          
          {/* Concentric orbital rings with dashed and solid stylings */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-white/[0.04] border-dashed pointer-events-none"></div>
          <div className="absolute w-[440px] h-[440px] rounded-full border border-white/[0.02] border-dashed pointer-events-none"></div>
          <div className="absolute w-[280px] h-[280px] rounded-full border border-white/[0.05] pointer-events-none"></div>

          {/* Slow Revolving Orbit Wrapper (Orbit 1) */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[360px] h-[360px] pointer-events-none flex items-center justify-center"
          >
            {/* Tech Icon: Code Brackets </ > */}
            <div className="absolute top-8 left-12 w-8 h-8 rounded-lg bg-[#07070c]/90 border border-white/5 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm pointer-events-auto">
              <Code2 className="w-4.5 h-4.5 text-gray-500 hover:text-cyan-400 transition-colors" />
            </div>

            {/* Glowing node node point */}
            <div className="absolute bottom-6 right-16 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          </motion.div>

          {/* Slow Revolving Orbit Wrapper (Orbit 2) */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            className="absolute w-[440px] h-[440px] pointer-events-none flex items-center justify-center"
          >
            {/* Tech Icon: Braces { } */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#07070c]/90 border border-white/5 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm pointer-events-auto font-mono text-xs font-bold text-gray-500 hover:text-purple-400 transition-colors select-none">
              {"{}"}
            </div>

            {/* Tech Icon: Git branch/merge */}
            <div className="absolute bottom-8 left-16 w-8 h-8 rounded-lg bg-[#07070c]/90 border border-white/5 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm pointer-events-auto">
              <GitBranch className="w-4.5 h-4.5 text-gray-500 hover:text-emerald-400 transition-colors" />
            </div>

            {/* Glowing purple node point */}
            <div className="absolute top-12 right-20 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
          </motion.div>

          {/* Stat 1: Top Right */}
          <div className="absolute top-0 right-2 lg:-right-4 text-left p-3.5 bg-[#030307]/50 rounded-xl backdrop-blur-[2px] border border-white/[0.02]">
            <div className="text-xl lg:text-2xl font-black text-white/95 leading-none">98%</div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Developers</div>
            <div className="text-[9px] font-medium text-gray-600">on GitHub</div>
          </div>

          {/* Stat 2: Bottom Left */}
          <div className="absolute bottom-0 left-2 lg:-left-4 text-left p-3.5 bg-[#030307]/50 rounded-xl backdrop-blur-[2px] border border-white/[0.02]">
            <div className="text-xl lg:text-2xl font-black text-white/95 leading-none">50M+</div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Repositories</div>
            <div className="text-[9px] font-medium text-gray-600">Analyzed</div>
          </div>

          {/* Stat 3: Bottom Right */}
          <div className="absolute bottom-0 right-2 lg:-right-4 text-left p-3.5 bg-[#030307]/50 rounded-xl backdrop-blur-[2px] border border-white/[0.02]">
            <div className="text-xl lg:text-2xl font-black text-white/95 leading-none">100K+</div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Projects</div>
            <div className="text-[9px] font-medium text-gray-600">Aligned</div>
          </div>

          {/* Pedestal Platform (Bottom Glowing Disk Elements) */}
          <div className="absolute bottom-[58px] w-[260px] h-[30px] rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/30 to-purple-500/20 blur-[15px] opacity-70 pointer-events-none"></div>
          <div className="absolute bottom-[62px] w-[210px] h-[20px] rounded-full bg-[#030307] border border-cyan-500/35 shadow-[0_0_25px_rgba(6,182,212,0.4)] pointer-events-none"></div>
          <div className="absolute bottom-[66px] w-[170px] h-[10px] rounded-full bg-gradient-to-r from-cyan-400/40 via-purple-600/40 to-cyan-400/40 border-t border-white/10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)] pointer-events-none"></div>

          {/* Glowing central GitHub Sphere */}
          <motion.div 
            className="absolute bottom-[72px] w-[220px] h-[220px] rounded-full border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.25),inset_0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md transition-all duration-500 hover:border-cyan-400/40 hover:shadow-[0_0_50px_rgba(6,182,212,0.35)] animate-float"
          >
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-95 pointer-events-none animate-pulse-ring-cyan"></div>
            
            {/* White Silhouette Octocat GitHub SVG */}
            <svg 
              className="w-24 h-24 text-white fill-current filter drop-shadow-[0_0_14px_rgba(6,182,212,0.55)]" 
              viewBox="0 0 16 16" 
              fill="currentColor" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </motion.div>

        </div>

        {/* Right Column: Premium Credentials Login Card */}
        <div className="lg:col-span-6 flex items-center justify-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[460px] rounded-[32px] p-10 bg-[#07070e]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex flex-col items-center text-center gap-6 overflow-hidden"
          >
            {/* Absolute overlay for glowing gradient card border */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/30 rounded-[32px] pointer-events-none z-0"></div>
            
            {/* Top Logo Container */}
            <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#12121f] to-[#07070c] border border-white/5 shadow-inner">
              <InfinityIcon className="w-7 h-7 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.45)]" />
            </div>

            {/* Form Headers */}
            <div className="relative z-10 space-y-1.5 mt-2">
              <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white leading-tight">
                {isLoggedIn ? "Session Active" : "Welcome to "}
                {!isLoggedIn && (
                  <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    DualLoop
                  </span>
                )}
              </h2>
              <p className="text-xs font-semibold text-gray-500 tracking-wide select-none">
                Your AI companion for developer progress
              </p>
            </div>

            {/* Subtle Divider Line */}
            <div className="relative z-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

            {/* Description Text */}
            <p className="relative z-10 text-xs text-gray-400/90 leading-relaxed font-normal px-4 max-w-[340px]">
              {isLoggedIn 
                ? "Your secure telemetry session is currently live and synchronized with your GitHub workspace."
                : "Sign in with GitHub to connect your repositories, analyze your workflow, and stay aligned with your goals."
              }
            </p>

            {/* Action Buttons Box */}
            <div className="relative z-10 w-full flex flex-col gap-3 mt-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-3.5 bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-gray-200 text-black font-bold rounded-xl text-xs tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Return to Active Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3.5 bg-[#111117] border border-red-500/20 text-red-400 font-bold rounded-xl text-xs tracking-wider transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Terminate Session</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="group relative w-full py-3.5 bg-gradient-to-r from-[#0d0d16]/95 to-[#08080f]/95 hover:from-[#11111d]/90 hover:to-[#0b0b14]/90 border border-purple-500/30 hover:border-cyan-400/45 rounded-xl text-xs font-bold text-white tracking-wide transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(168,85,247,0.12)] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                >
                  {/* Internal Shimmer effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"></div>

                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Connecting OAuth...</span>
                    </>
                  ) : (
                    <>
                      <svg 
                        className="w-5 h-5 text-white fill-current relative z-10" 
                        viewBox="0 0 16 16" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      <span className="relative z-10">Continue with GitHub</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Secure Signature Footnote */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-semibold tracking-wide mt-2">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span>Secure. Private. Developer-first.</span>
            </div>

            {/* Bottom gradient visual accent */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-purple-500/[0.02] to-transparent pointer-events-none z-0"></div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
