"use client"
import { useState } from "react";

export default function LoginButton() {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        window.location.href = "http://localhost:8000/auth/github/login";
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Berkeley+Mono&family=DM+Sans:wght@400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(88,166,255,0.06) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .card {
          position: relative;
          z-index: 10;
          background: #111111;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 48px 40px;
          width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 64px rgba(0,0,0,0.6);
        }

        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .logo-ring {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
          border: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-ring svg {
          width: 26px;
          height: 26px;
          fill: #e6edf3;
        }

        .title {
          font-size: 22px;
          font-weight: 600;
          color: #f0f6fc;
          letter-spacing: -0.4px;
        }

        .subtitle {
          font-size: 13.5px;
          color: #6e7681;
          line-height: 1.5;
        }

        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #222, transparent);
        }

        .github-btn {
          width: 100%;
          height: 48px;
          background: #f0f6fc;
          color: #0d1117;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
          letter-spacing: -0.1px;
        }

        .github-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .github-btn:hover::before {
          opacity: 1;
        }

        .github-btn:hover {
          background: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(240,246,252,0.12), 0 2px 8px rgba(0,0,0,0.3);
        }

        .github-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .github-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .github-btn svg {
          width: 20px;
          height: 20px;
          fill: #0d1117;
          flex-shrink: 0;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(13,17,23,0.2);
          border-top-color: #0d1117;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .terms {
          font-size: 11.5px;
          color: #484f58;
          text-align: center;
          line-height: 1.6;
        }

        .terms a {
          color: #6e7681;
          text-decoration: none;
          border-bottom: 1px solid #2a2a2a;
          padding-bottom: 1px;
          transition: color 0.15s, border-color 0.15s;
        }

        .terms a:hover {
          color: #a8b1bc;
          border-color: #4a5060;
        }

        .tag {
          font-family: 'Berkeley Mono', monospace;
          font-size: 10px;
          color: #30363d;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tag::before,
        .tag::after {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: #222;
        }
      `}</style>

            <div className="login-page">
                <div className="bg-grid" />
                <div className="bg-glow" />

                <div className="card">
                    <div className="header">
                        <div className="logo-ring">
                            {/* GitHub Octocat mark */}
                            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                  -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                  .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                  -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09
                  2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                  0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
                  0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                        </div>
                        <div>
                            <div className="title">Welcome back</div>
                            <div className="subtitle" style={{ marginTop: 6 }}>
                                Sign in to continue to your workspace
                            </div>
                        </div>
                    </div>

                    <div className="divider" />

                    <button
                        className="github-btn"
                        onClick={handleLogin}
                        disabled={isLoading}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner" />
                                Redirecting…
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                    0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                    -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                    .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                    -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09
                    2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                    0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
                    0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                                </svg>
                                Continue with GitHub
                            </>
                        )}
                    </button>

                    <div className="terms">
                        By signing in, you agree to our{" "}
                        <a href="#">Terms of Service</a> and{" "}
                        <a href="#">Privacy Policy</a>
                    </div>

                    <div className="tag">Secured OAuth 2.0</div>
                </div>
            </div>
        </>
    );
}