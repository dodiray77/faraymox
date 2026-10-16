import { NextResponse } from "next/server";
import {
  checkOnline,
  connectMikrotik,
  getRouterOS,
  mockInterfaces,
} from "@/lib/mikrotik";
import { isMock } from "@/lib/config";
import { MikrotikService } from "@/lib/services/mikrotik.service";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (isMock) {
    return NextResponse.json({ success: true, data: mockInterfaces });
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "resource";
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Parameter ID perangkat wajib diisi" },
      { status: 400 },
    );
  }

  try {
    // 1. Ambil data sensitif perangkat dari Database
    const device = await MikrotikService.getDeviceById(id);
    if (!device) {
      return NextResponse.json(
        { success: false, error: "Perangkat tidak ditemukan di database" },
        { status: 404 },
      );
    }
    let rawData;
    switch (resource) {
      case "interfaces":
        rawData = await getRouterOS({
          id,
          path: "/interface",
        });
        break;
      default:
        const dataResource = await getRouterOS({
          id,
          path: "/system/resource",
        });
        const isDeviceOnline = await checkOnline(device.host);

        // 3. Gabungkan hasilnya ke dalam satu objek secara valid
        rawData = {
          ...dataResource,
          isConnected: isDeviceOnline, // Properti baru langsung dimasukkan di sini
        };
        break;
    }
    return NextResponse.json({ success: true, data: rawData });
  } catch (error) {
    console.error("MikroTik API error pada Route Handler:", error.message);

    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const category = await MikrotikService.getOrCreateMikrotikCategory();
    const data = await MikrotikService.createMikrotik({
      ...body,
      category: {
        connect: {
          id: category.id,
        },
      },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
