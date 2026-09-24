import { getProxmoxData } from "@/lib/proxmox";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const resource = new URL(req.url).searchParams.get("resource") ?? "nodes";
  try {
    const data = await getProxmoxData(resource);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
