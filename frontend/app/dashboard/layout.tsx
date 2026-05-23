"use client";

import { fetchUserProfile, fetchUserRepositories } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Infinity,
  LayoutDashboard,
  FolderGit,
  Activity,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Database,
  Radio
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [repositoriesCount, setRepositoriesCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSidebarData = async () => {
    try {
      // 1. Safe Client-Side parsing of OAuth Callback Token
      let token = new URLSearchParams(window.location.search).get("token") || "";

      if (token) {
        sessionStorage.setItem("dualloop_session_token", token);
        // Clean URL to prevent token leakage in URL bar
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        token = sessionStorage.getItem("dualloop_session_token") || "";
      }

      // If no token exists in query string or session cache, redirect to landing
      if (!token) {
        router.push("/");
        return;
      }

      // Fetch user profile info
      const profileData = await fetchUserProfile(token);
      if (profileData && !profileData.detail) {
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || "");
      }

      // Load repositories to get the count
      const reposRes = await fetch(`http://localhost:8000/repositories/all?token=${token}`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          setRepositoriesCount(reposData.length);
        }
      }
    } catch (err) {
      console.error("Layout data load failed:", err);
    }
  };

  useEffect(() => {
    loadSidebarData();
  }, [pathname]);

  const handleForceResync = async () => {
    setIsRefreshing(true);
    try {
      const token = sessionStorage.getItem("dualloop_session_token");
      if (token) {
        await fetchUserRepositories(token);
        // Dispatch custom event to notify child components that resync occurred
        window.dispatchEvent(new Event("dualloop_resync"));
        await loadSidebarData();
      }
    } catch (err) {
      console.error("Force resync failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("dualloop_session_token");
    window.location.href = "/";
  };

  return (
    <div className="relative min-h-screen bg-[#030305] text-[#f8fafc] font-sans flex flex-col md:flex-row overflow-x-hidden">

      {/* Glow Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-glow-radial-blue opacity-30 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-glow-radial-purple opacity-25 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

      {/* 1. SEVE17EEN/BLANTED STYLE SIDEBAR */}
      <aside className="w-full md:w-60 shrink-0 bg-[#060609]/95 border-b md:border-b-0 md:border-r border-white/5 p-6 relative z-25 flex flex-col justify-between md:sticky md:top-0 md:h-screen select-none">

        <div className="space-y-8">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Infinity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-md font-extrabold tracking-tight text-white block leading-none">DualLoop.</span>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mt-1">TELEMETRY BOARD</span>
            </div>
          </div>

          {/* Sidebar Menu Links */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block pl-2 mb-1.5">Summary</span>

            <button
              onClick={() => router.push("/dashboard")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-3 transition-colors cursor-pointer ${pathname === "/dashboard" ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard/feeds")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-between transition-colors cursor-pointer ${pathname === "/dashboard/feeds" ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <span className="flex items-center gap-3">
                <FolderGit className="w-4 h-4" /> Mapped Feeds
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px] font-mono font-bold select-none">
                {repositoriesCount}
              </span>
            </button>

            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block pl-2 pt-4 mb-1.5">Developer Station</span>

            <button
              onClick={() => router.push("/dashboard/telemetry")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-3 transition-colors cursor-pointer ${pathname === "/dashboard/telemetry" ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <Activity className="w-4 h-4" /> Telemetry Wave
            </button>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-3 transition-colors cursor-pointer ${pathname === "/dashboard/settings" ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <ShieldCheck className="w-4 h-4" /> Security Hub
            </button>
          </div>
        </div>

        {/* Sidebar Footer buffer gauge & User profile pill */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          {/* Buffer load status */}
          <div className="bg-[#111115]/50 border border-white/5 p-4 rounded-2xl text-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-transparent"></div>
            <div className="w-16 h-8 border-t-2 border-x-2 border-cyan-500/30 rounded-t-full mx-auto relative flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-cyan-400 absolute top-2.5" />
            </div>
            <div className="text-[10px] font-bold text-white mt-2">8.2k / 10k Commits</div>

            <button
              onClick={handleForceResync}
              disabled={isRefreshing}
              className="mt-3.5 w-full py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white rounded-lg text-[9px] font-mono font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Resyncing..." : "Resync Ingest Buffer"}</span>
            </button>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center justify-between p-2 bg-[#111114] border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-7 h-7 rounded-full border border-white/10 shrink-0 select-none"
                />
              )}
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-white truncate">{username || "Developer"}</span>
                <span className="block text-[8px] font-mono text-gray-600 truncate flex items-center gap-1 mt-0.5">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 shrink-0 animate-pulse" />
                  <span>github.dev</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 flex items-center justify-center shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 min-w-0 flex flex-col md:h-screen md:overflow-y-auto relative z-10">
        {children}
      </div>

    </div>
  );
}
