export interface LTPC {
  ltp: number;
  ltt: number;
  ltq: number;
  cp: number;
}

export interface Quote {
  bidQ: number;
  bidP: number;
  askQ: number;
  askP: number;
}

export interface OHLC {
  interval: string;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
  ts: number;
}

export interface OptionGreeks {
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
  rho: number;
}

export interface MarketFullFeed {
  ltpc?: LTPC;
  marketLevel?: { bidAskQuote: Quote[] };
  optionGreeks?: OptionGreeks;
  marketOHLC?: { ohlc: OHLC[] };
  atp?: number;
  vtt?: number;
  oi?: number;
  iv?: number;
  tbq?: number;
  tsq?: number;
}

export interface IndexFullFeed {
  ltpc?: LTPC;
  marketOHLC?: { ohlc: OHLC[] };
}

export interface Feed {
  ltpc?: LTPC;
  fullFeed?: {
    marketFF?: MarketFullFeed;
    indexFF?: IndexFullFeed;
  };
  requestMode?: number;
}

export interface FeedResponse {
  type: number; // 0=initial_feed, 1=live_feed, 2=market_info
  feeds: Record<string, Feed>;
  currentTs: number;
  marketInfo?: {
    segmentStatus: Record<string, number>;
  };
}

// ─── Protobuf wire-type parser ───────────────────────────────────────────────

class ProtoReader {
  private buf: Uint8Array;
  private pos: number;

  constructor(buf: Uint8Array) {
    this.buf = buf;
    this.pos = 0;
  }

  get length() {
    return this.buf.length;
  }

  get position() {
    return this.pos;
  }

  eof() {
    return this.pos >= this.buf.length;
  }

  readVarint(): number {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = this.buf[this.pos++];
      result |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  }

