"use client";

import {
  BookOpen,
  House,
  MessageSquare,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const navigation: NavigationItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

function isCurrentRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function PrimaryNavigation({ label }: { label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="primary-navigation">
      {navigation.map((item) => {
        const current = isCurrentRoute(pathname, item.href);
        const NavigationIcon = item.icon;

        return (
          <Link
            aria-current={current ? "page" : undefined}
            className="nav-link"
            href={item.href}
            key={item.href}
          >
            <NavigationIcon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopSidebar({ account }: { account: ReactNode }) {
  return (
    <aside aria-label="Application sidebar" className="desktop-sidebar">
      <PrimaryNavigation label="Primary navigation" />
      <div className="sidebar-account">{account}</div>
    </aside>
  );
}

export function MobileTabBar() {
  return (
    <div className="mobile-tab-bar">
      <PrimaryNavigation label="Mobile primary navigation" />
    </div>
  );
}
