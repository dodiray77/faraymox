"use client";
import {
  ArrowDown,
  ArrowUp,
  Bolt,
  ChartLine,
  ChevronDown,
  Clock,
  CloudDownload,
  CloudUpload,
  History,
  Microchip,
  Server,
  Shield,
  Users,
  WavePulse,
  Wifi,
} from "@primeicons/react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { Card } from "@primereact/ui/card";
import { Select } from "@primereact/ui/select";
import useSWR from "swr";
import { useMemo, useRef, useState } from "react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
);

const fetcher = (u) => fetch(u).then((r) => r.json());

function IconTile({ tone, children }) {
  const tones = {
    emerald: "from-emerald-400 to-teal-600 shadow-emerald-500/30",
    cyan: "from-cyan-400 to-sky-600 shadow-cyan-500/30",
    violet: "from-violet-400 to-indigo-600 shadow-indigo-500/30",
    amber: "from-amber-300 to-orange-500 shadow-orange-500/30",
  };
  return (
    <div
      className={`flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${tones[tone]} text-slate-950 shadow-lg [&_svg]:size-5 [&_svg]:shrink-0`}
    >
      {children}
    </div>
  );
}
function formatBytes(bytes) {
  const b = Number(bytes || 0);
  if (b <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(b) / Math.log(1024)),
  );
  return `${(b / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function StatShell({ children, delay = "" }) {
  return (
    <div
      className={`glass card-ring animate-fade-up ${delay} group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20`}
    >
      {children}
    </div>
  );
}

const toMbps = (bits) => Number((Number(bits || 0) / 1000000).toFixed(2));

async function getRouterResource() {
  // Gunakan URL absolut saat mengambil data di dalam Server Component
  const res = await fetch("http://localhost:3000/api/mikrotik", {
    cache: "no-store", // Memastikan data selalu fresh dari MikroTik setiap kali halaman dibuka
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data dari API MikroTik");
  }

  return res.json();
}
export default function MikroTikPage() {
  const { data, isLoading, error } = useSWR(
    "/api/mikrotik/?resource=resource",
    fetcher,
    {
      refreshInterval: 5000,
    },
  );
  let systemInfo = data?.data[0] || {
    uptime: "0s",
    version: "—",
    "build-time": "",
    "factory-software": "",
    "free-memory": "0",
    "total-memory": "0",
    cpu: "-",
    "cpu-count": "0",
    "cpu-frequency": "0",
    "cpu-load": "0",
    "free-hdd-space": "0",
    "total-hdd-space": "0",
    "architecture-name": "-",
    "board-name": "Menghubungkan…",
    platform: "-",
  };

  const [trafficHistory, setTrafficHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [interfaces, setInterfaces] = useState([]);
  const [selectedInterface, setSelectedInterface] = useState(null);
  const [maxTx, setMaxTx] = useState({ speed: 0, timestamp: 0 });
  const [maxRx, setMaxRx] = useState({ speed: 0, timestamp: 0 });
  const [logs, setLogs] = useState([]);
  const selectedInterfaceRef = useRef(null);
  const cpuLoad = Number(systemInfo["cpu-load"]) || 0;
  const totalMemory = Number(systemInfo["total-memory"]) || 0;
  const freeMemory = Number(systemInfo["free-memory"]) || 0;
  const ramTotalMB = Math.round(totalMemory / 1024 / 1024);
  const ramFreeMB = Math.round(freeMemory / 1024 / 1024);
  const ramUsedMB = Math.max(0, ramTotalMB - ramFreeMB);
  const ramPct =
    ramTotalMB > 0 ? Math.round((ramUsedMB / ramTotalMB) * 100) : 0;

  const lastPoint = trafficHistory[trafficHistory.length - 1];
  const liveRx = lastPoint ? toMbps(lastPoint.rx) : 0;
  const liveTx = lastPoint ? toMbps(lastPoint.tx) : 0;

  const cpuStatus =
    cpuLoad >= 85
      ? {
          label: "Tinggi",
          cls: "bg-rose-500/10 text-rose-300 border-rose-500/25",
        }
      : cpuLoad >= 60
        ? {
            label: "Sedang",
            cls: "bg-amber-500/10 text-amber-300 border-amber-500/25",
          }
        : {
            label: "Normal",
            cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
          };

  const ramData = useMemo(
    () => ({
      labels: ["Digunakan", "Tersedia"],
      datasets: [
        {
          data: [Math.max(ramUsedMB, 0.01), Math.max(ramFreeMB, 0.01)],
          backgroundColor: ["#10b981", "rgba(148,163,184,0.18)"],
          borderColor: ["#34d399", "rgba(148,163,184,0.25)"],
          borderWidth: 1,
          hoverOffset: 6,
          cutout: "72%",
        },
      ],
    }),
    [ramUsedMB, ramFreeMB],
  );

  const dataTraffic = useMemo(
    () => ({
      labels: trafficHistory.map((item) => item.time),
      datasets: [
        {
          label: "Download",
          data: trafficHistory.map((item) => toMbps(item.rx)),
          borderColor: "#34d399",
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(16,185,129,0.12)";
            const g = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            g.addColorStop(0, "rgba(16,185,129,0.32)");
            g.addColorStop(1, "rgba(16,185,129,0.01)");
            return g;
          },
          fill: true,
          tension: 0.45,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#34d399",
        },
        {
          label: "Upload",
          data: trafficHistory.map((item) => toMbps(item.tx)),
          borderColor: "#22d3ee",
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(34,211,238,0.10)";
            const g = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            g.addColorStop(0, "rgba(34,211,238,0.28)");
            g.addColorStop(1, "rgba(34,211,238,0.01)");
            return g;
          },
          fill: true,
          tension: 0.45,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#22d3ee",
        },
      ],
    }),
    [trafficHistory],
  );
  const handleSelectInterface = (interfaceName) => {
    selectedInterfaceRef.current = interfaceName;
    setSelectedInterface(interfaceName);
    setTrafficHistory([]);
    setMaxRx({ speed: 0, timestamp: 0 });
    setMaxTx({ speed: 0, timestamp: 0 });
  };
  if (isLoading)
    return <div className="p-5 text-slate-500">Loading MikroTik...</div>;
  if (error)
    return <div className="p-5 text-red-600">Error: {error.message}</div>;
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-gradient text-2xl font-extrabold tracking-tight md:text-[28px]">
              Network Overview
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                connected
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                    connected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </span>
              {connected ? "LIVE" : isLoading ? "CONNECTING" : "OFFLINE"}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-slate-400">
            Pantau kesehatan router, trafik real-time, dan log sistem dalam satu
            tempat.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono">
            <Clock className="size-3.5 text-emerald-400" />
            Uptime {systemInfo.uptime}
          </span>
          <span className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-semibold sm:inline-flex">
            <Wifi className="size-3.5 text-cyan-300" />
            {selectedInterface || "—"}
          </span>
        </div>
      </div>

      {/* Router hero */}
      <div className="animate-fade-up stagger-1 relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-px">
        <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 right-32 size-64 rounded-full bg-cyan-500/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_2s_infinite]" />
                  ONLINE · RouterOS
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  v{systemInfo.version}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  {systemInfo["architecture-name"]} · {systemInfo.platform}
                </span>
              </div>
              <h2 className="mt-3 truncate text-xl font-extrabold tracking-tight text-white md:text-2xl">
                {systemInfo["board-name"] || "MikroTik Router"}
              </h2>
              <p className="mt-1 text-[13px] text-slate-400">
                {systemInfo.cpu} · {systemInfo["cpu-frequency"]} MHz ·{" "}
                {systemInfo["cpu-count"]} Cores
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Uptime",
                    value: systemInfo.uptime,
                    icon: <Clock />,
                  },
                  {
                    label: "CPU",
                    value: `${systemInfo.cpu}`,
                    icon: <Microchip />,
                  },
                  {
                    label: "Storage Bebas",
                    value: formatBytes(systemInfo["free-hdd-space"]),
                    icon: <Server />,
                  },
                  {
                    label: "Build",
                    value: (systemInfo["build-time"] || "—")
                      .split(" ")
                      .slice(0, 3)
                      .join(" "),
                    icon: <Shield />,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/8 bg-white/3 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <span className="text-slate-400 [&_svg]:size-3.5">
                        {s.icon}
                      </span>
                      {s.label}
                    </div>
                    <div className="mt-1.5 truncate text-[13px] font-bold text-slate-100">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 lg:w-72">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                  <CloudDownload className="size-3.5" /> RX Live
                </div>
                <div className="mt-1 font-mono text-2xl font-extrabold text-emerald-300">
                  {liveRx}
                  <span className="ml-1 text-xs font-semibold">Mbps</span>
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300/80">
                  <CloudUpload className="size-3.5" /> TX Live
                </div>
                <div className="mt-1 font-mono text-2xl font-extrabold text-cyan-300">
                  {liveTx}
                  <span className="ml-1 text-xs font-semibold">Mbps</span>
                </div>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Bolt className="size-3.5 text-amber-300" /> Beban CPU
                  </span>
                  <span className="font-mono text-slate-200">{cpuLoad}%</span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 transition-all duration-700"
                    style={{ width: `${Math.min(cpuLoad, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatShell delay="stagger-1">
          <div className="flex items-start justify-between">
            <IconTile tone="violet">
              <Microchip />
            </IconTile>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${cpuStatus.cls}`}
            >
              {cpuStatus.label}
            </span>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            CPU Load
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-white">
            {cpuLoad}
            <span className="text-sm font-bold text-slate-400">%</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-400 to-indigo-400 transition-all duration-700"
              style={{ width: `${Math.min(cpuLoad, 100)}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-slate-500">
            Core Count ·{" "}
            <span className="font-bold text-slate-300">
              {systemInfo["cpu-count"]} Cores
            </span>
          </p>
        </StatShell>

        <StatShell delay="stagger-2">
          <div className="flex items-start justify-between">
            <IconTile tone="emerald">
              <Server />
            </IconTile>
            <span className="font-mono text-xs font-bold text-slate-300">
              {ramUsedMB} / {ramTotalMB} MB
            </span>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Memory (RAM) · {ramPct}%
          </p>
          <div className="mt-1 flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0">
              <Doughnut
                data={ramData}
                options={{
                  maintainAspectRatio: false,
                  cutout: "72%",
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-extrabold text-white">
                {ramPct}%
              </span>
            </div>
            <div className="min-w-0 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="size-2 rounded-full bg-emerald-400" />
                Terpakai <b className="font-mono">{ramUsedMB} MB</b>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-slate-400">
                <span className="size-2 rounded-full bg-slate-600" />
                Bebas <b className="font-mono text-slate-300">{ramFreeMB} MB</b>
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-300 transition-all duration-700"
              style={{ width: `${ramPct}%` }}
            />
          </div>
        </StatShell>

        <StatShell delay="stagger-3">
          <div className="flex items-start justify-between">
            <IconTile tone="emerald">
              <ArrowDown />
            </IconTile>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" /> RX
            </span>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Max Download
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-emerald-300">
            {toMbps(maxRx.speed)}
            <span className="ml-1 text-sm font-bold text-emerald-300/60">
              Mbps
            </span>
          </p>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <History className="size-3.5" /> Pukul {maxRx.timestamp || "—"} ·{" "}
            <span className="truncate font-semibold text-slate-400">
              {selectedInterface}
            </span>
          </p>
        </StatShell>

        <StatShell delay="stagger-4">
          <div className="flex items-start justify-between">
            <IconTile tone="cyan">
              <ArrowUp />
            </IconTile>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-300">
              <span className="size-1.5 rounded-full bg-cyan-400" /> TX
            </span>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Max Upload
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-cyan-300">
            {toMbps(maxTx.speed)}
            <span className="ml-1 text-sm font-bold text-cyan-300/60">
              Mbps
            </span>
          </p>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <History className="size-3.5" /> Pukul {maxTx.timestamp || "—"} ·{" "}
            <span className="truncate font-semibold text-slate-400">
              {selectedInterface}
            </span>
          </p>
        </StatShell>
      </div>

      {/* Traffic */}
      <div className="animate-fade-up stagger-3">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300 [&_svg]:size-4">
              <ChartLine />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold tracking-tight text-white">
                Real-Time Traffic
              </h2>
              <p className="text-xs text-slate-500">
                30 titik terakhir · update via WebSocket
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 md:inline-flex">
              <span className="size-1.5 rounded-full bg-emerald-400" />↓{" "}
              {liveRx} Mbps
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2.5 py-1.5 text-[11px] font-bold text-cyan-300 md:inline-flex">
              <span className="size-1.5 rounded-full bg-cyan-400" />↑ {liveTx}{" "}
              Mbps
            </span>
            <Select.Root
              value={selectedInterface}
              onValueChange={(e) => handleSelectInterface(e.value)}
              options={interfaces}
              optionLabel="label"
              optionValue="value"
              className="w-full sm:w-56"
              size="small"
            >
              <Select.Trigger className="rounded-xl! border-white/10! bg-white/5! text-slate-200!">
                <Select.Value placeholder="Pilih interface" />
                <Select.Indicator>
                  <ChevronDown />
                </Select.Indicator>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Popup>
                    <Select.List />
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>

        <Card.Root className="glass card-ring rounded-3xl! border-0!">
          <Card.Body className="p-5! md:p-6!">
            <Card.Content className="p-0!">
              <div className="h-64 w-full min-w-0 md:h-72">
                <Line
                  data={dataTraffic}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                      legend: {
                        position: "top",
                        align: "end",
                        labels: {
                          color: "#94a3b8",
                          usePointStyle: true,
                          pointStyle: "circle",
                          boxWidth: 6,
                          boxHeight: 6,
                          font: { size: 11, weight: 600 },
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(2,6,23,0.92)",
                        borderColor: "rgba(148,163,184,0.2)",
                        borderWidth: 1,
                        titleColor: "#e2e8f0",
                        bodyColor: "#cbd5e1",
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                          label: (c) =>
                            ` ${c.dataset.label}: ${c.parsed.y} Mbps`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: {
                          color: "#64748b",
                          font: { size: 10 },
                          maxTicksLimit: 8,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(148,163,184,0.08)" },
                        ticks: {
                          color: "#64748b",
                          font: { size: 10 },
                          callback: (v) => `${v}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4 text-[11px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <WavePulse className="size-3.5 text-emerald-400" />
                  Download hijau solid
                </span>
                <span className="text-slate-700">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <WavePulse className="size-3.5 text-cyan-300" />
                  Upload cyan garis putus
                </span>
                <span className="ml-auto hidden font-mono sm:inline">
                  iface: {selectedInterface || "—"}
                </span>
              </div>
            </Card.Content>
          </Card.Body>
        </Card.Root>
      </div>

      {/* Users & logs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="glass card-ring animate-fade-up stagger-4 rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconTile tone="amber">
                <Users />
              </IconTile>
              <div>
                <h2 className="text-[14px] font-extrabold text-white">
                  Active Users
                </h2>
                <p className="text-[11px] text-slate-500">Hotspot / PPPoE</p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-300">
              0 online
            </span>
          </div>
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-white/12 bg-white/2 px-4 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 text-slate-400 [&_svg]:size-5">
              <Users />
            </div>
            <p className="mt-3 text-[13px] font-bold text-slate-300">
              Belum ada user aktif
            </p>
            <p className="mt-1 max-w-55 text-xs leading-relaxed text-slate-500">
              User hotspot & PPPoE yang terhubung akan muncul di sini secara
              otomatis.
            </p>
          </div>
        </div>

        <div className="glass card-ring animate-fade-up stagger-5 rounded-3xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconTile tone="cyan">
                <History />
              </IconTile>
              <div>
                <h2 className="text-[14px] font-extrabold text-white">
                  System Logs
                </h2>
                <p className="text-[11px] text-slate-500">
                  {logs.length} notifikasi terakhir
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Streaming
            </span>
          </div>
          <div className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
            {logs.length === 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/2 p-6 text-center text-xs text-slate-500">
                {isLoading
                  ? "Menghubungkan ke router…"
                  : "Belum ada log masuk."}
              </div>
            )}
            {logs.map((item, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 rounded-2xl border border-white/8 border-l-2 border-l-emerald-400 bg-white/3 p-3 transition-colors hover:bg-white/6"
              >
                <span className="shrink-0 rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1.5 font-mono text-[11px] font-semibold text-slate-400">
                  {item.time}
                </span>
                <span className="shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                  {item.topics}
                </span>
                <p
                  className="min-w-0 flex-1 truncate text-xs text-slate-300"
                  title={item.message}
                >
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="pb-2 text-center text-[11px] text-slate-600">
        Sentinel · telemetry diperbarui real-time — {new Date().getFullYear()}
      </p>
    </div>
  );
}
