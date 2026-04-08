import { useEffect, useState } from "react";
import { getAuthCode } from "../utils/auth";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const code = getAuthCode();

      if (!code) return;

      console.log("Auth Code:", code);

      // Step 1: exchange code → token
      const res = await fetch("http://localhost:5000/get-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      console.log("Access Token:", data.access_token);

      setToken(data.access_token);

      // Optional: store token
      localStorage.setItem("access_token", data.access_token);
    };

    initAuth();
  }, []);

  return token;
};
