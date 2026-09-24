"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Gauge,
  ThLarge,
  Search,
  Server,
  Sidebar as SidebarIcon,
  Sitemap,
  Home,
  Inbox,
  Users,
  Cog,
} from "@primeicons/react";
import { useIsMobile } from "@primereact/hooks";
import { Avatar } from "@primereact/ui/avatar";
import { Button } from "@primereact/ui/button";
import { Sidebar } from "@primereact/ui/sidebar";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

const MENU = [
  { icon: Gauge, label: "Beranda", path: "/" },
  { icon: Sitemap, label: "Mikrotik", path: "/mikrotik" },
  { icon: Server, label: "Proxmox", path: "/proxmox" },
  { icon: ThLarge, label: "Docker", path: "/docker" },
];

export default function SidebarMenu({ children }) {
  const isMobile = useIsMobile(1024);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <Sidebar.Layout className="min-h-192! relative!">
        {isMobile && <Sidebar.Backdrop className="absolute!" />}
        <Sidebar.Root
          id="mobile-nav"
          collapsible={isMobile ? "offcanvas" : "icon"}
          overlay={isMobile}
          defaultOpen={!isMobile}
          width="14rem"
        >
          <Sidebar.Spacer />
          <Sidebar.Aside>
            <Sidebar.Panel>
              <Sidebar.Header>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton className="p-1!">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/25 text-slate-950 text-sm font-extrabold">
                        FR
                      </div>
                      <span className="flex flex-col leading-none text-left">
                        <span className="font-extrabold text-[15px] tracking-tight">
                          FARAYMON
                        </span>
                        <span className="text-[11px] font-medium">
                          Network Monitor
                        </span>
                      </span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Header>

              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Monitoring</Sidebar.GroupLabel>
                  <Sidebar.GroupContent>
                    <Sidebar.Menu className="gap-1!">
                      {MENU.map((item) => {
                        const isActive = item.path
                          ? pathname === item.path
                          : false;
                        return (
                          <Sidebar.MenuItem key={item.label}>
                            <Sidebar.MenuButton
                              isActive={isActive}
                              onClick={
                                item.path
                                  ? () => router.push(item.path)
                                  : undefined
                              }
                              className={
                                isActive
                                  ? isLight
                                    ? "bg-emerald-50! text-emerald-700! border border-emerald-200! rounded-xl! shadow-sm!"
                                    : "bg-linear-to-r from-emerald-500/20 to-cyan-500/10! text-white! border border-emerald-500/25! rounded-xl! shadow-[0_8px_24px_-12px_rgba(16,185,129,0.5)]!"
                                  : isLight
                                    ? "text-slate-600! hover:text-slate-900! hover:bg-slate-100! rounded-xl! border border-transparent!"
                                    : "text-slate-400! hover:text-white! hover:bg-white/5! rounded-xl! border border-transparent!"
                              }
                            >
                              <item.icon
                                className={
                                  isActive
                                    ? isLight
                                      ? "text-emerald-600!"
                                      : "text-emerald-400!"
                                    : ""
                                }
                              />
                              <span
                                className={`text-[13.5px] font-semibold ${isActive ? (isLight ? "text-emerald-700!" : "text-emerald-400!") : ""}`}
                              >
                                {item.label}
                              </span>
                            </Sidebar.MenuButton>
                            {item.badge && (
                              <Sidebar.MenuBadge className="bg-emerald-500/15! text-emerald-300! border border-emerald-500/25! rounded-full! text-[11px]! font-bold!">
                                {item.badge}
                              </Sidebar.MenuBadge>
                            )}
                          </Sidebar.MenuItem>
                        );
                      })}
                    </Sidebar.Menu>
                  </Sidebar.GroupContent>
                </Sidebar.Group>
              </Sidebar.Content>

              <Sidebar.Footer>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton className="p-1!">
                      <Avatar.Root
                        className="size-6! shrink-0! text-xs!"
                        shape="circle"
                      >
                        <Avatar.Fallback>JD</Avatar.Fallback>
                      </Avatar.Root>
                      <span>John Doe</span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Footer>
            </Sidebar.Panel>
          </Sidebar.Aside>
        </Sidebar.Root>

        <Sidebar.Main>
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-xl md:px-8">
            <Sidebar.Trigger
              as={Button}
              severity="secondary"
              variant="text"
              size="small"
              iconOnly
              className="rounded-xl"
            >
              <SidebarIcon />
            </Sidebar.Trigger>

            <div className="hidden md:flex items-center gap-2 text-[13px]">
              <span
                className={
                  isLight
                    ? "text-slate-600 font-medium"
                    : "text-slate-500 font-medium"
                }
              >
                Sentinel
              </span>
              <span className={isLight ? "text-slate-300" : "text-slate-700"}>
                /
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="hidden lg:flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] focus-within:border-emerald-500/40 transition-colors w-64">
                <Search className="size-4 shrink-0" />
                <input
                  placeholder="Cari interface, log, user…"
                  className="w-full bg-transparent outline-none"
                />
                <kbd className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  ⌘K
                </kbd>
              </label>
              <ThemeToggle />
              <Button
                severity="secondary"
                variant="outlined"
                size="small"
                iconOnly
                className="relative!"
              >
                <Bell />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-400" />
              </Button>
              <Avatar.Root
                className="size-8! text-xs! font-bold! bg-linear-to-br from-emerald-400 to-cyan-600! text-slate-950!"
                shape="circle"
              >
                <Avatar.Fallback>AD</Avatar.Fallback>
              </Avatar.Root>
            </div>
          </header>
          {children}
        </Sidebar.Main>
      </Sidebar.Layout>
    </div>
  );
}
