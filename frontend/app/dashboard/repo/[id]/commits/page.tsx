"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchRepositoryCommits } from "@/lib/api";
import { ArrowLeft, GitCommit, GitFork, User, Calendar, Terminal } from "lucide-react";

export default function RepositoryCommitsTimeline() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("dualloop_session_token") || null;

    const loadCommits = async () => {
      try {
        const response = await fetchRepositoryCommits(token, parseInt(repoId));
        if (response.detail) {
          setError(response.detail);
          if (response.detail.toLowerCase().includes("missing") || response.detail.toLowerCase().includes("expired") || response.detail.toLowerCase().includes("invalid")) {
            router.push("/");
          }
        } else {
          setData(response);
        }
      } catch (err) {
        setError("Failed to load commits timeline.");
      } finally {
        setLoading(false);
      }
    };

    loadCommits();
  }, [repoId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] text-[#f8fafc] flex items-center justify-center font-sans relative overflow-hidden cyber-grid">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-radial-blue opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-glow-radial-purple opacity-45 pointer-events-none"></div>

        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030305] text-[#f8fafc] p-8 font-sans cyber-grid flex flex-col justify-center items-center">
        <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center space-y-6">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-2 mx-auto bg-white/5 border border-white/5 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Station</span>
          </button>
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 font-mono text-xs text-left leading-relaxed">
            [TELEMETRY INGEST EXCEPTION]: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-[#f8fafc] p-6 md:p-10 font-sans relative overflow-x-hidden cyber-grid">
      
      {/* Decorative Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-glow-radial-blue opacity-40 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-glow-radial-purple opacity-30 z-0 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Back Link */}
        <button 
          onClick={() => router.push("/dashboard")} 
          className="group text-gray-400 hover:text-cyan-400 transition-colors font-mono text-xs flex items-center gap-2 bg-[#09090d]/80 px-4 py-2.5 rounded-xl border border-white/5 hover:border-cyan-500/30 cursor-pointer shadow-sm select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Dashboard Diagnostic Title Block */}
        <div className="relative group p-6 md:p-8 bg-[#09090d]/85 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-glow-radial-blue opacity-35 pointer-events-none"></div>
          
          <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-md flex items-center gap-1.5 w-fit">
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>REPOSITORY SPECIFIC COMMIT DIAGNOSTICS</span>
          </span>
          
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mt-3 select-text">
            {data?.repo_full_name}
          </h1>
          
          <div className="flex items-center gap-3 mt-4 text-xs font-mono">
            <span className="text-gray-500 flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-cyan-500" />
              <span>Total Telemetry Commits:</span>
            </span>
            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              {data?.total_commits}
            </span>
          </div>
        </div>

        {/* Timeline Log Frame */}
        <div className="relative border-l border-white/10 ml-6 space-y-8 pb-20">
          
          {data?.commits?.map((commit: any) => {
            const date = new Date(commit.commit_date);
            return (
              <div key={commit.sha} className="relative group pl-8">
                
                {/* Timeline Pulse Circular Node */}
                <div className="absolute -left-[5.5px] top-2.5 w-[11px] h-[11px] rounded-full bg-[#030305] border border-cyan-500 group-hover:bg-cyan-400 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-300 pointer-events-none"></div>
                
                {/* Commit Log Details Panel */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors leading-snug select-text">
                        {commit.message.split("\n")[0]}
                      </h3>
                      
                      {/* Meta parameters row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-gray-500">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          <span>{commit.author_name}</span>
                        </span>
                        <span className="text-gray-700 select-none">&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Gauges indicators */}
                    <div className="shrink-0 flex items-center gap-2.5 text-[10px] font-mono bg-[#111116] px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                      <span className="text-emerald-400 font-bold">+{commit.additions}</span>
                      <span className="text-red-400 font-bold">-{commit.deletions}</span>
                    </div>
                  </div>
                  
                  {/* Detailed Description code frame block */}
                  {commit.message.includes("\n") && (
                    <div className="p-4 bg-black/60 border border-white/5 rounded-xl font-mono text-xs text-gray-400 space-y-1 overflow-x-auto select-text leading-relaxed">
                      <div className="text-[8px] text-gray-600 border-b border-white/5 pb-2 mb-2 select-none flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-purple-400" />
                        <span>COMMIT_DETAILS_BODY</span>
                      </div>
                      <pre className="whitespace-pre-wrap">
                        {commit.message.split("\n").slice(1).join("\n").trim()}
                      </pre>
                    </div>
                  )}

                  {/* SHA selection badge */}
                  <div className="flex items-center gap-2 border-t border-white/5 pt-3.5">
                    <span className="text-[9px] font-mono text-gray-500 select-none">TRACE SHA:</span>
                    <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/5 hover:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10 transition-colors select-all">
                      {commit.sha}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {data?.commits?.length === 0 && (
            <div className="pl-8">
              <div className="glass-panel border-dashed border-white/10 rounded-2xl p-10 text-center select-none">
                <p className="text-gray-500 font-mono text-xs">No commits tracked for this repository station.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
