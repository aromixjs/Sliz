import { createServer } from "node:http";
import { toWebReq } from "./toWeb";
import { createHash } from "node:crypto";
import { handleActiveSocket } from "./handle";

const server = createServer();
const guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"



server.addListener("request", (req, res) => {
  res.writeHead(200);
  res.end("HTTP Server OK");
});

server.addListener("upgrade", (req, socket, head) => {
  const webReq = toWebReq(req);
  const clientKey = webReq.headers.get("sec-websocket-key");

  // Validate request
  if (!clientKey || webReq.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const acceptKey = createHash("sha1")
    .update(clientKey + guid)
    .digest("base64");

  // 2. Build HTTP 101 Response
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "\r\n" // Crucial empty line to mark end of HTTP response
  ].join("\r\n");

  socket.write(headers);


  handleActiveSocket(socket, head)


});

server.listen(3000, () => {
  console.log('Server running on http://127.0.0.1:3000');
});