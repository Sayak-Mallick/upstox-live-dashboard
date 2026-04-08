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
    if (!seriesRef.current) return;

    const data = trades.map((t) => ({
      time: (Math.floor(t.time / 1000)) as Time,
      value: t.price,
    }));

    seriesRef.current.setData(data);
  }, [trades]);

  return <div ref={chartRef} />;
};

export default Chart;
