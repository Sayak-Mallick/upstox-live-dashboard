

class UpstoxWS {
  private ws: WebSocket | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect(url: string, onMessage: (data: any) => void) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("✅ Connected to Upstox");

      this.subscribe();
    };

    this.ws.onmessage = (event) => {
      onMessage(event.data); // binary
    };

    this.ws.onclose = () => {
      console.warn("Reconnecting...");
    };
  }

  subscribe() {
    const msg = {
      guid: "test-guid",
      method: "sub",
      data: {
        mode: "ltpc",
        instrumentKeys: [
          "MCX_FO|559933",
          "MCX_FO|486502",
          "MCX_FO|457533",
          "NSE_FO|Nifty 50",
        ],
      },
    };

    this.ws?.send(JSON.stringify(msg));
  }
}

export default new UpstoxWS();
