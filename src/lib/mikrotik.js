import { RouterOSAPI } from "routeros-client";

export const mockInterfaces = [
  {
    name: "ether1",
    type: "ether",
    status: "running",
    rx: "1.2 Mbps",
    tx: "800 Kbps",
  },
  {
    name: "wlan1",
    type: "wireless",
    status: "running",
    rx: "5.4 Mbps",
    tx: "2.1 Mbps",
  },
  {
    name: "bridge-local",
    type: "bridge",
    status: "running",
    rx: "0",
    tx: "0",
  },
];

if (!globalThis._mikrotikConnections) {
  globalThis._mikrotikConnections = new Map();
}
const connections = globalThis._mikrotikConnections;
const logState = new Map();

function createDeviceKey(device) {
  return `${device.host}:${device.port || 8728}`;
}
function getLogState(deviceId) {
  let state = logState.get(deviceId);

  if (!state) {
    state = {
      known: new Set(),
      initialized: false,
    };

    logState.set(deviceId, state);
  }

  return state;
}

export function dropConnection(deviceId) {
  const client = connections.get(deviceId);

  if (client) {
    connections.delete(deviceId);
    logState.delete(deviceId);

    try {
      client.close();
    } catch {
      // Abaikan error ketika menutup koneksi
    }

    console.log(`Koneksi MikroTik [${deviceId}] dibuang`);
  }
}

export async function connectMikrotik(device) {
  // Ambil ID unik dari objek device (sesuaikan propertinya: device.id atau device.deviceId)
  const deviceId = device?.id || device?.deviceId;

  if (!deviceId) {
    throw new Error(
      "Objek perangkat tidak valid: 'id' atau 'deviceId' tidak ditemukan.",
    );
  }

  // 1. REUSE CONNECTION: Jika deviceId sudah ada di Map, langsung kembalikan koneksi aktif
  if (connections.has(deviceId)) {
    console.log(
      `[REUSE] Menggunakan koneksi aktif untuk Device ID: [${deviceId}]`,
    );
    return {
      client: connections.get(deviceId),
      deviceKey: deviceId, // Sekarang deviceKey nilainya sama persis dengan deviceId database
    };
  }

  // 2. NEW CONNECTION: Jika belum ada, buat koneksi baru menggunakan data kredensial
  console.log(
    `[NEW CONNECTION] Mencoba menghubungkan ke MikroTik untuk Device ID: [${deviceId}]`,
  );

  const client = new RouterOSAPI({
    host: device.host,
    user: device.username,
    password: device.password,
    port: parseInt(device.port, 10) || 8728,
    timeout: 10000,
  });

  try {
    // Listener jika koneksi putus di tengah jalan, hapus berdasarkan deviceId
    client.on("error", (error) => {
      console.error(
        `MikroTik API error pada Device ID [${deviceId}]:`,
        error.message,
      );
      connections.delete(deviceId);
      try {
        client.close();
      } catch {}
    });

    await client.connect();
    console.log(connections);
    // Simpan koneksi ke Map terpusat menggunakan key berupa deviceId
    connections.set(deviceId, client);
    console.log(
      `MikroTik connected successfully untuk Device ID: [${deviceId}]`,
    );

    return { client, deviceKey: deviceId };
  } catch (error) {
    console.error(
      `Gagal connect MikroTik untuk Device ID [${deviceId}]:`,
      error.message,
    );
    connections.delete(deviceId); // Pastikan bersih jika gagal jabat tangan
    try {
      client.close();
    } catch {
      // Abaikan error ketika menutup koneksi
    }
    throw error;
  }
}

/**
 * Fungsi pemanggilan trafik yang sekarang cukup dioperi string deviceId database
 */
export async function getInterfaceTraffic(deviceOrId, interfaceName) {
  try {
    let routerClient;

    // Jika yang dikirim berupa string (deviceId murni), kita cek langsung ke Map connections
    if (typeof deviceOrId === "string") {
      if (!connections.has(deviceOrId)) {
        throw new Error(
          `Koneksi aktif untuk Device ID [${deviceOrId}] tidak ditemukan.`,
        );
      }
      routerClient = connections.get(deviceOrId);
    } else {
      // Jika yang dikirim berupa objek device lengkap dari DB, biarkan fungsi connectMikrotik mengaturnya
      const { client } = await connectMikrotik(deviceOrId);
      routerClient = client;
    }

    const data = await routerClient.write("/interface/monitor-traffic", [
      `=interface=${interfaceName}`,
      "=once=",
    ]);

    return data?.[0] ?? null;
  } catch (error) {
    const idLog =
      typeof deviceOrId === "string" ? deviceOrId : deviceOrId?.id || "unknown";
    console.error(`[Traffic Error] Device ID [${idLog}]:`, error.message);
    return null;
  }
}
