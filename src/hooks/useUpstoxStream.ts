// hooks/useUpstoxStream.ts

import { useEffect } from "react";
import upstoxWS from "../services/upstoxWS";
// import { decodeMessage } from "../services/protobufDecoder";

// hooks/useUpstoxStream.ts

export const useUpstoxStream = (url?: string) => {
  useEffect(() => {
    if (!url) return;

    upstoxWS.connect(url, (binary) => {
      console.log("Incoming:", binary);
    });
  }, [url]);
};