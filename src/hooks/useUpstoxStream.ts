// hooks/useUpstoxStream.ts
import { useEffect, useState, useCallback } from "react";
import upstoxWS from "../services/upstoxWS";
import type { FeedResponse, Feed, LTPC } from "../services/protobufDecoder";

export interface TickData {
  key: string;
  ltp: number;
  cp: number;
  ltt: number;
  ltq: number;
  change: number;
  changePct: number;
  atp?: number;
  vtt?: number;
  oi?: number;
  iv?: number;
  tbq?: number;
  tsq?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  high?: number;
  low?: number;
  open?: number;
  history: { time: number; price: number }[];
}

export interface StreamState {
  ticks: Record<string, TickData>;
  marketStatus: Record<string, string>;
  lastUpdateTs: number;
  isConnected: boolean;
  feedType: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: "PRE_OPEN",
  1: "PRE_OPEN_END",
  2: "OPEN",
  3: "CLOSED",
  4: "CLOSING",
  5: "CLOSED",
};

function extractLTPC(feed: Feed): LTPC | undefined {
  return (
    feed.ltpc || feed.fullFeed?.marketFF?.ltpc || feed.fullFeed?.indexFF?.ltpc
  );
}

export const useUpstoxStream = (url?: string): StreamState => {
  const [state, setState] = useState<StreamState>({
    ticks: {},
    marketStatus: {},
    lastUpdateTs: 0,
    isConnected: false,
    feedType: "",
  });

  const handleMessage = useCallback((response: FeedResponse) => {
    const typeLabel =
      response.type === 0
        ? "initial_feed"
        : response.type === 1
          ? "live_feed"
          : "market_info";

    setState((prev) => {
      const nextTicks = { ...prev.ticks };

      // Process feeds
      for (const [key, feed] of Object.entries(response.feeds)) {
        const ltpc = extractLTPC(feed);
        if (!ltpc) continue;

        const mff = feed.fullFeed?.marketFF;
        const iff = feed.fullFeed?.indexFF;

        // Get daily OHLC
        const ohlcList = mff?.marketOHLC?.ohlc || iff?.marketOHLC?.ohlc || [];
        const dailyOHLC = ohlcList.find((o) => o.interval === "1d");

        const existing = nextTicks[key];
        const history = existing?.history || [];

        // Keep last 60 price points for chart
        const newHistory = [
          ...history.slice(-59),
          { time: Date.now(), price: ltpc.ltp },
        ];

        const change = ltpc.ltp - ltpc.cp;
        const changePct = ltpc.cp > 0 ? (change / ltpc.cp) * 100 : 0;

        nextTicks[key] = {
          key,
          ltp: ltpc.ltp,
          cp: ltpc.cp,
          ltt: ltpc.ltt,
          ltq: ltpc.ltq,
          change,
          changePct,
          atp: mff?.atp,
          vtt: mff?.vtt,
          oi: mff?.oi,
          iv: mff?.iv,
          tbq: mff?.tbq,
          tsq: mff?.tsq,
          delta: mff?.optionGreeks?.delta,
          gamma: mff?.optionGreeks?.gamma,
          theta: mff?.optionGreeks?.theta,
          vega: mff?.optionGreeks?.vega,
          high: dailyOHLC?.high,
          low: dailyOHLC?.low,
          open: dailyOHLC?.open,
          history: newHistory,
        };
      }

      // Process market info
      const marketStatus: Record<string, string> = {};
      if (response.marketInfo?.segmentStatus) {
        for (const [seg, status] of Object.entries(
          response.marketInfo.segmentStatus,
        )) {
          marketStatus[seg] = STATUS_LABELS[status] || String(status);
        }
      }

      return {
        ticks: nextTicks,
        marketStatus:
          Object.keys(marketStatus).length > 0
            ? marketStatus
            : prev.marketStatus,
        lastUpdateTs: response.currentTs || Date.now(),
        isConnected: true,
        feedType: typeLabel,
      };
    });
  }, []);

  useEffect(() => {
    if (!url) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, isConnected: false }));
    upstoxWS.connect(url, handleMessage);

    return () => {
      upstoxWS.disconnect();
    };
  }, [url, handleMessage]);

  return state;
};