  readVarint64(): number {
    // For int64, we lose precision for very large numbers but that's fine for timestamps
    let lo = 0;
    let hi = 0;
    let shift = 0;
    for (let i = 0; i < 10; i++) {
      const byte = this.buf[this.pos++];
      if (shift < 32) {
        lo |= (byte & 0x7f) << shift;
      } else {
        hi |= (byte & 0x7f) << (shift - 32);
      }
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return hi * 0x100000000 + (lo >>> 0);
  }

  readFixed64(): number {
    let lo = 0;
    let hi = 0;
    for (let i = 0; i < 4; i++) lo |= this.buf[this.pos++] << (i * 8);
    for (let i = 0; i < 4; i++) hi |= this.buf[this.pos++] << (i * 8);
    return hi * 0x100000000 + (lo >>> 0);
  }

  readDouble(): number {
    const bytes = this.buf.slice(this.pos, this.pos + 8);
    this.pos += 8;
    const view = new DataView(bytes.buffer, bytes.byteOffset, 8);
    return view.getFloat64(0, true);
  }

  readBytes(): Uint8Array {
    const len = this.readVarint();
    const result = this.buf.slice(this.pos, this.pos + len);
    this.pos += len;
    return result;
  }

  readString(): string {
    const bytes = this.readBytes();
    return new TextDecoder().decode(bytes);
  }

  readTag(): { fieldNumber: number; wireType: number } {
    const tag = this.readVarint();
    return { fieldNumber: tag >>> 3, wireType: tag & 0x7 };
  }

  skip(wireType: number) {
    switch (wireType) {
      case 0:
        this.readVarint();
        break;
      case 1:
        this.pos += 8;
        break;
      case 2:
        this.pos += this.readVarint();
        break;
      case 5:
        this.pos += 4;
        break;
      default:
        throw new Error(`Unknown wire type: ${wireType}`);
    }
  }

  subReader(len: number): ProtoReader {
    const sub = new ProtoReader(this.buf.slice(this.pos, this.pos + len));
    this.pos += len;
    return sub;
  }
}

// ─── Field decoders ──────────────────────────────────────────────────────────

function decodeLTPC(reader: ProtoReader): LTPC {
  const ltpc: LTPC = { ltp: 0, ltt: 0, ltq: 0, cp: 0 };
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        ltpc.ltp = reader.readDouble();
        break;
      case 2:
        ltpc.ltt = reader.readVarint64();
        break;
      case 3:
        ltpc.ltq = reader.readVarint64();
        break;
      case 4:
        ltpc.cp = reader.readDouble();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return ltpc;
}

function decodeQuote(reader: ProtoReader): Quote {
  const q: Quote = { bidQ: 0, bidP: 0, askQ: 0, askP: 0 };
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        q.bidQ = reader.readVarint64();
        break;
      case 2:
        q.bidP = reader.readDouble();
        break;
      case 3:
        q.askQ = reader.readVarint64();
        break;
      case 4:
        q.askP = reader.readDouble();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return q;
}

function decodeOHLC(reader: ProtoReader): OHLC {
  const o: OHLC = {
    interval: "",
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    vol: 0,
    ts: 0,
  };
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        o.interval = reader.readString();
        break;
      case 2:
        o.open = reader.readDouble();
        break;
      case 3:
        o.high = reader.readDouble();
        break;
      case 4:
        o.low = reader.readDouble();
        break;
      case 5:
        o.close = reader.readDouble();
        break;
      case 6:
        o.vol = reader.readVarint64();
        break;
      case 7:
        o.ts = reader.readVarint64();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return o;
}

function decodeOptionGreeks(reader: ProtoReader): OptionGreeks {
  const g: OptionGreeks = { delta: 0, theta: 0, gamma: 0, vega: 0, rho: 0 };
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        g.delta = reader.readDouble();
        break;
      case 2:
        g.theta = reader.readDouble();
        break;
      case 3:
        g.gamma = reader.readDouble();
        break;
      case 4:
        g.vega = reader.readDouble();
        break;
      case 5:
        g.rho = reader.readDouble();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return g;
}

function decodeMarketFullFeed(reader: ProtoReader): MarketFullFeed {
  const mff: MarketFullFeed = {};
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        mff.ltpc = decodeLTPC(reader.subReader(reader.readVarint()));
        break;
      case 2: {
        const lvl = reader.subReader(reader.readVarint());
        if (!mff.marketLevel) mff.marketLevel = { bidAskQuote: [] };
        while (!lvl.eof()) {
          const { fieldNumber: f2, wireType: w2 } = lvl.readTag();
          if (f2 === 1)
            mff.marketLevel.bidAskQuote.push(
              decodeQuote(lvl.subReader(lvl.readVarint())),
            );
          else lvl.skip(w2);
        }
        break;
      }
      case 3:
        mff.optionGreeks = decodeOptionGreeks(
          reader.subReader(reader.readVarint()),
        );
        break;
      case 4: {
        const ohlcMsg = reader.subReader(reader.readVarint());
        if (!mff.marketOHLC) mff.marketOHLC = { ohlc: [] };
        while (!ohlcMsg.eof()) {
          const { fieldNumber: f2, wireType: w2 } = ohlcMsg.readTag();
          if (f2 === 1)
            mff.marketOHLC.ohlc.push(
              decodeOHLC(ohlcMsg.subReader(ohlcMsg.readVarint())),
            );
          else ohlcMsg.skip(w2);
        }
        break;
      }
      case 5:
        mff.atp = reader.readDouble();
        break;
      case 6:
        mff.vtt = reader.readVarint64();
        break;
      case 7:
        mff.oi = reader.readDouble();
        break;
      case 8:
        mff.iv = reader.readDouble();
        break;
      case 9:
        mff.tbq = reader.readDouble();
        break;
      case 10:
        mff.tsq = reader.readDouble();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return mff;
}

function decodeIndexFullFeed(reader: ProtoReader): IndexFullFeed {
  const iff: IndexFullFeed = {};
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        iff.ltpc = decodeLTPC(reader.subReader(reader.readVarint()));
        break;
      case 2: {
        const ohlcMsg = reader.subReader(reader.readVarint());
        if (!iff.marketOHLC) iff.marketOHLC = { ohlc: [] };
        while (!ohlcMsg.eof()) {
          const { fieldNumber: f2, wireType: w2 } = ohlcMsg.readTag();
          if (f2 === 1)
            iff.marketOHLC.ohlc.push(
              decodeOHLC(ohlcMsg.subReader(ohlcMsg.readVarint())),
            );
          else ohlcMsg.skip(w2);
        }
        break;
      }
      default:
        reader.skip(wireType);
    }
  }
  return iff;
}

