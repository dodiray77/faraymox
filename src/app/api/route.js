import { NextResponse } from "next/server";
import { isMock } from "@/lib/config";
import { DEVICES } from "@/data/device";
import { DeviceService } from "@/lib/services/device.service";
import { MikrotikService } from "@/lib/services/mikrotik.service";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (isMock) {
    return NextResponse.json({ success: true, data: DEVICES });
  }
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("type") || "type";
  let isConnected = false;
  try {
    let rawData;
    switch (resource) {
      case "mikrotik":
        rawData = await MikrotikService.getDevicesMikrotik();
        break;
      default:
        rawData = await DeviceService.getDevices();
        break;
    }
    const data = rawData;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("MikroTik API error:", error);

    if (isConnected) {
      try {
        await mikrotikClient.close();
        isConnected = false;
      } catch (_) {}
    }

    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const data = await DeviceService.createCategory(body.name);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
