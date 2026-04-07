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
    <div className="min-h-screen bg-dashboard-dark p-6 text-white">
      <div className="max-w-3xl mx-auto bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        {/* Adjusted Grid to 4 Columns for the Graph */}
        <div className="grid grid-cols-4 p-4 bg-gray-800/50 text-xs font-bold uppercase tracking-wider text-gray-400">
          <div>Symbol</div>
          <div className="text-center">Trend</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
        </div>

        {mockStocks.map((stock) => {
          const isPositive = stock.change >= 0;
          const brandColor = isPositive ? "#00d09c" : "#eb5b3c";

          return (
            <div
              key={stock.id}
              className="grid grid-cols-4 items-center p-4 border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
            >
              <div className="font-semibold text-gray-100">{stock.symbol}</div>

              {/* The Graph Column */}
              <div className="flex justify-center">
                <StockTrend data={stock.trend} color={brandColor} />
              </div>

              <div className="text-right font-mono text-gray-100">
                ₹{stock.price}
              </div>

              <div
                className={`text-right font-medium ${
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
  );
}
