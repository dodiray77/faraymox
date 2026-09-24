import { getMikrotikData } from "@/lib/mikrotik";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const resource = new URL(req.url).searchParams.get("resource") ?? "interface";
  try {
    const data = await getMikrotikData(resource);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
