import { NextResponse } from "next/server";
import { connectMikrotik, mockInterfaces } from "@/lib/mikrotik";
import { isMock } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (isMock) {
    return NextResponse.json({ success: true, data: mockInterfaces });
  }
  let isConnected = false;
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "resource";
  try {
    const router = await connectMikrotik();
    isConnected = true;
    let rawData;
    switch (resource) {
      case "interfaces":
        rawData = await router.write("/interface/print");
        break;

      default:
        rawData = await router.write("/system/resource/print");
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
