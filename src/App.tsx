// App.tsx

import { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import { useAuth } from "./hooks/useAuth";
import { fetchWsUrl } from "./services/getWsUrl";
import { useUpstoxStream } from "./hooks/useUpStoxStream";
import { logout } from "./utils/auth";

export default function App() {
  const token = useAuth();
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  useEffect(() => {
    const initWs = async () => {
      if (!token) return;
      const url = await fetchWsUrl(token);
      console.log("WS URL:", url);
      setWsUrl(url);
    };

    initWs();
  }, [token]);

  // Start streaming
  useUpstoxStream(wsUrl!);

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {!token ? (
        <LoginButton />
      ) : (
        <>
          <h2>Connected to Upstox 🚀</h2>
          <button
            onClick={handleLogout}
            style={{ marginTop: "10px", color: "red" }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
