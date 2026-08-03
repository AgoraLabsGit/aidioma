import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = fileURLToPath(new URL(".", import.meta.url));

function findTurbopackRoot(start: string) {
  let current = start;
  while (true) {
    if (existsSync(path.join(current, "node_modules/next/package.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}

const repositoryRoot = path.resolve(appDirectory, "../..");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: findTurbopackRoot(repositoryRoot),
  },
};

export default nextConfig;
