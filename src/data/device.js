export const DEVICE_TYPES = {
  router: {
    value: "router",
    label: "Router",
    desc: "Device MikroTik",
    href: "/mikrotik",
  },
  proxmox: {
    value: "proxmox",
    label: "Proxmox / VM",
    desc: "Node & Virtual Machine",
    href: "/proxmox",
  },
  docker: {
    value: "docker",
    label: "Docker",
    desc: "Container Engine",
    href: "/docker",
  },
};

export const DEVICES = [
  // Router - MikroTik
  {
    id: "r1",
    name: "Router Utama",
    type: "router",
    model: "RB4011iGS+",
    ip: "192.168.1.1",
    mac: "DC:2C:6E:AA:01:10",
    status: "online",
    version: "RouterOS v7.14",
    location: "Ruang Server",
  },
  {
    id: "r2",
    name: "Router Cabang",
    type: "router",
    model: "hAP ac²",
    ip: "192.168.2.1",
    mac: "DC:2C:6E:BB:02:20",
    status: "online",
    version: "RouterOS v7.13",
    location: "Lantai 2",
  },
  {
    id: "r3",
    name: "Router Backup",
    type: "router",
    model: "RB750Gr3",
    ip: "192.168.3.1",
    mac: "DC:2C:6E:CC:03:30",
    status: "offline",
    version: "RouterOS v7.12",
    location: "Gudang",
  },
  // Proxmox / VM
  {
    id: "p1",
    name: "PVE-01",
    type: "proxmox",
    model: "Proxmox VE 8.1 · Host",
    ip: "192.168.1.10",
    mac: "BC:24:11:DD:10:01",
    status: "online",
    version: "PVE 8.1",
    location: "Ruang Server",
  },
  {
    id: "v100",
    name: "web-01",
    type: "proxmox",
    model: "QEMU VM · Ubuntu 22.04",
    ip: "192.168.1.101",
    mac: "BC:24:11:01:00:64",
    status: "online",
    version: "VMID 100 · Running",
    location: "PVE-01",
  },
  {
    id: "v101",
    name: "db-01",
    type: "proxmox",
    model: "QEMU VM · Debian 12",
    ip: "192.168.1.102",
    mac: "BC:24:11:01:00:65",
    status: "online",
    version: "VMID 101 · Running",
    location: "PVE-01",
  },
  {
    id: "v102",
    name: "cache-01",
    type: "proxmox",
    model: "LXC · Alpine",
    ip: "192.168.1.103",
    mac: "BC:24:11:01:00:66",
    status: "offline",
    version: "CT 102 · Stopped",
    location: "PVE-01",
  },
  // Docker
  {
    id: "d1",
    name: "nginx",
    type: "docker",
    model: "nginx:alpine · Web Server",
    ip: "172.17.0.2",
    mac: "02:42:AC:11:00:02",
    status: "online",
    version: "Up 3 hours",
    location: "docker-host",
  },
  {
    id: "d2",
    name: "mysql",
    type: "docker",
    model: "mysql:8.0 · Database",
    ip: "172.17.0.3",
    mac: "02:42:AC:11:00:03",
    status: "online",
    version: "Up 3 hours",
    location: "docker-host",
  },
  {
    id: "d3",
    name: "redis",
    type: "docker",
    model: "redis:7 · Cache",
    ip: "172.17.0.4",
    mac: "02:42:AC:11:00:04",
    status: "offline",
    version: "Exited (0) 2h ago",
    location: "docker-host",
  },
];

export function groupDevices(devices) {
  return {
    router: devices.filter((d) => d.type === "router"),
    proxmox: devices.filter((d) => d.type === "proxmox"),
    docker: devices.filter((d) => d.type === "docker"),
  };
}

export function getDeviceHref(device) {
  const type = DEVICE_TYPES[device.type];
  if (!type) return "/";
  // bawa id sebagai query agar halaman tujuan bisa highlight/detail
  return `${type.href}?highlight=${device.id}`;
}
