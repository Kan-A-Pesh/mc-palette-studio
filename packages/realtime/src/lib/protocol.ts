import { createHmac, timingSafeEqual } from "crypto";
import type { EmitMessage } from "./types";

function computeSignature(payloadStr: string, secretKey: string): Buffer {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(payloadStr);
  return hmac.digest();
}

export function createFrame(message: EmitMessage, secretKey: string): Buffer {
  const payloadStr = JSON.stringify(message);
  const payloadBuf = Buffer.from(payloadStr, "utf-8");

  const signature = computeSignature(payloadStr, secretKey);

  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(payloadBuf.length);

  return Buffer.concat([lengthBuf, payloadBuf, signature]);
}

export interface ParseResult {
  message: EmitMessage;
  remaining: Buffer;
}

export function parseFrame(
  buffer: Buffer,
  secretKey: string,
): ParseResult | null {
  if (buffer.length < 4) return null;

  const payloadLength = buffer.readUInt32BE(0);
  const totalLength = 4 + payloadLength + 32;

  if (buffer.length < totalLength) return null;

  const payloadBuf = buffer.subarray(4, 4 + payloadLength);
  const signatureBuf = buffer.subarray(4 + payloadLength, totalLength);
  const payloadStr = payloadBuf.toString("utf-8");

  const expected = computeSignature(payloadStr, secretKey);

  if (signatureBuf.length !== expected.length) {
    throw new Error("Invalid signature length");
  }

  if (!timingSafeEqual(signatureBuf, expected)) {
    throw new Error("Invalid signature");
  }

  const message = JSON.parse(payloadStr) as EmitMessage;
  const remaining = buffer.subarray(totalLength);

  return { message, remaining };
}
