import StockTrend from "./StockTrend";

export default function Stocks() {
  // Mock data with trend arrays
  const mockStocks = [
    {
      id: 1,
      symbol: "RELIANCE",
      price: "2,950.40",
      change: 1.2,
      trend: [
        { price: 2900 },
        { price: 2920 },
        { price: 2910 },
        { price: 2950 },
      ],
    },
    {
      id: 2,
      symbol: "TCS",
      price: "4,120.15",
      change: -0.45,
      trend: [
        { price: 4150 },
        { price: 4130 },
        { price: 4140 },
        { price: 4120 },
      ],
    },
    {
      id: 3,
      symbol: "GOLD 26JUN", // MCX_FO|559933
      price: "72,450.00",
      change: 0.85,
      trend: [
        { price: 71800 },
        { price: 72100 },
        { price: 72300 },
        { price: 72450 },
      ],
    },
    {
      id: 4,
      symbol: "SILVER 05JUL", // MCX_FO|486502
      price: "91,200.00",
      change: -1.25,
      trend: [
        { price: 92500 },
        { price: 91800 },
        { price: 91500 },
        { price: 91200 },
      ],
    },
    {
      id: 5,
      symbol: "CRUDEOIL 19MAY", // MCX_FO|457533
      price: "6,840.00",
      change: 2.1,
      trend: [
        { price: 6600 },
        { price: 6720 },
        { price: 6790 },
        { price: 6840 },
      ],
    },
    {
      id: 6,
      symbol: "NIFTY 50", // NSE_FO
      price: "22,514.65",
      change: 0.35,
      trend: [
        { price: 22400 },
        { price: 22480 },
        { price: 22450 },
        { price: 22514 },
      ],
    },
    {
      id: 7,
      symbol: "HDFC BANK",
      price: "1,520.40",
      change: -0.2,
      trend: [
        { price: 1530 },
        { price: 1525 },
        { price: 1528 },
        { price: 1520 },
      ],
    },
    {
      id: 8,
      symbol: "INFY",
      price: "1,415.00",
      change: -2.4,
      trend: [
        { price: 1450 },
        { price: 1440 },
        { price: 1430 },
        { price: 1415 },
      ],
    },
    {
      id: 9,
      symbol: "ICICI BANK",
      price: "1,105.20",
      change: 1.15,
      trend: [
        { price: 1080 },
        { price: 1095 },
        { price: 1100 },
        { price: 1105 },
      ],
    },
    {
      id: 10,
      symbol: "ZOMATO",
      price: "188.45",
      change: 4.2,
      trend: [{ price: 175 }, { price: 180 }, { price: 182 }, { price: 188 }],
    },
  ];

  return (
    <div className="min-h-screen bg-dashboard-dark text-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Live Status */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Market Watch
          </h1>
          <div className="flex items-center gap-2 bg-upstox-green/10 px-3 py-1 rounded-full border border-upstox-green/20">
            <div className="w-2 h-2 bg-upstox-green rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-upstox-green uppercase">
              Live Feed
            </span>
          </div>

          {/* Stock List */}
          <div className="grid gap-2">
            {mockStocks.map((stock) => {
              const isPositive = stock.change >= 0;

              return (
                <div
                  key={stock.id}
                  // UTILIZING CUSTOM ANIMATION: Logic to trigger flash on price change
                  className={`grid grid-cols-4 items-center p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all 
                  ${stock.id === 1 ? "animate-flash-green" : ""} 
                `}
                >
                  {/* Symbol Info */}
                  <div className="flex flex-col">
                    <span className="text-white font-semibold tracking-wide">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      EQ | NSE
                    </span>
                  </div>

                  {/* Graph Utilization */}
                  <div className="flex justify-center">
                    <StockTrend
                      data={stock.trend}
                      color={
                        isPositive
                          ? "var(--color-upstox-green)"
                          : "var(--color-upstox-red)"
                      }
                    />
                  </div>

                  {/* Price - Using Monospace for stability */}
                  <div className="text-right font-mono text-white text-lg">
                    ₹{stock.price}
                  </div>

                  {/* Change Percentage */}
                  <div
                    className={`text-right font-bold text-sm ${
                      isPositive ? "text-upstox-green" : "text-upstox-red"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {stock.change}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
