"use client";

import { fetchUserProfile } from "@/lib/api";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Users,
  Settings2,
  ShieldCheck,
  Database,
  Lock,
  KeyRound,
  FileBadge
} from "lucide-react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Authenticated Developer profile states
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [organizations, setOrganizations] = useState<Array<{ name: string; avatar_url?: string }>>([]);

  const loadSettings = async () => {
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || searchParams.get("token") || "";

      // Try cookie-based fetch first
      let profileData = await fetchUserProfile();
      
      // Fallback to legacy token parameter
      if ((!profileData || profileData.detail) && token) {
        profileData = await fetchUserProfile(token);
      }

      if (profileData && !profileData.detail) {
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || "");
        setTargetRole(profileData.target_role || "Fullstack Developer");
        setBio(profileData.bio || null);
        setFollowers(profileData.followers || 0);
        setFollowing(profileData.following || 0);
        setOrganizations(Array.isArray(profileData.organizations) ? profileData.organizations : []);
      }
    } catch (err) {
      console.error("Settings loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setUpdatingRole(true);
    try {
      const token = sessionStorage.getItem("dualloop_session_token") || "";
      const url = token
        ? `http://localhost:8000/user/role?token=${token}`
        : `http://localhost:8000/user/role`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
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

  useEffect(() => {
    loadSettings();
    window.addEventListener("dualloop_resync", loadSettings);
    return () => {
      window.removeEventListener("dualloop_resync", loadSettings);
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="relative w-12 h-12 animate-spin rounded-full border-4 border-t-cyan-500 border-cyan-500/20"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-4xl w-full animate-fade-in">

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 select-none gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white select-text">Developer Profile & Focus Audits</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Manage secure focus stacks, view persistent credentials, and review telemetry identities.</p>
        </div>
        <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#111116] border border-white/5 text-purple-400 rounded-lg flex items-center gap-1">
          <Settings2 className="w-3.5 h-3.5" />
          <span>Focus: {targetRole}</span>
        </span>
      </div>

      {/* 1. SEVE17EEN/BLANTED HYBRID DEVELOPER HUB PANEL */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-glow-radial-purple opacity-25 pointer-events-none"></div>

        {/* Core Profile Ingestion */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {avatarUrl && (
            <div className="relative shrink-0 select-none">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 opacity-60 blur shadow-lg animate-pulse-slow"></div>
              <img
                src={avatarUrl}
                alt={username}
                className="relative w-20 h-20 rounded-full border-2 border-white/10"
              />
            </div>
          )}

          <div className="text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-white select-text">{username}</h2>
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded shadow-[0_0_6px_rgba(6,182,212,0.2)] select-none flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Active Station</span>
              </span>
            </div>

            {/* Focus selection dropdown selector */}
            <div className="flex items-center gap-1.5 bg-[#050508]/60 border border-white/5 pl-2.5 pr-1.5 py-1 rounded-lg select-none">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Focus Stack:</span>
              <select
                value={targetRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={updatingRole}
                className="bg-transparent text-[9px] font-mono text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Fullstack Developer" className="bg-[#050508] text-white">Fullstack Developer</option>
                <option value="Frontend Developer" className="bg-[#050508] text-white">Frontend Developer</option>
                <option value="Backend Developer" className="bg-[#050508] text-white">Backend Developer</option>
                <option value="DevOps Engineer" className="bg-[#050508] text-white">DevOps Engineer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio segment details */}
        {bio && (
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl shadow-inner select-text">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1 select-none">Developer Bio</span>
            <p className="text-[11px] text-gray-300 italic leading-relaxed">
              "{bio}"
            </p>
          </div>
        )}

        {/* Counters & Organization Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-6">
          <div className="flex gap-3 text-[10px] font-mono select-none">
            <div className="bg-[#0b0b10] border border-white/5 px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-gray-500 mr-2">FOLLOWERS:</span>
              <strong className="text-cyan-400 font-bold">{followers}</strong>
            </div>
            <div className="bg-[#0b0b10] border border-white/5 px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-500 mr-2">FOLLOWING:</span>
              <strong className="text-purple-400 font-bold">{following}</strong>
            </div>
          </div>

          {organizations.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest select-none">Orgs:</span>
              <div className="flex flex-wrap gap-1">
                {organizations.map((org, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] font-mono font-bold hover:bg-amber-500/20 transition-all cursor-default shadow-sm"
                    title={org.name}
                  >
                    {org.avatar_url && (
                      <img src={org.avatar_url} alt={org.name} className="w-3.5 h-3.5 rounded-full" />
                    )}
                    {org.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Credentials Details Module */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden shadow-2xl space-y-4 font-mono text-xs">
        <h3 className="text-sm font-extrabold text-white pl-1 select-none flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span>Persistent Session Audits</span>
        </h3>

        <div className="bg-black/60 border border-white/5 p-4 rounded-xl text-gray-500 space-y-3 select-text leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>AUTHENTICATION PROTOCOL:</span>
            </span>
            <span className="text-cyan-400 font-bold">OAUTH 2.0 PROTOCOL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CREDENTIAL ISOLATION LINK:</span>
            </span>
            <span className="text-purple-400 font-bold">AES-256 JWT LOCKED</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>FALLBACK CORE DATABASE:</span>
            </span>
            <span className="text-emerald-400 font-bold">SQLite STANDBY PERSISTED</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="relative w-12 h-12 animate-spin rounded-full border-4 border-t-cyan-500 border-cyan-500/20"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
