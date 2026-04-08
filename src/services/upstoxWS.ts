// services/upstoxWS.ts
import { decodeFeedResponse, type FeedResponse } from "./protobufDecoder";

type MessageHandler = (data: FeedResponse) => void;

class UpstoxWS {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string | null = null;
  private onMessageHandler: MessageHandler | null = null;
  private reconnectDelay = 3000;
  private maxRetries = 5;
  private retryCount = 0;

  private readonly INSTRUMENT_KEYS = [
    "MCX_FO|559933",
    "MCX_FO|486502",
    "MCX_FO|457533",
    "NSE_FO|Nifty 50",
  ];

  connect(url: string, onMessage: MessageHandler) {
    this.url = url;
    this.onMessageHandler = onMessage;
    this.retryCount = 0;
    this._connect();
  }

  private _connect() {
    if (!this.url) return;

    console.log("🔌 Connecting to Upstox WebSocket...");
    this.ws = new WebSocket(this.url);
    this.ws.binaryType = "arraybuffer"; // ← critical: receive binary as ArrayBuffer

    this.ws.onopen = () => {
      console.log("✅ Connected to Upstox WebSocket");
      this.retryCount = 0;
      this.subscribe();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        if (event.data instanceof ArrayBuffer) {
          // Binary protobuf message → decode
          const decoded = decodeFeedResponse(event.data);
          this.onMessageHandler?.(decoded);
        } else {
          // Text message (rare)
          console.log("Text message:", event.data);
        }
      } catch (err) {
        console.error("❌ Decode error:", err);
      }
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    this.ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      this.scheduleReconnect();
    };
  }

  subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const msg = {
      guid: crypto.randomUUID(),
      method: "sub",
      data: {
        mode: "full",
        instrumentKeys: this.INSTRUMENT_KEYS,
      },
    };

    // Must be sent as binary per Upstox V3 docs
    const encoded = new TextEncoder().encode(JSON.stringify(msg));
    this.ws.send(encoded.buffer);
    console.log("📡 Subscribed to instruments:", this.INSTRUMENT_KEYS);
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error("❌ Max reconnect attempts reached");
      return;
    }
    this.retryCount++;
    console.log(
      `🔄 Reconnecting in ${this.reconnectDelay / 1000}s (attempt ${this.retryCount}/${this.maxRetries})`,
    );
    this.reconnectTimer = setTimeout(() => {
      this._connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.url = null;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default new UpstoxWS();
