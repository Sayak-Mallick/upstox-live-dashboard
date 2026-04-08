import { useEffect, useRef } from "react";
import { createChart, type ISeriesApi, LineSeries, type Time } from "lightweight-charts";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const Chart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const trades = useSelector((state: RootState) => state.crypto.trades);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: 600,
      height: 300,
    });

    seriesRef.current = chart.addSeries(LineSeries);

    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!seriesRef.current || trades.length === 0) return;

    // trades are stored newest-first; lightweight-charts needs ascending order
    const sorted = [...trades].sort((a, b) => a.time - b.time);

    // Deduplicate by time (keep last occurrence for each second)
    const seen = new Map<number, number>();
    for (const t of sorted) {
      const key = Math.floor(t.time / 1000);
      seen.set(key, t.price);
    }

    const data = Array.from(seen.entries()).map(([time, value]) => ({
      time: time as Time,
      value,
    }));

    try {
      seriesRef.current.setData(data);
    } catch (e) {
      console.warn("Chart setData error:", e);
    }
  }, [trades]);

  return <div ref={chartRef} />;
};

export default Chart;
