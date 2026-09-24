import "server-only";
import { isMock } from "./config";

const mockNodes = [
  {
    node: "PVE-01",
    status: "online",
    cpu: "35%",
    memory: "72%",
    storage: "58%",
    uptime: "12d 3h",
    vms: 3,
  },
];

const mockVMs = [
  { vmid: 100, name: "web-01", status: "running", cpu: "12%", memory: "1.2 GB" },
  { vmid: 101, name: "db-01", status: "running", cpu: "28%", memory: "2.4 GB" },
  { vmid: 102, name: "cache-01", status: "stopped", cpu: "0%", memory: "0 GB" },
];

export async function getProxmoxData(resource) {
  if (isMock) {
    if (resource === "nodes") return mockNodes;
    if (resource === "qemu" || resource === "vms") return mockVMs;
    if (resource === "system/resource") return mockNodes[0];
    return mockNodes;
  }
  const res = await fetch(`${process.env.PROXMOX_HOST}/api2/json/${resource}`, {
    headers: {
      Authorization: `PVEAPIToken=${process.env.PROXMOX_TOKEN}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Proxmox fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}
