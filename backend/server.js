const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const state = process.env.STATE;

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
