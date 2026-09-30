import prisma from "@/lib/prisma";
export const DeviceService = {
  async getDevices() {
    return await prisma.device.findMany();
  },
  async createCategory(data) {
    return await prisma.category.create({
      data: {
        name: data,
      },
    });
  },
};
