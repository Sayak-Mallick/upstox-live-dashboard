import protobuf from "protobufjs";

let root: protobuf.Root;

export const loadProto = async () => {
  root = await protobuf.load("/marketdata.proto");
};

export const decodeMessage = (buffer: ArrayBuffer) => {
  const message = root.lookupType("FeedResponse");
  const decoded = message.decode(new Uint8Array(buffer));
  return message.toObject(decoded);
};
