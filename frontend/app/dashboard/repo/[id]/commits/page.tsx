"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchRepositoryCommits } from "@/lib/api";

export default function RepositoryCommitsTimeline() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("dualloop_session_token");
    if (!token) {
      router.push("/");
      return;
    }

    const loadCommits = async () => {
      try {
        const response = await fetchRepositoryCommits(token, parseInt(repoId));
        if (response.detail) {
          setError(response.detail);
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
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] text-white p-8">
        <button onClick={() => router.push("/dashboard")} className="mb-6 text-cyan-500 hover:text-cyan-400 font-mono text-sm flex items-center gap-2">
          <span>&larr;</span> Back to Dashboard
        </button>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={() => router.push("/dashboard")} className="mb-8 text-gray-400 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2 bg-[#0b0b0e] px-4 py-2 rounded-lg border border-white/5 hover:border-cyan-500/30">
          <span>&larr;</span> Back to Dashboard
        </button>

        <div className="bg-[#0b0b0e]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl mb-10 shadow-2xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {data?.repo_full_name}
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            Total Commits: <span className="text-cyan-400">{data?.total_commits}</span>
          </p>
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 space-y-12 pb-20">
          {data?.commits?.map((commit: any, index: number) => {
            const date = new Date(commit.commit_date);
            return (
              <div key={commit.sha} className="relative group pl-10">
                {/* Timeline Node */}
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-[#050508] border-2 border-cyan-500 group-hover:bg-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-300"></div>
                
                {/* Content Card */}
                <div className="bg-[#0b0b0e]/90 border border-white/5 group-hover:border-cyan-500/30 rounded-xl p-5 shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200 leading-snug">
                        {commit.message.split("\\n")[0]}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs font-mono text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          {commit.author_name}
                        </span>
                        <span>&bull;</span>
                        <span className="text-gray-400">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-green-400">+{commit.additions}</span>
                      <span className="text-red-400">-{commit.deletions}</span>
                    </div>
                  </div>
                  
                  {commit.message.includes("\\n") && (
                    <pre className="text-sm text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5 font-mono whitespace-pre-wrap mt-3">
                      {commit.message.split("\\n").slice(1).join("\\n").trim()}
                    </pre>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-600">SHA:</span>
                    <span className="text-xs font-mono text-cyan-500/70 bg-cyan-500/10 px-2 py-1 rounded">
                      {commit.sha.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {data?.commits?.length === 0 && (
            <div className="pl-10">
              <div className="bg-[#0b0b0e]/50 border border-dashed border-white/10 rounded-xl p-8 text-center">
                <p className="text-gray-400 font-mono text-sm">No commits found for this repository.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
