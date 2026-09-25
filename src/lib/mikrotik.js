import "server-only";
import { RouterOSAPI } from "routeros-client";
import { isMock } from "./config";
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
    state = { known: new Set(), initialized: false };
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
    } catch (closeError) {
      // abaikan error ketika menutup koneksi
    }

    console.log(`Koneksi MikroTik [${deviceId}] dibuang`);
  }
}
export async function connectMikrotik() {
  const client = new RouterOSAPI({
    host: process.env.MIKROTIK_HOST || "192.168.88.1",
    user: process.env.MIKROTIK_USER || "admin",
    password: process.env.MIKROTIK_PASSWORD || "password_kamu",
    port: parseInt(process.env.MIKROTIK_PORT || "8728"),
    timeout: 10000,
  });
  try {
    // Tangkap error dari RouterOSAPI
    client.on("error", (error) => {
      console.error(`MikroTik API error []:`, error.message);
    });

    await client.connect();

    console.log(`MikroTik connected [] (${client.host})`);
    return client;
  } catch (error) {
    console.error(`Gagal connect MikroTik []:`, error.message);
    try {
      client.close();
    } catch (closeError) {
      // abaikan error ketika menutup koneksi
    }

    throw error;
  }
}

export const mikrotikClient = new RouterOSAPI({
  host: process.env.MIKROTIK_HOST || "192.168.88.1",
  user: process.env.MIKROTIK_USER || "admin",
  password: process.env.MIKROTIK_PASSWORD || "password_kamu",
  port: parseInt(process.env.MIKROTIK_PORT || "8728"),
  timeout: 10000,
});
