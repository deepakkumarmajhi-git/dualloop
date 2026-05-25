"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Infinity as InfinityIcon, 
  ArrowRight, 
  Compass
} from "lucide-react";

export default function NotFound() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated via sessionStorage fallback
    const token = sessionStorage.getItem("dualloop_session_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030305] text-[#f8fafc] flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* 1. CYBERNETIC GRID BACKGROUNDS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-glow-radial-blue opacity-30 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-glow-radial-purple opacity-25 z-0 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none z-0" />

      {/* 2. PREMIUM NAVIGATION HEADER */}
      <header className="relative w-full border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between z-50 bg-[#030305]/80 backdrop-blur-md select-none">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 select-none group w-fit">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-200">
            <InfinityIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-wide text-white block">DualLoop.</span>
            <span className="text-[7px] font-mono text-gray-500 uppercase tracking-widest block mt-0.5">EST. 2026</span>
          </div>
        </Link>

        {/* Central Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400 select-none">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">Diagnostics</Link>
          <Link href="/dashboard/feeds" className="hover:text-white transition-colors cursor-pointer">Workspace</Link>
          <Link href="/dashboard/telemetry" className="hover:text-white transition-colors cursor-pointer">Telemetry</Link>
          <Link href="/dashboard/settings" className="hover:text-white transition-colors cursor-pointer">Security Hub</Link>
        </div>

        {/* Right Socials & CTA Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-gray-500 mr-2">
            <Link href="https://facebook.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </Link>
          </div>

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="px-5 py-2 rounded-full bg-[#0d0d12]/90 border border-white/10 hover:border-cyan-400/40 text-white font-semibold text-[11px] hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] tracking-wide transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {isAuthenticated ? "Launch Console" : "Get started"}
          </Link>
        </div>
      </header>

      {/* 3. HERO SECTION (THE 404 COMPONENT LAYER) */}
      <main className="relative flex-1 flex flex-col items-center justify-center py-20 px-6 z-10 w-full select-none">
        
        {/* Layer 1: Giant Faded 404 in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 select-text">
          <h1 className="text-[12rem] sm:text-[18rem] md:text-[25rem] font-black tracking-tighter leading-none bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent bg-clip-text text-transparent font-sans pointer-events-none select-none translate-y-[-10%] select-text">
            404
          </h1>
        </div>

        {/* Layer 2: Abstract Metallic Chrome Ribbon (Dark Flow Loop) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
          <svg className="w-full max-w-[800px] h-[400px] opacity-45 glow-cyan-filter pointer-events-none" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dark abstract loops representing DualLoop ribbon */}
            <path 
              d="M50 250 C 250 80, 550 320, 750 150 C 650 350, 150 50, 50 250 Z" 
              stroke="url(#paint0_linear_ribbon)" 
              strokeWidth="6" 
              strokeLinecap="round"
              className="animate-dash"
            />
            <path 
              d="M100 200 C 300 350, 500 50, 700 200 C 600 50, 200 350, 100 200 Z" 
              stroke="url(#paint1_linear_ribbon)" 
              strokeWidth="2" 
              strokeOpacity="0.4"
            />
            <defs>
              <linearGradient id="paint0_linear_ribbon" x1="0" y1="200" x2="800" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="0.25" stopColor="#06b6d4" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="0.75" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="paint1_linear_ribbon" x1="0" y1="200" x2="800" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="0.5" stopColor="#06b6d4" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer 3: Premium Glassmorphic Overlay Card */}
        <div className="relative z-20 glass-panel rounded-[32px] p-10 max-w-[460px] w-full text-center shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/10 select-none">
          {/* Card visual status capsule */}
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#12121f] to-[#07070c] border border-white/5 shadow-inner mx-auto mb-6">
            <Compass className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.45)]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Oops, page not found
          </h2>
          
          <p className="text-xs text-gray-400 mt-4 leading-relaxed font-normal px-4">
            The telemetry path or diagnostic workspace partition you are trying to sync is unavailable or has been relocated to another server buffer.
          </p>

          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="mt-8 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-white font-bold text-xs tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <span>Back to homepage</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>

      </main>

      {/* 4. TRY DUAL LOOP OF THE FUTURE (MIDDLE PROMO CARD) */}
      <section className="relative z-20 max-w-5xl mx-auto w-full px-6 mb-16 select-none">
        <div className="glass-gradient-card rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Card abstract back ribbon loop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-20">
            <div className="w-[120%] h-[120%] bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-transparent blur-[40px]" />
          </div>

          <div className="relative z-10 space-y-3.5 max-w-xl text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight select-text">
              Try the workspace diagnostics of the future, today.
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md select-text">
              Continuous GitHub analytics, isolated telemetry timelines, automated schema configurations, and cybernetic developer stations locked inside premium glassmorphic environments.
            </p>
          </div>

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="relative z-10 shrink-0 self-start md:self-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
        </div>
      </section>

      {/* 5. METICULOUS FOOTER WITH DIRECTORY SITEMAPS */}
      <footer className="relative z-20 w-full bg-[#060609]/95 border-t border-white/5 pt-16 pb-8 px-6 md:px-12 select-none">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 pb-12">
          
          {/* Left Brand Capsule */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2 select-none group w-fit">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <InfinityIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-wide text-white">DualLoop</span>
            </Link>
            <p className="text-[10px] text-gray-500 leading-relaxed max-w-xs select-text">
              The continuous fullstack developer diagnostics platform, integrating isolated database metrics and language analytics.
            </p>
          </div>

          {/* Directory Column 1: Main Pages */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-bold">Main pages</h4>
              <ul className="space-y-2 text-[10px] font-mono text-gray-500 font-semibold">
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">Home Console</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">Dashboard V1</Link></li>
                <li><Link href="/dashboard/feeds" className="hover:text-white transition-colors cursor-pointer">Feeds Catalog</Link></li>
                <li><Link href="/dashboard/telemetry" className="hover:text-white transition-colors cursor-pointer">Telemetry Wave</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-bold">&nbsp;</h4>
              <ul className="space-y-2 text-[10px] font-mono text-gray-500 font-semibold pt-1">
                <li><Link href="/dashboard/settings" className="hover:text-white transition-colors cursor-pointer">Security Hub</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors cursor-pointer">Login Gate</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">Active Buffer</Link></li>
                <li><Link href="/dashboard/telemetry" className="hover:text-white transition-colors cursor-pointer">Ingest Status</Link></li>
              </ul>
            </div>
          </div>

          {/* Directory Column 2: Utility Pages */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-bold">Utility pages</h4>
            <ul className="space-y-2 text-[10px] font-mono text-gray-500 font-semibold">
              <li><Link href="/login" className="hover:text-white transition-colors cursor-pointer">Start here</Link></li>
              <li><Link href="/dashboard/settings" className="hover:text-white transition-colors cursor-pointer">Styleguide</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors cursor-pointer">Password protected</Link></li>
              <li><Link href="/not-found-debug-test" className="hover:text-white transition-colors cursor-pointer text-cyan-400">404 not found</Link></li>
            </ul>
          </div>

        </div>

        {/* Meticulous copyright line */}
        <div className="max-w-7xl mx-auto w-full pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 font-semibold">
          <div className="select-text">
            Copyright © 2026 DualLoop. Continuous diagnostics designed for developers.
          </div>
          
          <div className="flex items-center gap-4 text-gray-500 select-none">
            <Link href="https://facebook.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </Link>
          </div>
        </div>

      </footer>

    </div>
  );
}
