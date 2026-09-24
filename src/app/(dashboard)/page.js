"use client";
import { Desktop, Search, Server, Sitemap, Times } from "@primeicons/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEVICE_TYPES, DEVICES, getDeviceHref } from "@/data/device";
import { Card } from "@primereact/ui/card";
import { useTheme } from "@/components/ThemeProvider";

const GROUP_STYLE = {
  router: {
    icon: Sitemap,
    tone: "from-emerald-400 to-teal-600 shadow-emerald-500/30",
  },
  proxmox: {
    icon: Server,
    tone: "from-violet-400 to-indigo-600 shadow-violet-500/30",
  },
  docker: {
    icon: Desktop,
    tone: "from-cyan-400 to-sky-600 shadow-cyan-500/30",
  },
};

function StatusBadge({ status }) {
  const online = status === "online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${
        online
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/25 bg-rose-500/10 text-rose-300"
      }`}
    >
      <span className={`size-1.5 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

function DeviceCard({ device, delay = "" }) {
  const style = GROUP_STYLE[device.type] ?? GROUP_STYLE.docker;
  const Icon = style.icon;
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <Card.Root
      onClick={() => router.push(getDeviceHref(device))}
      className="cursor-pointer group h-full bg-transparent! border-0! shadow-none! p-0!"
    >
      <Card.Body
        className={
          isLight
            ? `animate-fade-up ${delay} flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md`
            : `glass card-ring animate-fade-up ${delay} flex h-full flex-col rounded-2xl border border-white/8! bg-slate-900/60! p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.35)]`
        }
      >
        <Card.Caption>
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${style.tone} text-slate-950 shadow-lg transition-transform duration-300 group-hover:scale-105 [&_svg]:size-5`}
            >
              <Icon />
            </div>
            <StatusBadge status={device.status} />
          </div>
        </Card.Caption>
        <Card.Content className="flex-1">
          <h3 className="mt-4 truncate text-[15px] font-extrabold tracking-tight text-white">{device.name}</h3>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">{device.model}</p>
          <div className="mt-3 space-y-2 border-t border-white/8 pt-3 font-mono text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">IP</span>
              <span className="font-semibold tracking-tight text-slate-200">{device.ip}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">MAC</span>
              <span className="truncate font-semibold text-slate-300">{device.mac}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Lokasi</span>
              <span className="truncate font-sans text-[12px] font-semibold text-slate-300">{device.location}</span>
            </div>
          </div>
        </Card.Content>
        <Card.Footer className="mt-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-slate-400">
            {device.version}
          </span>
          <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-300 transition-colors">Buka →</span>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
}

function GroupSection({ type, items }) {
  const meta = DEVICE_TYPES[type];
  const style = GROUP_STYLE[type];
  const Icon = style.icon;
  const online = items.filter((d) => d.status === "online").length;
  return (
    <section className="animate-fade-up">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-xl bg-linear-to-br ${style.tone} text-slate-950 shadow-lg [&_svg]:size-[18px]`}
        >
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold tracking-tight text-white">
            {meta.label}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-300">
              {items.length}
              <span className="size-1 rounded-full bg-white/20" />
              <span className="text-emerald-300">{online} online</span>
            </span>
          </h2>
          <p className="truncate text-xs text-slate-500">
            {meta.desc} · {online}/{items.length} aktif · klik kartu untuk buka {meta.label}
          </p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500">
            <Icon className="size-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-300">Tidak ada perangkat</p>
          <p className="text-xs text-slate-500">Tidak ada {meta.label.toLowerCase()} yang cocok dengan filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((d, i) => (
            <DeviceCard
              key={d.id}
              device={d}
              delay={i % 3 === 0 ? "stagger-1" : i % 3 === 1 ? "stagger-2" : "stagger-3"}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const STATS = [
  { key: "total", label: "Total Perangkat", tone: "from-violet-400 to-indigo-600 shadow-indigo-500/25", icon: Server },
  { key: "router", label: "Router", tone: "from-emerald-400 to-teal-600 shadow-emerald-500/25", icon: Sitemap },
  { key: "proxmox", label: "Proxmox / VM", tone: "from-violet-400 to-indigo-600 shadow-violet-500/25", icon: Server },
  { key: "docker", label: "Docker", tone: "from-cyan-400 to-sky-600 shadow-cyan-500/25", icon: Desktop },
];

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const counts = useMemo(
    () => ({
      total: DEVICES.length,
      router: DEVICES.filter((d) => d.type === "router").length,
      proxmox: DEVICES.filter((d) => d.type === "proxmox").length,
      docker: DEVICES.filter((d) => d.type === "docker").length,
      online: DEVICES.filter((d) => d.status === "online").length,
      offline: DEVICES.filter((d) => d.status === "offline").length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEVICES.filter((d) => {
      if (tab !== "all" && d.type !== tab) return false;
      if (!q) return true;
      return [d.name, d.ip, d.mac, d.model, d.location, d.version]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [query, tab]);

  const groups = useMemo(
    () => ({
      router: filtered.filter((d) => d.type === "router"),
      proxmox: filtered.filter((d) => d.type === "proxmox"),
      docker: filtered.filter((d) => d.type === "docker"),
    }),
    [filtered],
  );

  const tabs = [
    { value: "all", label: `Semua`, count: counts.total },
    { value: "router", label: `Router`, count: counts.router },
    { value: "proxmox", label: `Proxmox`, count: counts.proxmox },
    { value: "docker", label: `Docker`, count: counts.docker },
  ];

  return (
    <div className="space-y-7">
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-gradient text-2xl font-extrabold tracking-tight md:text-[28px]">Perangkat</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold leading-none text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {counts.online}/{counts.total} Online
              </span>
              {counts.offline > 0 && (
                <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {counts.offline} Offline
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-400">
              3 grup: Router MikroTik · Proxmox / VM · Docker. Klik kartu untuk buka halaman sesuai jenis.
            </p>
          </div>
          {query && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
              {filtered.length} hasil untuk &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {STATS.map((s, i) => {
          const value = counts[s.key];
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`glass card-ring animate-fade-up stagger-${i + 1} group rounded-2xl p-4 sm:p-5 transition-all hover:border-white/15`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${s.tone} text-slate-950 shadow-lg transition-transform group-hover:scale-105 [&_svg]:size-5`}
                >
                  {Icon ? <Icon /> : <span className="size-2.5 rounded-full bg-white" />}
                </div>
                <span
                  className={`hidden sm:inline-flex size-2 rounded-full ${s.key === "online" ? "bg-emerald-400 animate-pulse" : s.key === "router" ? "bg-emerald-400/60" : s.key === "proxmox" ? "bg-violet-400/60" : s.key === "docker" ? "bg-cyan-400/60" : "bg-indigo-400/60"}`}
                />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
              <p className="mt-1 font-mono text-[28px] font-extrabold leading-none tracking-tight text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-500">
                {s.key === "online"
                  ? `${counts.offline} offline`
                  : s.key === "total"
                    ? "terinventaris"
                    : `${DEVICES.filter((d) => d.type === s.key && d.status === "online").length} online`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="animate-fade-up stagger-2 flex flex-col gap-3 rounded-2xl border border-white/8 bg-slate-900/40 p-3 backdrop-blur sm:flex-row sm:items-center sm:p-3">
        <label className="group flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-slate-400 transition-colors focus-within:border-emerald-500/40 focus-within:bg-white/[0.06] focus-within:text-white">
          <Search className="size-4 shrink-0 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, IP, MAC, lokasi…"
            className="w-full bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <Times className="size-3.5" />
            </button>
          )}
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none sm:shrink-0">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                tab === t.value
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 shadow-[0_0_20px_-12px_rgba(16,185,129,0.6)]"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/15 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${
                  tab === t.value ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-slate-400"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {(tab === "all" || tab === "router") && <GroupSection type="router" items={groups.router} />}
        {(tab === "all" || tab === "proxmox") && <GroupSection type="proxmox" items={groups.proxmox} />}
        {(tab === "all" || tab === "docker") && <GroupSection type="docker" items={groups.docker} />}
      </div>

      <p className="pb-2 text-center text-[11px] font-medium tracking-wide text-slate-600">
        3 grup aktif · Klik Router → /mikrotik · Proxmox/VM → /proxmox · Docker → /docker
      </p>
    </div>
  );
}
