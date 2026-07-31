import { type IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";

export function toWebReq(req: IncomingMessage): Request {
  let protocol = "http";
  if (req.socket instanceof TLSSocket) {
    protocol = "https";
  }

  const url = `${protocol}://${req.headers.host}${req.url}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const val of value) {
        headers.append(key, val);
      }
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }


  const init: RequestInit = {
    method: req.method,
    headers: req.headers as Record<string, string>,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url, init);
}
