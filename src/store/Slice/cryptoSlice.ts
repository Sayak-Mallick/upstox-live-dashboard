import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Trade {
  price: number;
  time: number;
}

interface CryptoState {
  price: number;
  trades: Trade[];
}

const initialState: CryptoState = {
  price: 0,
  trades: [],
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updateTrade: (state, action: PayloadAction<Trade>) => {
      state.price = action.payload.price;
      state.trades.unshift(action.payload);

      if (state.trades.length > 50) {
        state.trades.pop();
      }
    },
  },
});

export const { updateTrade } = cryptoSlice.actions;
export default cryptoSlice.reducer;
