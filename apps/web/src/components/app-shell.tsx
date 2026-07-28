import Link from "next/link";

import { AuthControls } from "./auth-controls";
import { Icon } from "./icon";

const navigation = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/lessons", label: "Lessons", icon: "lessons" as const },
  { href: "/practice", label: "Practice", icon: "practice" as const },
  { href: "/settings", label: "Settings", icon: "settings" as const },
];

function PrimaryNavigation({ label }: { label: string }) {
  return (
    <nav className="primary-navigation" aria-label={label}>
      {navigation.map((item) => (
        <Link key={item.href} className="nav-link" href={item.href}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="AIdioma home">
          <span className="wordmark-mark" aria-hidden="true">
            Ai
          </span>
          <span>AIdioma</span>
        </Link>
        <div className="desktop-navigation">
          <PrimaryNavigation label="Primary navigation" />
        </div>
        <AuthControls />
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
      <div className="mobile-navigation">
        <PrimaryNavigation label="Mobile primary navigation" />
      </div>
    </div>
  );
}
