# Upstox Live Market Feed — Full Setup Guide

## Overview

This project streams real-time market data from Upstox using WebSocket V3.  
It decodes **protobuf binary** data manually (no external protobuf library needed) and renders it as a live dashboard with charts.

---

## Architecture

```
OAuth Login → Access Token
     ↓
GET /v3/feed/market-data-feed/authorize → WSS URL
     ↓
WebSocket Connection (binary / arraybuffer)
     ↓
Protobuf Decode (protobufDecoder.ts) → FeedResponse JSON
     ↓
useUpstoxStream hook → TickData state
     ↓
MarketDashboard component (Recharts + Tailwind)
```

---

## File Structure

### Backend

```
backend/
└── server.js         ← Express: login-url, get-token, ws-url endpoints
```

### Frontend (src/)

```
src/
├── App.tsx                         ← Root — wires auth + WS + dashboard
├── hooks/
│   ├── useAuth.ts                  ← OAuth code → access token
│   └── useUpstoxStream.ts          ← WebSocket state → TickData[]
├── services/
│   ├── upstoxWS.ts                 ← WebSocket client (binary, reconnect)
│   ├── protobufDecoder.ts          ← Manual protobuf → JSON decoder
│   ├── auth.ts                     ← redirectToLogin()
│   └── getWsUrl.ts                 ← Fetch WSS URL from backend
├── components/
│   ├── LoginButton.tsx             ← Login screen
│   └── MarketDashboard.tsx         ← Live dashboard + charts
└── utils/
    └── auth.ts                     ← getAuthCode(), logout()
```

---

## Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install express cors

# Frontend
npm install recharts
```

> **No protobuf library needed** — decoder is hand-written from the V3 proto schema.

### 2. Start backend

```bash
cd backend
node server.js
# → Running on http://localhost:5000
```

### 3. Start frontend

```bash
npm run dev
# → Running on http://localhost:5173
```

### 4. Login

- Click **Login with Upstox**
- You'll be redirected to Upstox OAuth
- After approval, you'll return to the app automatically
- The access token is exchanged and stored in localStorage

---

## Subscribed Instruments

Defined in `upstoxWS.ts`:

```
MCX_FO|559933
MCX_FO|486502
MCX_FO|457533
NSE_FO|Nifty 50
```

Mode: **full** (LTPC + depth + OHLC + option greeks)

---

## Protobuf Decoder

`protobufDecoder.ts` is a hand-rolled wire-format parser based on the official Upstox proto schema:
https://assets.upstox.com/feed/market-data-feed/v3/MarketDataFeed.proto

It decodes:

- `FeedResponse` → type, feeds, currentTs, marketInfo
- `Feed` → ltpc, fullFeed (marketFF / indexFF)
- `LTPC` → ltp, ltt, ltq, cp
- `MarketFullFeed` → ltpc, marketLevel, optionGreeks, marketOHLC, atp, vtt, oi, iv, tbq, tsq
- `IndexFullFeed` → ltpc, marketOHLC
- `OHLC` → interval, open, high, low, close, vol, ts
- `OptionGreeks` → delta, theta, gamma, vega, rho
- `MarketInfo` → segmentStatus map

---

## Key Notes

1. **Binary type**: `ws.binaryType = "arraybuffer"` — required for protobuf decode
2. **Subscription format**: Must be sent as binary (`TextEncoder → ArrayBuffer`)
3. **V3 only**: V2 was discontinued August 22, 2025
4. **Reconnect**: Auto-reconnects up to 5 times with 3s delay
5. **Token**: Stored in localStorage; cleared on logout

---

## Dashboard Features

- Live LTP with color-coded change (green = up, red = down)
- Sparkline chart on each instrument card
- Full price history chart (last 60 ticks)
- Daily OHLC, Volume, OI, IV stats
- Option Greeks panel (Delta, Gamma, Theta, Vega)
- Market segment status bar
- Auto-updates in real-time — no refresh needed
