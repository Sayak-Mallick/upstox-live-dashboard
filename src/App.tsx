import { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import { useAuth } from "./hooks/useAuth";
import { fetchWsUrl } from "./services/getWsUrl";
import { useUpstoxStream } from "./hooks/useUpStoxStream";
import { logout } from "./utils/auth";

export default function App() {
  const token = useAuth();
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initWs = async () => {
      if (!token) return;
      setIsConnecting(true);
      const url = await fetchWsUrl(token);
      console.log("WS URL:", url);
      setWsUrl(url);
      setIsConnecting(false);
    };
    initWs();
  }, [token]);

  useUpstoxStream(wsUrl!);

  const handleLogout = () => logout();

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-white font-mono flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">
            Upstox
          </span>
          <span className="text-white/10">|</span>
          <span className="text-[10px] tracking-widest text-white/20 uppercase">
            Market Feed
          </span>
        </div>
        {token && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/30 tracking-widest uppercase">
              Live
            </span>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6">
        {!token ? (
          <LoginButton />
        ) : isConnecting ? (
          <ConnectingState />
        ) : (
          <ConnectedState onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-3 flex items-center justify-between">
        <span className="text-[9px] tracking-widest text-white/15 uppercase">
          ©{new Date().getFullYear()} Upstox Stream
        </span>
        <span className="text-[9px] tracking-widest text-white/15 uppercase">
          v1.0.0
        </span>
      </footer>
    </div>
  );
}

function ConnectingState() {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-t border-emerald-400 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-xs tracking-[0.25em] text-white/40 uppercase">
          Establishing connection
        </p>
        <p className="text-[10px] tracking-widest text-white/20 uppercase mt-1">
          Please wait
        </p>
      </div>
    </div>
  );
}

function ConnectedState({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Status card */}
      <div className="border border-white/8 bg-white/[0.02] rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white/90 tracking-wide">
              Stream Active
            </h2>
            <p className="text-[11px] text-white/35 mt-0.5 tracking-wide">
              Receiving market data
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/40 rounded-full px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
              LIVE
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-6" />

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Connection", value: "Secure" },
            { label: "Protocol", value: "WebSocket" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/[0.02] border border-white/5 rounded-md px-3 py-2.5"
            >
              <p className="text-[9px] tracking-widest text-white/25 uppercase mb-1">
                {label}
              </p>
              <p className="text-xs text-white/70 font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full group flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/8 bg-white/[0.02] hover:bg-red-950/30 hover:border-red-900/50 transition-all duration-200 text-xs text-white/40 hover:text-red-400 tracking-widest uppercase"
        >
          <svg
            className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Disconnect
        </button>
      </div>
    </div>
  );
}
