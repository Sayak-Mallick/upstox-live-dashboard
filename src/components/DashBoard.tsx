import React from "react";
import { useCryptoStream } from "../hooks/useCryptoStream";
import PriceCard from "./Data/PriceCard";
import TradeFeed from "./Data/TradeFeed";
import Chart from "./Data/Chart";
import { Container, Grid } from "@mui/material";

const MemoizedChart = React.memo(Chart);
const MemoizedTradeFeed = React.memo(TradeFeed);

const Dashboard = () => {
  useCryptoStream();

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PriceCard />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <MemoizedChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MemoizedTradeFeed />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
