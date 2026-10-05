"use client";

import { Search, Sitemap, Times } from "@primeicons/react";
import { Icon, useTheme } from "@primereact/core";
import { Card } from "@primereact/ui/card";
import { useMemo, useState } from "react";
import { getDeviceHref } from "@/data/device";
import useSWR from "swr";
import { useRouter } from "next/navigation";
const fetcher = (u) => fetch(u).then((r) => r.json());
function StatusBadge({ status }) {
  const online = status === true;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${
        online
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/25 bg-rose-500/10 text-rose-300"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}
export default function MikroTikPage() {
  const [query, setQuery] = useState("");
  const { data } = useSWR("/api?type=mikrotik", fetcher, {
    refreshInterval: 30000,
  });
  const { theme } = useTheme();
  const isLight = theme === "light";
  const router = useRouter();
  const items = useMemo(() => data?.data || [], [data]);
  const stats = useMemo(() => {
    const total = items.length;

    const online = items.filter((device) => device.online === true).length;

    const offline = items.filter((device) => device.online === false).length;

    return {
      total,
      online,
      offline,
    };
  }, [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((device) =>
      [device.name, device.identity, device.host, device.mac, device.location, device.model, device.version]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  return (
    <div className="space-y-7">
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-gradient text-2xl font-extrabold tracking-tight md:text-[28px]">
                Router
              </h1>
            </div>
          </div>
          {query && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
              {filtered.length} hasil untuk &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
      </div>

      <section className="animate-fade-up">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30 text-slate-950 shadow-lg [&_svg]:size-4.5`}
          >
            <Sitemap />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold tracking-tight text-white">
              Mikrotik
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold leading-none text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stats.online}/{stats.total} Online
              </span>
              {stats.offline > 0 && (
                <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {stats.offline} Offline
                </span>
              )}
            </h2>
            <p className="truncate text-xs text-slate-500">
              klik kartu untuk buka Mikrotik
            </p>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 py-12 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500">
              <Icon className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-300">
              Tidak ada perangkat
            </p>
            <p className="text-xs text-slate-500">
              {query
                ? `Tidak ada Mikrotik yang cocok dengan "${query}".`
                : "Belum ada perangkat Mikrotik terdaftar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((device) => (
              <Card.Root
                /* 2. UBAH key agar mengarah ke ID unik device (misal: device.id atau device.uuid) */
                key={device.id}
                onClick={() => router.push(getDeviceHref(device))}
                className="cursor-pointer group h-full bg-transparent! border-0! shadow-none! p-0!"
              >
                <Card.Body
                  className={
                    isLight
                      ? `animate-fade-up flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md`
                      : `glass card-ring animate-fade-up flex h-full flex-col rounded-2xl border border-white/8! bg-slate-900/60! p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.35)]`
                  }
                >
                  <Card.Caption>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30 text-slate-950 shadow-lg transition-transform duration-300 group-hover:scale-105 [&_svg]:size-5`}
                      >
                        <Sitemap />
                      </div>
                      <StatusBadge status={device.online} />
                    </div>
                  </Card.Caption>

                  <Card.Content className="flex-1">
                    {/* Sekarang data di bawah ini akan sukses terbaca */}
                    <h3 className="mt-4 truncate text-[15px] font-extrabold tracking-tight text-white">
                      {`${device.name} || ${device.identity}`}
                    </h3>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                      {device.model}
                    </p>
                    <div className="mt-3 space-y-2 border-t border-white/8 pt-3 font-mono text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">IP</span>
                        <span className="font-semibold tracking-tight text-slate-200">
                          {device.host}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">MAC</span>
                        <span className="truncate font-semibold text-slate-300">
                          {device.mac}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Lokasi</span>
                        <span className="truncate font-sans text-[12px] font-semibold text-slate-300">
                          {device.location}
                        </span>
                      </div>
                    </div>
                  </Card.Content>

                  <Card.Footer className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-slate-400">
                      {device.version}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-300 transition-colors">
                      Buka →
                    </span>
                  </Card.Footer>
                </Card.Body>
              </Card.Root>
            ))}
          </div>
        )}
      </section>

      <div className="animate-fade-up stagger-2 flex flex-col gap-3 rounded-2xl border border-white/8 bg-slate-900/40 p-3 backdrop-blur sm:flex-row sm:items-center sm:p-3">
        <label className="group flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-400 transition-colors focus-within:border-emerald-500/40 focus-within:bg-white/6 focus-within:text-white">
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
      </div>

      <div className="space-y-8">
        {/* {(tab === "all" || tab === "router") && (
          <GroupSection type="router" items={groups.router} />
        )}
        {(tab === "all" || tab === "proxmox") && (
          <GroupSection type="proxmox" items={groups.proxmox} />
        )}
        {(tab === "all" || tab === "docker") && (
          <GroupSection type="docker" items={groups.docker} />
        )} */}
      </div>
    </div>
  );
}
