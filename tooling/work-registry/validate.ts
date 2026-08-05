import { pathToFileURL } from "node:url";

import { derive } from "./derive.js";

async function main(): Promise<void> {
  const index = await derive({ writeIndex: true });
  const parseErrors = index.issues.filter((issue) => issue.kind === "parse_error");
  const broken = index.issues.filter((issue) => issue.kind === "broken_link");

  console.log(
    `derive ok — phases=${index.phases.length} specs=${index.specs.length} issues=${index.issues.length} next=${index.next_command ?? "none"}`,
  );
  if (parseErrors.length > 0) {
    for (const issue of parseErrors) {
      console.error(`parse_error ${issue.ref}: ${issue.summary}`);
    }
    process.exitCode = 1;
  }
  if (broken.length > 0) {
    for (const issue of broken) {
      console.warn(`broken_link ${issue.ref}: ${issue.summary}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
