export default function DockerPage() {
  const containers = [
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Docker</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {containers.map((container) => (
          <div
            key={container.name}
            className="border-b p-5 flex items-center justify-between"
          >
            <div>
              <h2 className="font-semibold">{container.name}</h2>

              <p className="text-sm text-slate-500">
                CPU {container.cpu} · RAM {container.memory}
              </p>
            </div>

            <span>
              {container.status === "Up" ? "🟢 Running" : "🔴 Stopped"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
