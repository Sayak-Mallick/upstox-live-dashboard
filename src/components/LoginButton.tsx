import { redirectToLogin } from "../services/auth";

export default function LoginButton() {
  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo mark */}
      <div className="flex justify-center mb-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div className="absolute -inset-px rounded-xl bg-linear-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-white/90 tracking-tight mb-2">
          Upstox Market Feed
        </h1>
        <p className="text-[11px] text-white/35 tracking-[0.2em] uppercase">
          Real-time data streaming
        </p>
      </div>

      {/* Card */}
      <div className="border border-white/8 bg-white/2 rounded-lg p-5 backdrop-blur-sm mb-4">
        <div className="flex items-start gap-3 mb-5">
          {[
            { icon: "⚡", label: "Low latency", sub: "WebSocket feed" },
            { icon: "🔒", label: "OAuth 2.0", sub: "Secure auth" },
            { icon: "📊", label: "Live quotes", sub: "Market data" },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="flex-1 bg-white/2 border border-white/5 rounded-md px-2.5 py-2 text-center"
            >
              <span className="text-base leading-none block mb-1">{icon}</span>
              <p className="text-[9px] text-white/60 font-medium tracking-wide leading-tight">
                {label}
              </p>
              <p className="text-[9px] text-white/25 tracking-wide leading-tight mt-0.5">
                {sub}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={redirectToLogin}
          className="group w-full relative overflow-hidden rounded-md bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 px-4 py-3"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">
              Login with Upstox
            </span>
          </div>
        </button>
      </div>

      <p className="text-center text-[9px] text-white/15 tracking-widest uppercase">
        You'll be redirected to Upstox for authorization
      </p>
    </div>
  );
}
