"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Infinity, ShieldCheck, ArrowRight, LogOut, Terminal, Lock, GitBranch } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("dualloop_session_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:8000/auth/github/login";
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("dualloop_session_token");
    setIsLoggedIn(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030305] text-[#f8fafc] flex items-center justify-center overflow-hidden font-sans">

      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none z-0"></div>

      {/* Ambient glow blobs — float in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-glow-radial-blue z-0 pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-glow-radial-purple z-0 pointer-events-none"
      />

      {/* Half-visible GitHub Octocat silhouette (behind the card) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
      >
        <svg className="w-[600px] h-[600px]" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </motion.div>

      {/* Floating backend code lines — left side */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="absolute left-6 top-1/4 space-y-3 font-mono text-[9px] text-white/[0.06] select-none pointer-events-none z-0 hidden md:block"
      >
        <div>from fastapi import FastAPI, Depends</div>
        <div>from sqlalchemy.orm import Session</div>
        <div>from app.auth import verify_token</div>
        <div className="pl-4">app = FastAPI(title=&quot;DualLoop&quot;)</div>
        <div></div>
        <div>@app.get(&quot;/api/v1/repos&quot;)</div>
        <div>async def get_repos(</div>
        <div className="pl-4">token: str = Depends(verify_token),</div>
        <div className="pl-4">db: Session = Depends(get_db)</div>
        <div>):</div>
        <div className="pl-4">return db.query(Repository).all()</div>
      </motion.div>

      {/* Floating backend code lines — right side */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        className="absolute right-6 bottom-1/4 space-y-3 font-mono text-[9px] text-white/[0.06] select-none pointer-events-none z-0 hidden md:block text-right"
      >
        <div>class Repository(Base):</div>
        <div className="pr-4">__tablename__ = &quot;repositories&quot;</div>
        <div className="pr-4">id = Column(Integer, primary_key=True)</div>
        <div className="pr-4">name = Column(String, nullable=False)</div>
        <div className="pr-4">language = Column(String)</div>
        <div className="pr-4">stars = Column(Integer, default=0)</div>
        <div></div>
        <div>async def sync_commits(repo_id: int):</div>
        <div className="pr-4">commits = await github.fetch_commits()</div>
        <div className="pr-4">db.bulk_insert(commits)</div>
      </motion.div>

      {/* Main Glass Card — scale + fade in */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] mx-4"
      >

        {/* Outer gradient border glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-transparent rounded-3xl blur-sm pointer-events-none"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl opacity-60 blur-2xl pointer-events-none"></div>

        <div className="relative rounded-3xl bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_64px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Top accent gradient line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

          {/* Inner content */}
          <div className="p-8 md:p-10 flex flex-col items-center gap-7">

            {/* Back link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="self-start"
            >
              <Link
                href="/"
                className="text-[11px] font-mono text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <span>&larr;</span> Back to Station
              </Link>
            </motion.div>

            {/* Header: Logo + GitHub silhouette ring */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="text-center space-y-4"
            >
              <div className="relative mx-auto w-16 h-16">
                {/* Outer animated ring */}
                <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 animate-pulse"></div>
                {/* Glass icon container */}
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-[#1b1b22] to-[#0e0e12] border border-white/10 flex items-center justify-center shadow-inner">
                  <svg
                    className="w-7 h-7 text-white fill-current filter drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </div>
                {/* Corner accent dots */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7, type: "spring" }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8, type: "spring" }}
                  className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  {isLoggedIn ? "Session Active" : "Authenticate Console"}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                  {isLoggedIn
                    ? "Your secure workspace session is currently live and streaming telemetry."
                    : "Connect your GitHub workspace via OAuth to initialize telemetry mapping and diagnostics."
                  }
                </p>
              </div>
            </motion.div>

            {/* Feature badges row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center justify-center gap-4 select-none"
            >
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                <Terminal className="w-3 h-3 text-cyan-400/60" />
                <span>FastAPI Backend</span>
              </div>
              <div className="w-0.5 h-3 bg-white/5"></div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-purple-400/60" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="w-0.5 h-3 bg-white/5"></div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                <GitBranch className="w-3 h-3 text-emerald-400/60" />
                <span>Git Sync</span>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
              className="w-full flex flex-col gap-3"
            >
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-3.5 bg-gradient-to-r from-white to-gray-100 text-black font-semibold rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Return to Active Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3.5 bg-[#111115] border border-red-500/20 text-red-400 font-semibold rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Session</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="group w-full py-3.5 bg-gradient-to-r from-white to-gray-100 text-black font-semibold rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>Initializing OAuth Redirect...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5 fill-current relative z-10" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      <span className="relative z-10">Continue with GitHub</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {/* Legal / Trust footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-[9px] text-gray-600 text-center leading-relaxed max-w-[300px]"
            >
              By connecting, you authorize DualLoop to map your repositories and read telemetry commits. No code files are modified or stored.
            </motion.div>

            {/* Bottom protocol bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="w-full flex items-center justify-between text-[8px] font-mono text-gray-600 border-t border-white/5 pt-4"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                <span>OAUTH 2.0 PROTOCOL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)] animate-pulse"></div>
                <span>SECURE SESSION</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom gradient fade accent */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-purple-500/[0.03] to-transparent pointer-events-none"></div>

        </div>
      </motion.div>

      {/* Floating DualLoop brand mark (bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none z-10"
      >
        <div className="w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_6px_rgba(6,182,212,0.2)]">
          <Infinity className="w-3 h-3 text-white" />
        </div>
        <span className="text-[9px] font-mono text-gray-600 tracking-widest uppercase">DualLoop Telemetry Station</span>
      </motion.div>

    </div>
  );
}
