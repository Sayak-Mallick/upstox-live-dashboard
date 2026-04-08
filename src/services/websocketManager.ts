type Subscriber = (data:string) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Set<Subscriber> = new Set();
  private url: string;
  private reconnectDelay = 2000;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      this.subscribers.forEach((cb) => cb(parsed));
    };

    this.ws.onclose = () => {
      console.warn("⚠️ Reconnecting...");
      this.ws = null;
      setTimeout(() => this.connect(), this.reconnectDelay);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
  }

  unsubscribe(cb: Subscriber) {
    this.subscribers.delete(cb);
  }
}

export default WebSocketManager;
