import { AuthControls } from "./auth-controls";
import { DesktopSidebar, MobileTabBar } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-viewport">
      <div className="app-canvas">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <DesktopSidebar account={<AuthControls />} />
        <div className="screen-stage">
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
          <MobileTabBar />
        </div>
      </div>
    </div>
  );
}
