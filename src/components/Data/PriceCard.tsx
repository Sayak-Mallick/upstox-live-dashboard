import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Card, CardContent, Typography } from "@mui/material";

const PriceCard = () => {
  const price = useSelector((state: RootState) => state.crypto.price);

  return (
    <Card sx={{ bgcolor: "#121212", color: "#fff" }}>
      <CardContent>
        <Typography variant="h6">BTC/USDT</Typography>
        <Typography variant="h4">${price.toFixed(2)}</Typography>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
