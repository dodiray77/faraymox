"use client";

import useSWR from "swr";

const fetcher = (u) => fetch(u).then((r) => r.json());

function normalize(container) {
  const name = container.name || (container.Names?.[0] || container.Id || "").replace(/^\//, "");
  const state = typeof container.status === "string" ? container.status : container.State || "";
  const running = /^up/i.test(state) || container.State === "running";
  return {
    name,
    image: container.Image,
    cpu: container.cpu,
    memory: container.memory,
    running,
    label: running ? "🟢 Running" : "🔴 Stopped",
  };
}

export default function DockerPage() {
  const { data, isLoading, error } = useSWR(
    "/api/docker?resource=containers",
    fetcher,
    { refreshInterval: 15000 },
  );
  const containers = Array.isArray(data) ? data.map(normalize) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Docker</h1>

      {isLoading && <p className="text-sm text-slate-500">Memuat container…</p>}
      {error && (
        <p className="text-sm text-rose-400">Gagal memuat: {error.message}</p>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!isLoading && !error && containers.length === 0 && (
          <p className="p-5 text-sm text-slate-500">Tidak ada container.</p>
        )}
        {containers.map((container) => (
          <div
            key={container.name}
            className="border-b p-5 flex items-center justify-between"
          >
            <div>
              <h2 className="font-semibold">{container.name}</h2>

              <p className="text-sm text-slate-500">
                {[container.image, container.cpu && `CPU ${container.cpu}`, container.memory && `RAM ${container.memory}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <span>{container.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
