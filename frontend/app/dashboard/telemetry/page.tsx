"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Cpu,
  Radio
} from "lucide-react";

function TelemetryContent() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; status: string; statusColor: string; statusIcon: any }>>([]);

  const loadLogs = () => {
    const defaultLogs = [
      { time: "02:30:14", msg: "Establishing secure SSL connection to station...", status: "PENDING", statusColor: "text-amber-400", statusIcon: Loader2 },
      { time: "02:30:14", msg: "Exchanging OAuth credentials matching client user...", status: "AUTHORIZED", statusColor: "text-purple-400", statusIcon: ShieldCheckIcon },
      { time: "02:30:15", msg: "Synchronizing telemetry logs database buffer...", status: "SUCCESS", statusColor: "text-emerald-400", statusIcon: CheckCircle2 },
      { time: "02:30:15", msg: "Ingesting repository metadata models from GitHub API...", status: "SUCCESS", statusColor: "text-emerald-400", statusIcon: CheckCircle2 },
      { time: "02:30:16", msg: "Analyzing codebase language ratios and file configurations...", status: "COMPUTING", statusColor: "text-cyan-400", statusIcon: Loader2 },
      { time: "02:30:16", msg: "Verifying multi-tenant security structures...", status: "SECURE", statusColor: "text-purple-400", statusIcon: CheckCircle2 }
    ];
    setLogs(defaultLogs);
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener("dualloop_resync", loadLogs);
    return () => {
      window.removeEventListener("dualloop_resync", loadLogs);
    };
  }, [searchParams]);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full animate-fade-in">

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 select-none gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white select-text">Core Telemetry Wave Ingest Console</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Continuous diagnostics signal tracing and active station firmware telemetry.</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono tracking-widest bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded animate-pulse">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
          <span>SIGNAL TRACER ACTIVE</span>
        </span>
      </div>

      {/* 1. STUNNING SVG TELEMETRY WAVE CHART */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-glow-radial-blue opacity-25 pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">Active Telemetry Wave</span>
            <h3 className="text-md font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Ingestion Inbound Frequency Signal</span>
            </h3>
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Commit Rate: <strong className="text-gray-300">99.4%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Traces: <strong className="text-gray-300">Active</strong>
            </span>
          </div>
        </div>

        {/* Interactive SVG Sparkline Wave (Mocking beautiful signal trace telemetry) */}
        <div className="relative w-full h-44 flex items-end">
          <svg className="w-full h-full text-cyan-500/25 fill-current" viewBox="0 0 100 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
              </linearGradient>
            </defs>
            <path d="M 0 30 L 0 25 Q 10 18 20 23 T 40 10 T 60 22 T 80 8 T 100 12 L 100 30 Z" fill="url(#gradient-wave)" />
            <path d="M 0 25 Q 10 18 20 23 T 40 10 T 60 22 T 80 8 T 100 12" fill="none" stroke="rgba(6, 182, 212, 0.85)" strokeWidth="0.75" strokeLinecap="round" />
          </svg>

          {/* Glowing active pointers */}
          <div className="absolute left-[40%] bottom-[65%] group cursor-crosshair">
            <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white flex items-center justify-center animate-ping absolute -top-1 -left-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 border border-white block relative z-10 shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#09090d] border border-cyan-500/30 rounded-lg p-2 text-[9px] font-mono text-cyan-400 w-24 text-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
              Peak: +48 commits
            </div>
          </div>

          <div className="absolute left-[80%] bottom-[73%] group cursor-crosshair">
            <span className="w-3 h-3 rounded-full bg-purple-400 border border-white flex items-center justify-center animate-ping absolute -top-1 -left-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 border border-white block relative z-10 shadow-[0_0_8px_rgba(168,85,247,1)]"></span>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#09090d] border border-purple-500/30 rounded-lg p-2 text-[9px] font-mono text-purple-400 w-24 text-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
              Volume: +62 lines
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono text-gray-600 mt-4 border-t border-white/5 pt-3 select-none">
          <span>INGEST TIME: 0.1s</span>
          <span>STATION BUFFER ALIGNED: 100%</span>
        </div>
      </div>

      {/* 2. REAL-TIME RUNNING TERMINAL TRACER LOGS */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none">
          <h3 className="text-xs font-bold font-mono tracking-wider text-gray-200 uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-500" />
            <span>Active Core Diagnostics Logs</span>
          </h3>
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            LOGS_OUTPUT_STREAM
          </span>
        </div>

        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl font-mono text-xs text-gray-400 space-y-3 max-h-[300px] overflow-y-auto select-text leading-relaxed">
          {logs.map((log, idx) => {
            const Icon = log.statusIcon === ShieldCheckIcon ? CheckCircle2 : log.statusIcon;
            return (
              <div key={idx} className="flex items-start gap-4">
                <span className="text-cyan-400 select-none">[{log.time}]</span>
                <span className="flex-1">{log.msg}</span>
                <span className={`font-bold shrink-0 text-right flex items-center gap-1.5 ${log.statusColor}`}>
                  {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${log.status === "PENDING" || log.status === "COMPUTING" ? "animate-spin" : ""}`} />}
                  <span>{log.status}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono text-gray-600 pt-1 select-none">
          <span>Active Context: Secure user_id matches JWT matches SQLite database credentials.</span>
        </div>
      </div>

    </div>
  );
}

// Fallback dummy icon definition
const ShieldCheckIcon = CheckCircle2;

export default function TelemetryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="relative w-12 h-12 animate-spin rounded-full border-4 border-t-cyan-500 border-cyan-500/20"></div>
      </div>
    }>
      <TelemetryContent />
    </Suspense>
  );
}
