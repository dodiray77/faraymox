import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { getInterfaceTraffic } from "./src/lib/mikrotik.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`Client terhubung: ${socket.id}`);

    // Contoh: Menerima event dari client (misal: minta data trafik)
    socket.on("request-traffic", (interfaceId) => {
      console.log(`Client meminta trafik untuk: ${interfaceId}`);
      // Simulasi mengirim data berkala ke client setiap 2 detik
      const interval = setInterval(async () => {
        try {
          const data = await getInterfaceTraffic(interfaceId);
          socket.emit("traffic-update", data);
        } catch (error) {
          console.error("Gagal mengambil traffic:", error);
          socket.emit("traffic-update", null);
        }
      }, 2000);

      socket.on("disconnect", () => {
        clearInterval(interval);
        console.log(`Client terputus dari trafik: ${socket.id}`);
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client terputus: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
