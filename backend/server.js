// backend/server.js

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = "aa44ca15-14e2-4fd1-9b4b-159cd0203647";
const CLIENT_SECRET = "gszqvjj7me";
const REDIRECT_URI = "http://localhost:5173/";
const state = "sayak";

app.get("/login-url", (req, res) => {
  const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;
  res.json({ url });
});

app.post("/get-token", async (req, res) => {
  try {
    const { code } = req.body;

    const response = await fetch(
      "https://api.upstox.com/v2/login/authorization/token",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Token fetch failed" });
  }
});

app.get("/ws-url", async (req, res) => {
  try {
    const { token } = req.query;

    const response = await fetch(
      "https://api.upstox.com/v3/feed/market-data-feed/authorize",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "WS URL fetch failed" });
  }
});

app.listen(5000, () => console.log("Backend running on 5000"));