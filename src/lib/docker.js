import "server-only";
import { isMock } from "./config";

const mockContainers = [
  {
    name: "nginx",
    status: "Up",
    cpu: "2.1%",
    memory: "128 MB",
  },
  {
    name: "mysql",
    status: "Up",
    cpu: "4.8%",
    memory: "512 MB",
  },
  {
    name: "redis",
    status: "Exited",
    cpu: "0%",
    memory: "0 MB",
  },
];

export async function getDockerData(resource) {
  if (isMock) {
    if (resource === "containers" || resource === "ps") return mockContainers;
    if (resource === "system/resource")
      return { containers: mockContainers.length, running: 2, stopped: 1 };
    return mockContainers;
  }
  const res = await fetch(`${process.env.DOCKER_HOST}/containers/json?all=1`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Docker fetch failed: ${res.status}`);
  return res.json();
}

export async function controlDockerContainer(id, action) {
  if (isMock) {
    return { ok: true, id, action, message: `Mock ${action} ${id}` };
  }
  const res = await fetch(`${process.env.DOCKER_HOST}/containers/${id}/${action}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Docker ${action} failed: ${res.status}`);
  return { ok: true, id, action };
}
