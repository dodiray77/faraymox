export default function ProxmoxPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Proxmox</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">PVE-01</h2>

            <p className="text-sm text-slate-500">
              Proxmox Virtual Environment
            </p>
          </div>

          <span>🟢 Online</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-slate-500">CPU</p>
            <p className="text-xl font-bold">35%</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Memory</p>
            <p className="text-xl font-bold">72%</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Storage</p>
            <p className="text-xl font-bold">58%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
