import { getDockerData, controlDockerContainer } from "@/lib/docker";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const resource = new URL(req.url).searchParams.get("resource") ?? "containers";
  try {
    const data = await getDockerData(resource);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { id, action } = await req.json();
    if (!id || !action) return Response.json({ error: "id and action required" }, { status: 400 });
    const result = await controlDockerContainer(id, action);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
