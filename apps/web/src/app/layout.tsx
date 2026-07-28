import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/app-shell";
import { AuthBoundary } from "@/components/auth-boundary";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AIdioma — Spanish practice",
    template: "%s — AIdioma",
  },
  description: "Thoughtful Spanish practice for durable progress.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efece3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e11" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthBoundary>
            <AppShell>{children}</AppShell>
          </AuthBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
