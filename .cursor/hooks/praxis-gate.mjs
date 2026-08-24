#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { join } from "node:path";
const projectRoot="/Users/mike/Documents/Projects/AIdioma";
const cliEntry="/Users/mike/.cursor/extensions/agoralabs.praxis-extension-0.1.0-alpha.2/dist/praxis.cjs";
const chunks=[]; process.stdin.setEncoding("utf8");
process.stdin.on("data",c=>chunks.push(c));
process.stdin.on("end",()=>{
  const args=[cliEntry,"gate","active-flush","--hook"];
  if(process.env.PRAXIS_LINK_PROBE==="1")args.push("--probe-only");
  const result=spawnSync(process.execPath,args,{input:chunks.join(""),encoding:"utf8",cwd:projectRoot});
  if(result.status===0||result.status===1){process.stdout.write(result.stdout);process.exit(0)}
  process.stdout.write(JSON.stringify({permission:"deny",agent_message:"Praxis gate unavailable. Human recovery: run praxis hooks repair --adapter cursor."}));
  process.exit(0);
});
