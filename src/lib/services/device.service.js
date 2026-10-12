import prisma from "@/lib/prisma";
export const DeviceService = {
  async getDevices() {
    return await prisma.device.findMany({
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        location: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  async createCategory(data) {
    return await prisma.category.create({
      data: {
        name: data,
      },
    });
  },
};
