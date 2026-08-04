import { pathToFileURL } from "node:url";

import { loadRegistry } from "./loader.js";

export type ValidationOptions = {
  docsRoot?: string;
  requireMigrationReady: boolean;
};

export function parseValidationOptions(argumentsList: string[]): ValidationOptions {
  const options: ValidationOptions = { requireMigrationReady: false };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--require-migration-ready") {
      options.requireMigrationReady = true;
    } else if (argument === "--docs-root") {
      options.docsRoot = argumentsList[index + 1];
      if (!options.docsRoot) throw new Error("--docs-root requires a path.");
      index += 1;
    } else {
      throw new Error(
        "Usage: validate.ts [--docs-root <repository-relative-path>] [--require-migration-ready]",
      );
    }
  }
  return options;
}

export async function validateCurrentRegistry(options: ValidationOptions): Promise<boolean> {
  const snapshot = await loadRegistry({ docsRoot: options.docsRoot });
  for (const item of snapshot.warnings) {
    const label = item.severity === "error" ? "ERROR" : "WARNING";
    console.log(`${label} ${item.code} ${item.sourcePath}: ${item.message}`);
  }

  console.log(
    `Registry: ${snapshot.counts.work} work, ${snapshot.counts.fixes} fixes, ${snapshot.counts.specs} specs, ${snapshot.counts.migrations} migration claims (${snapshot.counts.pendingMigrationDecisions} pending), ${snapshot.counts.errors} errors, ${snapshot.counts.warnings} warnings.`,
  );
  if (options.requireMigrationReady && !snapshot.migrationReady) {
    const reason = snapshot.migrationPresent
      ? "Migration errors or pending founder decisions remain."
      : "The temporary migration registry is missing.";
    console.log(`ERROR migration_not_ready MIGRATION.yaml: ${reason}`);
  }
  return snapshot.valid && (!options.requireMigrationReady || snapshot.migrationReady);
}

async function run(): Promise<void> {
  const valid = await validateCurrentRegistry(parseValidationOptions(process.argv.slice(2)));
  if (!valid) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
