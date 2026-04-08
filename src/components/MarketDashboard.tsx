/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { StreamState, TickData } from "../hooks/useUpstoxStream";

interface Props {
  stream: StreamState;
  onLogout: () => void;
}

function fmt(n?: number, decimals = 2): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function shortKey(key: string): string {
  return key.split("|")[1] || key;
}

function timeLabel(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Mini Sparkline ──────────────────────────────────────────────────────────

function Sparkline({
  data,
  color,
}: {
  data: { time: number; price: number }[];
  color: string;
}) {
  if (data.length < 2)
    return (
      <div className="h-12 flex items-center justify-center text-xs text-white/20">
        Waiting for data...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Full Price Chart ─────────────────────────────────────────────────────────

function PriceChart({ tick }: { tick: TickData }) {
  const color = tick.change >= 0 ? "#10b981" : "#f43f5e";

  if (tick.history.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-white/30">
        Accumulating price history...
      </div>
    );
  }

  const formatted = tick.history.map((h) => ({
    ...h,
    label: timeLabel(h.time),
  }));

  return (
    <ResponsiveContainer width="100%" height={192}>
      <LineChart
        data={formatted}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt(v, 0)}
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: "#0f1117",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            fontSize: 11,
            color: "#fff",
          }}
          formatter={(v: any) => [fmt(v), "Price"]}
          labelFormatter={(l) => `Time: ${l}`}
        />
        <ReferenceLine
          y={tick.cp}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="4 4"
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Tick Card ────────────────────────────────────────────────────────────────

function TickCard({
  tick,
  selected,
  onClick,
}: {
  tick: TickData;
  selected: boolean;
  onClick: () => void;
}) {
  const up = tick.change >= 0;
  const color = up ? "text-emerald-400" : "text-rose-400";
  const bg = up
    ? "bg-emerald-500/8 border-emerald-500/20"
    : "bg-rose-500/8 border-rose-500/20";
  const sparkColor = up ? "#10b981" : "#f43f5e";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? "border-sky-500/40 bg-sky-500/8 ring-1 ring-sky-500/20"
          : "border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-white/90 tracking-wide leading-tight">
            {shortKey(tick.key)}
          </p>
          <p className="text-[9px] text-white/25 tracking-widest uppercase mt-0.5">
            {tick.key.split("|")[0]}
          </p>
        </div>
        <span
          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${bg} ${color} tracking-widest uppercase`}
        >
          {up ? "▲" : "▼"} {fmt(Math.abs(tick.changePct), 2)}%
        </span>
      </div>

      {/* LTP */}
      <div className="mb-3">
        <p className={`text-2xl font-bold tracking-tight ${color}`}>
          {fmt(tick.ltp)}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">
          Prev close: <span className="text-white/50">{fmt(tick.cp)}</span>
          {" · "}Chg:{" "}
          <span className={color}>
            {up ? "+" : ""}
            {fmt(tick.change)}
          </span>
        </p>
      </div>

      {/* Sparkline */}
      <Sparkline data={tick.history} color={sparkColor} />

      {/* Footer stats */}
      <div className="flex gap-3 mt-2">
        {tick.vtt !== undefined && (
          <div>
            <p className="text-[8px] text-white/20 uppercase tracking-widest">
              Vol
            </p>
            <p className="text-[10px] text-white/55">
              {(tick.vtt / 1000).toFixed(0)}K
            </p>
          </div>
        )}
        {tick.oi !== undefined && tick.oi > 0 && (
          <div>
            <p className="text-[8px] text-white/20 uppercase tracking-widest">
              OI
            </p>
            <p className="text-[10px] text-white/55">
              {(tick.oi / 1000).toFixed(0)}K
            </p>
          </div>
        )}
        {tick.iv !== undefined && tick.iv > 0 && (
          <div>
            <p className="text-[8px] text-white/20 uppercase tracking-widest">
              IV
            </p>
            <p className="text-[10px] text-white/55">{fmt(tick.iv, 1)}%</p>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ tick }: { tick: TickData }) {
  const up = tick.change >= 0;
  const color = up ? "text-emerald-400" : "text-rose-400";

  const stats = [
    { label: "LTP", value: fmt(tick.ltp) },
    { label: "Change", value: `${up ? "+" : ""}${fmt(tick.change)}`, color },
    { label: "Chg %", value: `${up ? "+" : ""}${fmt(tick.changePct)}%`, color },
    { label: "Prev Close", value: fmt(tick.cp) },
    { label: "Open", value: fmt(tick.open) },
    { label: "High", value: fmt(tick.high), color: "text-emerald-400" },
    { label: "Low", value: fmt(tick.low), color: "text-rose-400" },
    { label: "Avg Price", value: fmt(tick.atp) },
    {
      label: "Volume",
      value: tick.vtt !== undefined ? (tick.vtt / 1000).toFixed(0) + "K" : "—",
    },
    {
      label: "OI",
      value:
        tick.oi !== undefined && tick.oi > 0
          ? (tick.oi / 1000).toFixed(0) + "K"
          : "—",
    },
    {
      label: "IV",
      value: tick.iv !== undefined && tick.iv > 0 ? fmt(tick.iv, 1) + "%" : "—",
    },
    {
      label: "Buy Qty",
      value: tick.tbq !== undefined ? fmt(tick.tbq, 0) : "—",
      color: "text-emerald-400",
    },
    {
      label: "Sell Qty",
      value: tick.tsq !== undefined ? fmt(tick.tsq, 0) : "—",
      color: "text-rose-400",
    },
  ];

  const greeks = [
    { label: "Δ Delta", value: fmt(tick.delta, 4) },
    { label: "Γ Gamma", value: fmt(tick.gamma, 6) },
    { label: "Θ Theta", value: fmt(tick.theta, 4) },
    { label: "V Vega", value: fmt(tick.vega, 4) },
  ];

  const hasGreeks = tick.delta !== undefined && tick.delta !== 0;

  return (
    <div className="space-y-4">
      {/* Price chart */}
      <div className="bg-white/2 border border-white/8 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white/90">
              {shortKey(tick.key)}
            </p>
            <p className="text-[9px] text-white/30 tracking-widest uppercase">
              {tick.key.split("|")[0]}
            </p>
          </div>
          <p className={`text-xl font-bold ${color}`}>{fmt(tick.ltp)}</p>
        </div>
        <PriceChart tick={tick} />
      </div>

      {/* Stats grid */}
      <div className="bg-white/2 border border-white/8 rounded-xl p-4">
        <p className="text-[9px] text-white/25 tracking-widest uppercase mb-3">
          Market Data
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {stats.map(({ label, value, color: c }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[10px] text-white/30">{label}</span>
              <span
                className={`text-[10px] font-medium ${c || "text-white/70"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Option Greeks */}
      {hasGreeks && (
        <div className="bg-white/2 border border-white/8 rounded-xl p-4">
          <p className="text-[9px] text-white/25 tracking-widest uppercase mb-3">
            Option Greeks
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {greeks.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[10px] text-white/30">{label}</span>
                <span className="text-[10px] font-medium text-sky-400">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[9px] text-white/15 tracking-widest text-center uppercase">
        Last tick: {timeLabel(tick.ltt || Date.now())}
      </p>
    </div>
  );
}

// ── Market Status Bar ────────────────────────────────────────────────────────

function MarketStatusBar({ status }: { status: Record<string, string> }) {
  if (Object.keys(status).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-5 py-2.5 border-b border-white/5 bg-black/20">
      {Object.entries(status)
        .slice(0, 6)
        .map(([seg, st]) => (
          <span
            key={seg}
            className={`text-[8px] tracking-widest font-medium px-2 py-0.5 rounded border uppercase ${
              st === "OPEN"
                ? "border-emerald-600/40 bg-emerald-950/50 text-emerald-400"
                : "border-white/10 bg-white/3 text-white/30"
            }`}
          >
            {seg.replace("_", " ")} · {st}
          </span>
        ))}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function MarketDashboard({ stream, onLogout }: Props) {
  const ticks = Object.values(stream.ticks);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedTick = selectedKey
    ? stream.ticks[selectedKey]
    : ticks[0] || null;

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#080a0d] text-white font-mono">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
              Live Feed
            </span>
          </div>
          <span className="text-white/10">|</span>
          <span className="text-[9px] text-white/20 tracking-widest uppercase">
            {ticks.length} instruments
          </span>
          {stream.feedType && (
            <>
              <span className="text-white/10">|</span>
              <span className="text-[9px] text-sky-400/60 tracking-widest uppercase">
                {stream.feedType}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {stream.lastUpdateTs > 0 && (
            <span className="text-[9px] text-white/20 tracking-widest hidden sm:block">
              {timeLabel(stream.lastUpdateTs)}
            </span>
          )}
          <button
            onClick={onLogout}
            className="text-[9px] tracking-widest uppercase text-white/25 hover:text-rose-400 border border-white/8 hover:border-rose-800/50 px-2.5 py-1.5 rounded transition-all"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Market status */}
      <MarketStatusBar status={stream.marketStatus} />

      {ticks.length === 0 ? (
        /* Waiting state */
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border-t border-sky-400 animate-spin" />
          </div>
          <p className="text-xs tracking-[0.25em] text-white/30 uppercase">
            Waiting for market data
          </p>
          <p className="text-[9px] tracking-widest text-white/15 uppercase">
            Subscribed · Decoding protobuf
          </p>
        </div>
      ) : (
        /* Main layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Instrument list */}
          <div className="w-80 shrink-0 border-r border-white/5 overflow-y-auto p-3 space-y-2">
            {ticks.map((tick) => (
              <TickCard
                key={tick.key}
                tick={tick}
                selected={selectedTick?.key === tick.key}
                onClick={() => setSelectedKey(tick.key)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedTick ? (
              <DetailPanel tick={selectedTick} />
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-sm">
                Select an instrument
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
