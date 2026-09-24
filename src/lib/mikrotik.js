import "server-only";
import { isMock } from "./config";
const mockInterfaces = [
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
export async function getMikrotikData(resource) {
  if (isMock) {
    if (resource === "system/resource")
      return { cpu: "15%", memory: "45%", uptime: "12d 3h" };
    return mockInterfaces;
  }
  const res = await fetch(`${process.env.MIKROTIK_HOST}/rest/${resource}`, {
    headers: {
      Authorization: `Basic ${btoa(`${process.env.MIKROTIK_USER}:${process.env.MIKROTIK_PASS}`)}`,
    },
    cache: "no-store",
  });
  return res.json();
}
