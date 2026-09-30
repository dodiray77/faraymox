import prisma from "@/lib/prisma";
import ping from "ping";
import { connectMikrotik } from "@/lib/mikrotik";
export const MikrotikService = {
  async createMikrotik(data) {
    return await prisma.device.create({
      data: data,
    });
  },
  async checkOnline(host) {
    const result = await ping.promise.probe(host, {
      timeout: 2,
      min_reply: 1,
    });
    return result.alive;
  },
  async getDevicesMikrotik() {
    const devices = await prisma.device.findMany({
      where: {
        category: {
          name: "Mikrotik",
        },
      },
      include: {
        category: true,
      },
    });
    return await Promise.all(devices.map((device) => this.getIdentity(device)));
  },
  async getIdentity(device) {
    const isOnline = await this.checkOnline(device.host);
    if (!isOnline) {
      return {
        ...device,
        online: false,
        apiConnected: false,
      };
    }

    let client;

    try {
      client = await connectMikrotik(device);

      const identity = await client.write("/system/identity/print");
      const resource = await client.write("/system/resource/print");
      const addresses = await client.write("/ip/address/print");

      const address = addresses.find((item) => {
        const ip = item.address?.split("/")[0];
        return ip === device.host;
      });

      const interfaceName = address?.interface ?? null;

      const interfaces = await client.write("/interface/print");

      const iface = interfaces.find((item) => item.name === interfaceName);

      const mac = iface?.["mac-address"] ?? null;
      return {
        ...device,
        online: true,
        apiConnected: true,

        identity: identity?.[0]?.name ?? null,

        version: resource?.[0]?.version ?? null,

        model: resource?.[0]?.["board-name"] ?? null,

        architecture: resource?.[0]?.["architecture-name"] ?? null,
        mac,
      };
    } catch (error) {
      return {
        ...device,
        online: true,
        apiConnected: false,
        error: error.message,
      };
    } finally {
      if (client) {
        try {
          await client.close();
        } catch {}
      }
    }
  },
  async getDeviceById(id) {
    const device = await prisma.device.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
      },
    });
    return device;
  },
};
