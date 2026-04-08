import { useEffect } from "react";
import { useDispatch } from "react-redux";
import WebSocketManager from "../services/websocketManager";
import { updateTrade } from "../store/Slice/cryptoSlice";

const socket = new WebSocketManager(
  "wss://stream.binance.com:9443/ws/btcusdt@trade"
);

interface BinanceTradeMessage {
  p: string;
  T: number;
}

export const useCryptoStream = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();

    const handler = (data: unknown) => {
      const tradeData = data as BinanceTradeMessage;
      const trade = {
        price: parseFloat(tradeData.p),
        time: tradeData.T,
      };

      dispatch(updateTrade(trade));
    };

    socket.subscribe(handler);

    return () => {
      socket.unsubscribe(handler);
    };
  }, [dispatch]);
};
