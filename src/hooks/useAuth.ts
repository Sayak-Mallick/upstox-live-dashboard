import { useEffect, useState } from "react";
import { getAuthCode } from "../utils/auth";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => {
    // Restore token from localStorage if already logged in
    return localStorage.getItem("access_token");
  });

  useEffect(() => {
    const initAuth = async () => {
      const code = getAuthCode();
      if (!code) return;

      console.log("🔑 Auth Code:", code);

      // Clean URL so code isn't re-used on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.toString());

      try {
        const res = await fetch("http://localhost:5000/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (data.access_token) {
          console.log("✅ Access Token received");
          localStorage.setItem("access_token", data.access_token);
          setToken(data.access_token);
        } else {
          console.error("Token error:", data);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };

    initAuth();
  }, []);

  return token;
};
