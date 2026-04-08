import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { List, ListItem, Typography } from "@mui/material";

const TradeFeed = () => {
  const trades = useSelector((state: RootState) => state.crypto.trades);

  return (
    <List sx={{ maxHeight: 300, overflow: "auto" }}>
      {trades.map((trade, index) => (
        <ListItem key={index}>
          <Typography>
            ${trade.price.toFixed(2)} -{" "}
            {new Date(trade.time).toLocaleTimeString()}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
};

export default TradeFeed;