function decodeFullFeed(reader: ProtoReader): Feed["fullFeed"] {
  const ff: Feed["fullFeed"] = {};
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        ff!.marketFF = decodeMarketFullFeed(
          reader.subReader(reader.readVarint()),
        );
        break;
      case 2:
        ff!.indexFF = decodeIndexFullFeed(
          reader.subReader(reader.readVarint()),
        );
        break;
      default:
        reader.skip(wireType);
    }
  }
  return ff;
}

function decodeFeed(reader: ProtoReader): Feed {
  const feed: Feed = {};
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        feed.ltpc = decodeLTPC(reader.subReader(reader.readVarint()));
        break;
      case 2:
        feed.fullFeed = decodeFullFeed(reader.subReader(reader.readVarint()));
        break;
      case 4:
        feed.requestMode = reader.readVarint();
        break;
      default:
        reader.skip(wireType);
    }
  }
  return feed;
}

function decodeMarketInfo(reader: ProtoReader): FeedResponse["marketInfo"] {
  const mi: FeedResponse["marketInfo"] = { segmentStatus: {} };
  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    if (fieldNumber === 1 && wireType === 2) {
      const mapReader = reader.subReader(reader.readVarint());
      let key = "";
      let val = 0;
      while (!mapReader.eof()) {
        const { fieldNumber: f2, wireType: w2 } = mapReader.readTag();
        if (f2 === 1) key = mapReader.readString();
        else if (f2 === 2) val = mapReader.readVarint();
        else mapReader.skip(w2);
      }
      mi!.segmentStatus[key] = val;
    } else {
      reader.skip(wireType);
    }
  }
  return mi;
}

// ─── Main decode function ─────────────────────────────────────────────────────

export function decodeFeedResponse(buffer: ArrayBuffer): FeedResponse {
  const reader = new ProtoReader(new Uint8Array(buffer));
  const response: FeedResponse = {
    type: 0,
    feeds: {},
    currentTs: 0,
  };

  while (!reader.eof()) {
    const { fieldNumber, wireType } = reader.readTag();
    switch (fieldNumber) {
      case 1:
        response.type = reader.readVarint();
        break;
      case 2: {
        // map<string, Feed>
        const mapReader = reader.subReader(reader.readVarint());
        let key = "";
        let feedData: Feed = {};
        while (!mapReader.eof()) {
          const { fieldNumber: f2, wireType: w2 } = mapReader.readTag();
          if (f2 === 1) key = mapReader.readString();
          else if (f2 === 2)
            feedData = decodeFeed(mapReader.subReader(mapReader.readVarint()));
          else mapReader.skip(w2);
        }
        if (key) response.feeds[key] = feedData;
        break;
      }
      case 3:
        response.currentTs = reader.readVarint64();
        break;
      case 4:
        response.marketInfo = decodeMarketInfo(
          reader.subReader(reader.readVarint()),
        );
        break;
      default:
        reader.skip(wireType);
    }
  }

  return response;
}

export const MARKET_STATUS_LABELS: Record<number, string> = {
  0: "PRE_OPEN_START",
  1: "PRE_OPEN_END",
  2: "NORMAL_OPEN",
  3: "NORMAL_CLOSE",
  4: "CLOSING_START",
  5: "CLOSING_END",
};

export const FEED_TYPE_LABELS: Record<number, string> = {
  0: "initial_feed",
  1: "live_feed",
  2: "market_info",
};
