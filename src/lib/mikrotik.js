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

const connections = new Map();
const logState = new Map();

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
  // Gunakan koneksi yang sudah ada
  const existingClient = connections.get(device);

  if (existingClient) {
    return existingClient;
  }

  const client = new RouterOSAPI({
    host: device.host,
    user: device.username,
    password: device.password,
    port: parseInt(device.port, 10),
    timeout: 10000,
  });

  try {
    client.on("error", (error) => {
      console.error(`MikroTik API error [${device}]:`, error.message);

      connections.delete(device);
    });

    await client.connect();

    connections.set(device, client);

    console.log(`MikroTik connected [${device}]`);

    return client;
  } catch (error) {
    console.error(`Gagal connect MikroTik [${device}]:`, error.message);

    try {
      client.close();
    } catch {
      // Abaikan error ketika menutup koneksi
    }

    throw error;
  }
}

export async function getInterfaceTraffic(interfaceName) {
  try {
    const router = await connectMikrotik();

    // Perbaikan: Setiap parameter dipisah dan diawali tanda '='
    const data = await router.write("/interface/monitor-traffic", [
      `=interface=${interfaceName}`,
      "=once=yes",
    ]);
    return data?.[0] ?? null;
  } catch (error) {
    console.error("Gagal ambil trafik:", error);
    return null;
  }
}
