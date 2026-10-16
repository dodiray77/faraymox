import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { connectMikrotik, getInterfaceTraffic } from "./src/lib/mikrotik.js";
// import { MikrotikService } from "@/lib/services/mikrotik.service.js"; // Aktifkan jika sudah beres path alias-nya

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST;
const port = process.env.PORT;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const activeIntervals = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // Perbaikan: Sekarang menerima string token 'deviceKey', bukan object deviceData mentah
  function manageTrafficPolling(deviceId, interfaceId) {
    const trackingKey = `${deviceId}:${interfaceId}`;
    const roomName = `traffic:${trackingKey}`;

    const room = io.sockets.adapter.rooms.get(roomName);
    const clientCount = room ? room.size : 0;

    if (clientCount > 0 && !activeIntervals.has(trackingKey)) {
      console.log(
        `[POLLING START] Mengamati ${interfaceId} pada Device ID: ${deviceId}`,
      );

      const fetchAndBroadcast = async () => {
        const currentRoom = io.sockets.adapter.rooms.get(roomName);
        if (!currentRoom || currentRoom.size === 0) {
          stopPolling(trackingKey);
          return;
        }
        try {
          const data = await getInterfaceTraffic(deviceId, interfaceId);
          io.to(roomName).emit("traffic-update", data);
        } catch (error) {
          console.error(`Gagal broadcast ${trackingKey}:`, error.message);
        }
      };

      fetchAndBroadcast();
      const intervalId = setInterval(fetchAndBroadcast, 2000);
      activeIntervals.set(trackingKey, intervalId);
    } else if (clientCount === 0 && activeIntervals.has(trackingKey)) {
      stopPolling(trackingKey);
    }
  }

  function stopPolling(trackingKey) {
    if (activeIntervals.has(trackingKey)) {
      clearInterval(activeIntervals.get(trackingKey));
      activeIntervals.delete(trackingKey);
      console.log(
        `[POLLING STOP] Dihentikan untuk kunci: ${trackingKey} (Room Kosong)`,
      );
    }
  }

  io.on("connection", (socket) => {
    console.log(`Client terhubung: ${socket.id}`);

    socket.on("request-traffic", async ({ deviceId, interfaceId }) => {
      if (!deviceId || !interfaceId) return;
      const newTrackingKey = `${deviceId}:${interfaceId}`;
      const newRoomName = `traffic:${newTrackingKey}`;

      const rooms = Array.from(socket.rooms);
      const currentTrafficRoom = rooms.find((r) => r.startsWith("traffic:"));
      if (currentTrafficRoom === newRoomName) return;

      // 1. Jika client ganti interface atau ganti device, keluar dari room lama dulu
      if (currentTrafficRoom) {
        const oldTrackingKey = currentTrafficRoom.replace("traffic:", "");
        const [oldDeviceId, oldInterfaceId] = oldTrackingKey.split(":");

        await socket.leave(currentTrafficRoom);
        manageTrafficPolling(oldDeviceId, oldInterfaceId);
      }

      // 3. Masuk ke room baru setelah konfigurasi aman tersedia
      await socket.join(newRoomName);

      // 4. Jalankan pooling dengan melempar deviceId murni dan objek data lengkapnya
      manageTrafficPolling(deviceId, interfaceId);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        if (room.startsWith("traffic:")) {
          const trackingKey = room.replace("traffic:", "");
          const [deviceId, interfaceId] = trackingKey.split(":");
          setImmediate(() => manageTrafficPolling(deviceId, interfaceId));
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client terputus total: ${socket.id}`);
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
