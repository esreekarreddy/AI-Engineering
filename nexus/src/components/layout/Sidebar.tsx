"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Server, History, Settings, Zap } from "lucide-react";

const navItems = [
  { href: "/", icon: Cpu, label: "Agent" },
  { href: "/servers", icon: Server, label: "Servers" },
  { href: "/traces", icon: History, label: "Traces" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col z-50">
      {/* Logo */}
      <div className="h-[var(--header-height)] flex items-center px-5 border-b border-[var(--border-subtle)]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-cyan)] flex items-center justify-center group-hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            SR <span className="gradient-text">Nexus</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-[var(--transition-fast)]
                ${
                  isActive
                    ? "bg-[var(--accent-violet-muted)] text-[var(--accent-violet-hover)] border border-[var(--accent-violet)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }
              `}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-[var(--accent-violet)]" : ""
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span>Local Mode</span>
        </div>
      </div>
    </aside>
  );
}
