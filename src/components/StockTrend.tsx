import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  data: { price: number; time?: string }[];
  color: string;
}

const StockTrend = ({ data, color }: Props) => {
  return (
    <div className="h-12 w-32 group relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />

          {/* Custom Tooltip - Minimalist Style */}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-xl">
                    <p className="text-[10px] font-mono text-white">
                      ₹{payload[0].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{
              stroke: "#475569",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
            wrapperStyle={{ outline: "none" }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            isAnimationActive={true} // Animation looks better for static/initial load
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockTrend;
