"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/offers", label: "Offerter", icon: Receipt },
  { href: "/customers", label: "Kunder", icon: Users },
  { href: "/calculator", label: "Kalkylator", icon: Calculator },
  { href: "/materials", label: "Materialbank", icon: Package },
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/settings", label: "Inställningar", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The app's one navigation shell — a fixed left sidebar on desktop, a
 * fixed bottom bar on mobile (enhandsanvändning i fält). Every route
 * renders inside this, per the "Dashboard, never a form first" mandate.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-60 shrink-0 flex-col border-r border-border bg-surface/60 px-3 py-6 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">OffertPro</span>
        </Link>
        <div className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-ink-secondary hover:bg-white/5 hover:text-ink"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex min-h-screen w-full flex-1 flex-col pb-20 lg:pb-0 lg:pl-60">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-ink-muted"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
