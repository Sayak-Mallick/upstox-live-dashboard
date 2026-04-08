import { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import MarketDashboard from "./components/MarketDashboard";
import { useAuth } from "./hooks/useAuth";
import { fetchWsUrl } from "./services/getWsUrl";
import { useUpstoxStream } from "./hooks/useUpstoxStream";
import { logout } from "./utils/auth";

export default function App() {
  const token = useAuth();
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);

  useEffect(() => {
    const initWs = async () => {
      if (!token) return;
      setIsConnecting(true);
      setWsError(null);
      try {
        const url = await fetchWsUrl(token);
        if (!url) throw new Error("No WebSocket URL received");
        setWsUrl(url);
      } catch (e) {
        setWsError("Failed to get WebSocket URL. Please re-login.");
        console.error(e);
      } finally {
        setIsConnecting(false);
      }
    };
    initWs();
  }, [token]);

  const stream = useUpstoxStream(wsUrl || undefined);
  const handleLogout = () => logout();

  return (
    <div className="min-h-screen bg-[#080a0d] text-white font-mono">
      {!token ? (
        // Not authenticated
        <div className="min-h-screen flex items-center justify-center px-6">
          <LoginButton />
        </div>
      ) : isConnecting ? (
        // Connecting state
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border-t border-emerald-400 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs tracking-[0.25em] text-white/40 uppercase">
              Establishing WebSocket connection
            </p>
            <p className="text-[10px] tracking-widest text-white/20 uppercase">
              Authenticating with Upstox V3 feed...
            </p>
          </div>
        </div>
      ) : wsError ? (
        // Error state
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-rose-400 text-sm">{wsError}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-white/40 border border-white/10 px-4 py-2 rounded hover:text-white hover:border-white/30 transition-all"
          >
            Re-login
          </button>
        </div>
      ) : wsUrl ? (
        // Live dashboard
        <MarketDashboard stream={stream} onLogout={handleLogout} />
      ) : null}
    </div>
  );
}
