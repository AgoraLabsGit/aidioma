#!/usr/bin/env node
import { spawnSync } from "node:child_process";
const adapter="codex";
const projectRoot="/Users/mike/Documents/Projects/AIdioma";
const cliEntry="/Users/mike/.cursor/extensions/agoralabs.praxis-extension-0.1.0-alpha.2/dist/praxis.cjs";
const chunks=[];
process.stdin.setEncoding("utf8");
process.stdin.on("data",chunk=>chunks.push(chunk));
function decision(reason){return {hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:reason}}}
function patchTargets(command){
  const paths=[];
  for(const match of command.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gmu))paths.push(match[1]);
  for(const match of command.matchAll(/^\*\*\* Move to: (.+)$/gmu))paths.push(match[1]);
  for(const match of command.matchAll(/^\+\+\+ b\/(.+)$/gmu))paths.push(match[1]);
  return [...new Set(paths.filter(path=>path&&path!=="/dev/null"))];
}
process.stdin.on("end",()=>{
  let payload;
  try{payload=JSON.parse(chunks.join("")||"{}")}catch{process.stdout.write(JSON.stringify(decision("Praxis received invalid hook JSON. Human recovery: run praxis hooks repair --adapter "+adapter+".")));return}
  const input=payload&&typeof payload.tool_input==="object"&&payload.tool_input?payload.tool_input:{};
  const targets=adapter==="claude-code"
    ? [input.file_path].filter(path=>typeof path==="string"&&path.length>0)
    : patchTargets(typeof input.command==="string"?input.command:"");
  if(targets.length===0){process.stdout.write(JSON.stringify(decision("Praxis could not identify a covered file target. Human recovery: review the mutation and repair the "+adapter+" adapter.")));return}
  for(const target of targets){
    const normalized=JSON.stringify({tool_name:"Write",tool_input:{file_path:target},cwd:projectRoot,workspace_roots:[projectRoot]});
    const args=[cliEntry,"gate","active-flush","--hook","--adapter",adapter];
    if(process.env.PRAXIS_LINK_PROBE==="1")args.push("--probe-only");
    const result=spawnSync(process.execPath,args,{input:normalized,encoding:"utf8",cwd:projectRoot,timeout:10000,maxBuffer:1024*1024});
    let response;
    try{response=JSON.parse(result.stdout||"{}")}catch{response={}}
    if((result.status!==0&&result.status!==1)||!response||response.source!=="praxis-gate"){
      process.stdout.write(JSON.stringify(decision("Praxis gate unavailable. Human recovery: run praxis hooks repair --adapter "+adapter+".")));return
    }
    if(response.permission==="deny"){
      if(process.env.PRAXIS_LINK_PROBE==="1")process.stdout.write(JSON.stringify({source:"praxis-gate",praxisAdapter:adapter,permission:"deny"}));
      else process.stdout.write(JSON.stringify(decision(String(response.agent_message||response.user_message||"Praxis denied this mutation."))));
      return
    }
  }
  if(process.env.PRAXIS_LINK_PROBE==="1")process.stdout.write(JSON.stringify({source:"praxis-gate",praxisAdapter:adapter,permission:"allow"}));
});
