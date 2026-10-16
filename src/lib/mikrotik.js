import { RouterOSAPI } from "routeros-client";
import ping from "ping";
import { MikrotikService } from "./services/mikrotik.service.js";
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
const CACHE_TTL = 60 * 60 * 1000;
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

export async function getRouterOS({ id, path }) {
  if (!id) {
    throw new Error(
      "ID perangkat wajib disertakan untuk mengambil data RouterOS.",
    );
  }

  try {
    const now = Date.now();
    let cachedDevice = globalThis._mikrotikConnections.get(id);

    // 1. LOGIKA CACHE CHECK: Jika belum ada atau expired, ambil data baru dari database
    if (!cachedDevice || now - cachedDevice.cachedAt > CACHE_TTL) {
      console.log(
        `[DB HIT - getRouterOS] Mengambil kredensial baru untuk Device ID: [${id}]`,
      );

      const device = await MikrotikService.getDeviceById(id);
      if (!device) throw new Error("Device tidak ditemukan di database.");

      const username = device.username;
      const password = device.password;
      const authToken = Buffer.from(`${username}:${password}`).toString(
        "base64",
      );

      const hostParam = device.port
        ? `${device.host}:${device.port}`
        : device.host;
      const baseUrl = hostParam.startsWith("http")
        ? hostParam
        : `http://${hostParam}`;

      cachedDevice = {
        authToken,
        baseUrl: `${baseUrl}/rest`, // Simpan base URL rest-nya saja
        hostLog: device.host,
        cachedAt: now,
      };

      globalThis._mikrotikConnections.set(id, cachedDevice);
    }

    // 2. KONEKSI REST API: Susun URL akhir berdasarkan path yang diminta
    const url = `${cachedDevice.baseUrl}${path}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${cachedDevice.authToken}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    console.log("RouterOS URL:", url);
    console.log("RouterOS status:", response.status);

    if (!response.ok) {
      const body = await response.text();

      // Jika password di Router telah diubah (401), hapus cache agar request berikutnya me-refresh DB
      if (response.status === 401) {
        globalThis._mikrotikConnections.delete(id);
      }

      throw new Error(`RouterOS REST API error: ${response.status} - ${body}`);
    }

    return await response.json();
  } catch (error) {
    console.error("RouterOS connection error:", error.message);
    throw error;
  }
}

export async function getInterfaceTraffic(id, interfaceName) {
  try {
    if (!id) {
      throw new Error("ID wajib disertakan untuk REST API");
    }
    const now = Date.now();
    // Mengambil cache dari properti globalThis milik Anda
    let cachedDevice = globalThis._mikrotikConnections.get(id);

    // LOGIKA CACHE CHECK: Jika belum ada atau masa simpan habis, buat auth baru dari DB
    if (!cachedDevice || now - cachedDevice.cachedAt > CACHE_TTL) {
      console.log(
        `[DB HIT] Mengambil/Memperbarui kredensial REST untuk Device ID: [${id}]`,
      );

      const device = await MikrotikService.getDeviceById(id);
      if (!device) throw new Error("Device tidak ditemukan di database.");

      const username = device.username;
      const password = device.password;

      // Enkripsi Basic Auth di backend Node.js
      const authToken = Buffer.from(`${username}:${password}`).toString(
        "base64",
      );

      const hostParam = device.port
        ? `${device.host}:${device.port}`
        : device.host;
      const baseUrl = hostParam.startsWith("http")
        ? hostParam
        : `http://${hostParam}`;

      // Susun objek data auth untuk disimpan global
      cachedDevice = {
        authToken,
        url: `${baseUrl}/rest/interface/monitor-traffic`,
        hostLog: device.host,
        cachedAt: now,
      };

      // Simpan ke dalam Map Global yang sudah Anda siapkan
      globalThis._mikrotikConnections.set(id, cachedDevice);
    }

    // Tentukan host beserta port REST API (Contoh format: 192.168.88.1:80 atau jika kosong langsung host-nya)
    const response = await fetch(cachedDevice.url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${cachedDevice.authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        interface: interfaceName,
        once: true,
      }),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    // Kembalikan objek data pertama seperti perilaku library sebelumnya
    return data?.[0] ?? null;
  } catch (error) {
    const deviceLog = id || "unknown-device";
    console.error(
      `[Traffic Error REST] Device [${deviceLog}] Interface [${interfaceName}]:`,
      error.message,
    );
    return null;
  }
}

export async function checkOnline(host) {
  const result = await ping.promise.probe(host, {
    timeout: 2,
    min_reply: 1,
  });
  return result.alive;
}
