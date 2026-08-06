const PAGE_META = {
  active: { title: "Active", subtitle: "Phases in flight" },
  roadmap: { title: "Roadmap", subtitle: "Phases by state and order" },
  activity: { title: "Activity", subtitle: "Command journal (.work/activity)" },
  knowledge: { title: "Knowledge", subtitle: "Specs, decisions, research, releases" },
  work: { title: "Work", subtitle: "WORK.yaml ledger — fix, task, proposal, research, question" },
  signals: { title: "Signals", subtitle: "Derived health (drift, parse errors, broken links…)" },
};

const DETAIL_WIDTH_KEY = "aidioma-detail-width";
const TOC_WIDTH_KEY = "aidioma-toc-width";
const TOC_COLLAPSED_KEY = "aidioma-toc-collapsed";
const THEME_KEY = "aidioma-dashboard-theme";

const state = {
  index: null,
  page: "active",
  roadmapFilters: { state: "", type: "", q: "", sort: "state" },
  activityFilters: { actor: "", type: "", phase: "", q: "", sort: "time" },
  workFilters: { kind: "", status: "", q: "", sort: "open-first" },
  signalsFilters: { severity: "", kind: "", status: "open", q: "", sort: "severity" },
  knowledgeId: "PRODUCT",
  selectedId: null,
  lastIndexedAt: null,
  tocCollapsed: readStored(TOC_COLLAPSED_KEY) === "1",
};

const panels = {
  active: document.querySelector("#page-active"),
  roadmap: document.querySelector("#page-roadmap"),
  activity: document.querySelector("#page-activity"),
  knowledge: document.querySelector("#page-knowledge"),
  work: document.querySelector("#page-work"),
  signals: document.querySelector("#page-signals"),
};

const indexedAt = document.querySelector("#indexed-at");
const issuePill = document.querySelector("#issue-pill");
const heartbeat = document.querySelector(".heartbeat");
const pageTitle = document.querySelector("#page-title");
const pageSubtitle = document.querySelector("#page-subtitle");
const detail = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailFrontmatter = document.querySelector("#detail-frontmatter");
const detailBody = document.querySelector("#detail-body");
const themeToggle = document.querySelector("#theme-toggle");

function readStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "light" ? "◑ Theme" : "◐ Theme";
  themeToggle.setAttribute("aria-pressed", String(theme === "light"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatAge(iso) {
  if (!iso) return "—";
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ${hours % 24}h ago`;
  return `${days}d ago`;
}

/** Table Age from a date-only field (YYYY-MM-DD) — shows hours when under 48h. */
function formatOpenedAge(opened) {
  if (!opened) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/u.test(opened)) {
    return formatAge(`${opened}T00:00:00.000Z`);
  }
  return formatAge(opened);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

function statusHtml(value) {
  return `<span class="status" data-state="${escapeHtml(value)}">${escapeHtml(value)}</span>`;
}

/** Display SPEC-F-FOO / SPEC-A-BAR as FOO / BAR in tables. Full id in title. */
function shortSpecId(id) {
  if (id == null || id === "") return "—";
  return String(id).replace(/^SPEC-F-/u, "").replace(/^SPEC-A-/u, "");
}

function shortSpecCell(id) {
  if (id == null || id === "") return "—";
  return `<span class="mono" title="${escapeHtml(id)}">${escapeHtml(shortSpecId(id))}</span>`;
}

function featureAreaFromSpecId(specId) {
  if (!specId) return { feature: null, area: null };
  if (String(specId).startsWith("SPEC-A-")) return { feature: null, area: specId };
  if (String(specId).startsWith("SPEC-F-")) return { feature: specId, area: null };
  return { feature: specId, area: null };
}

function chip(name, value, current, label = value) {
  return `<button type="button" class="chip" data-filter="${name}" data-value="${escapeHtml(value)}" aria-pressed="${current === value}">${escapeHtml(label || "All")}</button>`;
}

function searchInput(name, value, placeholder) {
  return `<input class="search" type="search" name="${escapeHtml(name)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" />`;
}

function sortSelect(name, value, options) {
  return `<label class="sort-label">Sort
    <select class="sort-select" name="${escapeHtml(name)}">
      ${options.map(([id, label]) =>
        `<option value="${escapeHtml(id)}"${value === id ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}
    </select>
  </label>`;
}

function matchesQuery(haystack, q) {
  if (!q) return true;
  return String(haystack).toLowerCase().includes(q.toLowerCase());
}

function specsLabel(phase) {
  const specs = phase.amends_specs ?? [];
  if (!specs.length) return "—";
  return specs.join(", ");
}

function parseFrontmatter(raw) {
  const text = String(raw ?? "");
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
    return { meta: {}, body: text };
  }
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { meta: {}, body: text };
  const fm = text.slice(4, end).trim();
  const body = text.slice(end + 4).replace(/^\s*\n/, "");
  const meta = {};
  for (const line of fm.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[match[1]] = value;
  }
  return { meta, body };
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(raw) {
  const withoutComments = String(raw ?? "").replace(/<!--[\s\S]*?-->/g, "");
  const lines = withoutComments.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listType = null; // "ul" | "ol" | "check"
  let inTable = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(listType === "ol" ? "</ol>" : "</ul>");
    listType = null;
  };

  const openList = (type, className = "") => {
    if (listType === type) return;
    flushParagraph();
    closeList();
    if (type === "ol") html.push("<ol>");
    else html.push(className ? `<ul class="${className}">` : "<ul>");
    listType = type;
  };

  const closeTable = () => {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\|.+\|$/.test(trimmed)) {
      flushParagraph();
      closeList();
      const cells = trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
      if (/^[-:| ]+$/.test(cells.join("|"))) continue;
      if (!inTable) {
        html.push("<table class=\"md-table\"><thead>");
        html.push(`<tr>${cells.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr>`);
        html.push("</thead><tbody>");
        inTable = true;
      } else {
        html.push(`<tr>${cells.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`);
      }
      continue;
    }
    closeTable();

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    const checklist = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (checklist) {
      flushParagraph();
      openList("check", "md-checklist proof-checklist");
      const checked = checklist[1].toLowerCase() === "x";
      html.push(`<li data-checked="${checked}">${checkIcon(checked)}<span class="proof-checklist-label">${inlineMarkdown(checklist[2])}</span></li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      openList("ol");
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    const bullet = line.match(/^(?:-|\*(?!\*))\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      openList("ul");
      const item = bullet[1].trim();
      html.push(item
        ? `<li>${inlineMarkdown(item)}</li>`
        : `<li class="muted">(empty)</li>`);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      closeList();
      continue;
    }

    // Soft-wrapped source lines belong to one paragraph until a blank line.
    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  closeTable();
  return html.join("") || "<p class=\"muted\">Empty document.</p>";
}

function metaSummaryHtml(meta, pathLabel) {
  const preferred = ["id", "title", "state", "status", "type", "proof_kind", "kind", "owner", "outcome", "verdict", "chose", "opened", "date"];
  const entries = preferred
    .filter((key) => meta[key] && meta[key] !== "null" && meta[key] !== "[]")
    .map((key) => [key, meta[key]]);
  if (!entries.length && !pathLabel) return "";
  return `
    <details class="doc-meta">
      <summary>Document details</summary>
      <dl>
        ${pathLabel ? `<div><dt>Path</dt><dd class="mono">${escapeHtml(pathLabel)}</dd></div>` : ""}
        ${entries.map(([key, value]) =>
          `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </details>
  `;
}

function renderDocInto({ pathLabel, body }, { metaEl, bodyEl, pathEl }) {
  const { meta, body: md } = parseFrontmatter(body);
  if (pathEl) pathEl.textContent = pathLabel ?? "";
  if (metaEl) {
    const html = metaSummaryHtml(meta, null);
    metaEl.hidden = !html;
    metaEl.innerHTML = html;
  }
  bodyEl.innerHTML = renderMarkdown(md);
}

function currentPhases(index) {
  const active = index.phases.filter((phase) => phase.state === "active");
  const blocked = index.phases.filter((phase) => phase.state === "blocked");
  return [...active, ...blocked];
}

function parseChecklistItem(raw) {
  const text = String(raw).trim();
  const match = text.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
  if (match) return { checked: match[1].toLowerCase() === "x", label: match[2] };
  return { checked: false, label: text };
}

function checkIcon(checked) {
  // Status dots only — no checkmark glyph (founder: colored circles).
  return `<span class="check" data-checked="${checked ? "true" : "false"}" aria-hidden="true"></span>`;
}

function checklistHtml(items) {
  if (!items?.length) return "";
  return `<ul class="proof-checklist">${items.map((item) => {
    const parsed = parseChecklistItem(item);
    return `<li>
      ${checkIcon(parsed.checked)}
      <span class="proof-checklist-label">${escapeHtml(parsed.label)}</span>
    </li>`;
  }).join("")}</ul>`;
}

function typeLabel(type) {
  if (type === "design") return "Design";
  if (type === "build") return "Build";
  return type ?? "—";
}

function phaseRelatedIssues(index, phaseId) {
  return (index.issues ?? []).filter((issue) =>
    issue.ref === phaseId
    || issue.summary?.includes(phaseId)
    || (issue.spec && (index.phases.find((p) => p.id === phaseId)?.amends_specs ?? []).includes(issue.spec)));
}

function phaseSpecPaths(index, phase) {
  const specs = index.specs ?? [];
  const amended = phase.amends_specs ?? [];
  if (!amended.length) return [];
  return amended.map((id) => {
    const spec = specs.find((item) => item.id === id);
    return {
      id,
      title: spec?.title ?? id,
      paths: spec?.paths ?? [],
    };
  });
}

function extractMarkdownSection(body, heading) {
  const pattern = new RegExp(
    `##\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n+([\\s\\S]*?)(?=\\n##\\s|$)`,
    "u",
  );
  const match = String(body ?? "").match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractProofChecklistFromBody(body) {
  const section = extractMarkdownSection(body, "Proof");
  if (!section) return [];
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+\[[ xX]\]/.test(line));
}

function gitGlance(index) {
  const repo = index.repo ?? {};
  return `${repo.branch ?? "—"} · ${repo.clean ? "clean" : "dirty"} · ↑${repo.ahead ?? 0} ↓${repo.behind ?? 0}`;
}

function signalsGlance(index, relatedSignals) {
  if (relatedSignals.length) return `${relatedSignals.length} related`;
  const high = (index.issues ?? []).filter((issue) => issue.severity === "high").length;
  return `${high} high / ${(index.issues ?? []).length} total`;
}

function workGlance(index, phaseId) {
  const related = (index.work ?? []).filter((row) => row.phase === phaseId);
  if (related.length) return `${related.length} related`;
  const open = (index.work ?? []).filter((row) => row.status === "open" || row.status === "active").length;
  return `${open} open / ${(index.work ?? []).length} total`;
}

function glanceCellHtml(label, value, { mono = false } = {}) {
  return `
    <div class="glance-cell">
      <dt>${escapeHtml(label)}</dt>
      <dd class="${mono ? "mono" : ""}">${value}</dd>
    </div>
  `;
}

function glanceTwoColHtml(phase, index, relatedIssues) {
  const pairs = [
    [
      ["State", statusHtml(phase.state)],
      ["Proof", escapeHtml(phase.proof_kind)],
    ],
    [
      ["Type", escapeHtml(typeLabel(phase.type))],
      ["Git", escapeHtml(gitGlance(index)), { mono: true }],
    ],
    [
      ["Owner", escapeHtml(phase.owner ?? "—")],
      ["Check", escapeHtml(index.last_check?.status ?? "—")],
    ],
    [
      ["Opened", escapeHtml(phase.opened)],
      ["Work", escapeHtml(workGlance(index, phase.id))],
    ],
    [
      ["Signals", escapeHtml(signalsGlance(index, relatedIssues))],
      ["Amends", escapeHtml(specsLabel(phase)), { mono: true }],
    ],
  ];

  let extra = "";
  if (phase.closed || phase.lessons) {
    extra = `
      <div class="glance-extra">
        ${phase.closed ? glanceCellHtml("Closed", escapeHtml(phase.closed)) : ""}
        ${phase.lessons ? glanceCellHtml("Lessons", escapeHtml(phase.lessons)) : ""}
      </div>
    `;
  }

  return `
    <dl class="glance-grid">
      ${pairs.map(([left, right]) => `
        ${glanceCellHtml(left[0], left[1], left[2])}
        ${glanceCellHtml(right[0], right[1], right[2])}
      `).join("")}
    </dl>
    ${extra}
  `;
}

function listOrEmpty(items, empty = "None") {
  if (!items?.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function codeListOrEmpty(ids, empty = "None") {
  if (!ids?.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<p>${ids.map((id) => `<code>${escapeHtml(id)}</code>`).join(" ")}</p>`;
}

function pathsBlockHtml(specPaths) {
  if (!specPaths.length) {
    return `<p class="muted">No file trees yet — phase has no <code>amends_specs</code>, or those specs have empty <code>paths</code>.</p>`;
  }
  return specPaths.map((spec) => `
    <div class="path-group">
      <div class="path-group-title"><code>${escapeHtml(spec.id)}</code> ${escapeHtml(spec.title)}</div>
      ${
        spec.paths.length
          ? `<ul class="path-list">${spec.paths.map((path) => `<li class="mono">${escapeHtml(path)}</li>`).join("")}</ul>`
          : `<p class="muted">No paths declared on this spec.</p>`
      }
    </div>
  `).join("");
}

function relatedIssuesHtml(relatedIssues) {
  if (!relatedIssues.length) return `<p class="muted">No related signals.</p>`;
  return `<ul>${relatedIssues.map((issue) => `
    <li>
      <span class="status" data-state="${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
      <code>${escapeHtml(issue.ref)}</code>
      <span>${escapeHtml(issue.summary)}</span>
    </li>`).join("")}</ul>`;
}

function relatedWorkHtml(index, phaseId) {
  const rows = (index.work ?? []).filter((row) => row.phase === phaseId);
  if (!rows.length) return `<p class="muted">No work tagged to this phase.</p>`;
  return `<ul>${rows.map((row) => `
    <li>
      <code>${escapeHtml(row.id)}</code>
      <span>${escapeHtml(row.kind)}</span>
      <span>${escapeHtml(row.summary)}</span>
    </li>`).join("")}</ul>`;
}

/** Shared Active + Detail projection for a phase. */
function renderPhaseView(phase, index, { primary = false, compact = false } = {}) {
  const checklist = primary ? (index.active_proof_checklist ?? []) : [];
  const relatedIssues = phaseRelatedIssues(index, phase.id);
  const specPaths = phaseSpecPaths(index, phase);
  const nonGoals = phase.non_goals ?? [];
  const deps = phase.depends_on ?? [];
  const specs = phase.amends_specs ?? [];

  return `
    <article class="phase-view${compact ? " phase-view-compact" : ""}" data-phase="${escapeHtml(phase.id)}" data-phase-doc="${escapeHtml(phase.id)}">
      <header class="phase-header">
        <p class="phase-id-row"><code>${escapeHtml(phase.id)}</code></p>
        <h2 class="phase-name">${escapeHtml(phase.title)}</h2>
        <p class="phase-outcome">${escapeHtml(phase.outcome)}</p>
        ${
          phase.state === "blocked"
            ? `<p class="now-hint">${escapeHtml(index.blocked_reason || "Blocked — see Context in the phase file.")}</p>`
            : ""
        }
      </header>

      <section class="phase-block">
        <h3 class="now-label">Status</h3>
        ${glanceTwoColHtml(phase, index, relatedIssues)}
      </section>

      <section class="phase-card">
        <div class="phase-card-section">
          <h3 class="now-label">Context</h3>
          <div class="prose" data-section="Context"><p class="muted">Loading…</p></div>
          <h4 class="phase-subhead">Out of scope</h4>
          ${
            nonGoals.length
              ? `<ul class="phase-plain-list">${nonGoals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : `<p class="muted">None listed</p>`
          }
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Plan</h3>
          <div class="prose" data-section="Plan"><p class="muted">Loading…</p></div>
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Proof</h3>
          <p>${escapeHtml(phase.proof)}</p>
          <div data-proof-checklist="${escapeHtml(phase.id)}">${
            checklist.length
              ? checklistHtml(checklist)
              : `<p class="muted">Loading…</p>`
          }</div>
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Dependencies</h3>
          ${codeListOrEmpty(deps, "None")}
          ${
            phase.from_backlog
              ? `<p class="muted">From backlog: <code>${escapeHtml(phase.from_backlog)}</code></p>`
              : ""
          }
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Specs amended</h3>
          ${codeListOrEmpty(specs, "None yet")}
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Inputs</h3>
          <div class="prose" data-section="Inputs"><p class="muted">Loading…</p></div>
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Files</h3>
          ${pathsBlockHtml(specPaths)}
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Work</h3>
          ${relatedWorkHtml(index, phase.id)}
          <h3 class="now-label">Signals</h3>
          ${relatedIssuesHtml(relatedIssues)}
        </div>

        <div class="phase-card-section phase-stub">
          <h3 class="now-label">Audits</h3>
          <p class="muted">Not projected yet — close-check / steward evidence for this phase will land here.</p>
        </div>

        ${
          phase.type === "build"
            ? `<div class="phase-card-section phase-stub">
                <h3 class="now-label">Tests</h3>
                <p class="muted">Not projected yet — test runs tied to this phase will land here.</p>
              </div>`
            : ""
        }
      </section>
    </article>
  `;
}

async function hydratePhaseDocs(root = document) {
  const hosts = root.querySelectorAll("[data-phase-doc]");
  await Promise.all([...hosts].map(async (host) => {
    const phaseId = host.dataset.phaseDoc;
    if (!phaseId) return;
    try {
      const response = await fetch(`/api/doc?id=${encodeURIComponent(phaseId)}`);
      if (!response.ok) throw new Error(`doc ${response.status}`);
      const doc = await response.json();
      const { body } = parseFrontmatter(doc.body);
      for (const name of ["Context", "Inputs", "Plan"]) {
        const slot = host.querySelector(`[data-section="${name}"]`);
        if (!slot) continue;
        const section = extractMarkdownSection(body, name);
        slot.innerHTML = section
          ? renderMarkdown(section)
          : `<p class="muted">No ${name} section in phase file.</p>`;
      }
      const checklistSlot = host.querySelector(`[data-proof-checklist="${phaseId}"]`);
      if (checklistSlot && checklistSlot.querySelector(".muted")) {
        const items = extractProofChecklistFromBody(body);
        checklistSlot.innerHTML = items.length
          ? checklistHtml(items)
          : `<p class="muted">No checklist items in Proof section.</p>`;
      }
    } catch {
      for (const slot of host.querySelectorAll("[data-section]")) {
        slot.innerHTML = `<p class="muted">Could not load phase document.</p>`;
      }
    }
  }));
}

function renderActive(index) {
  const phases = currentPhases(index);
  const ready = index.phases.find((item) => item.state === "ready");

  if (phases.length === 0) {
    panels.active.innerHTML = `
      <div class="now">
        <div class="phase-view">
          <header class="phase-header">
            <p class="phase-id-row">No phase in flight</p>
            <h2 class="phase-name">${ready ? escapeHtml(ready.title) : "Nothing active"}</h2>
            <p class="phase-outcome">${ready ? escapeHtml(ready.outcome) : "Promote a ready phase with /run, or schedule one with /plan."}</p>
          </header>
        </div>
        <section class="phase-block">
          <h3 class="now-label">Handoff</h3>
          <pre class="handoff">${escapeHtml(index.handoff.body || "No handoff yet.")}</pre>
        </section>
      </div>
    `;
    return;
  }

  panels.active.innerHTML = `
    <div class="now">
      ${phases.length > 1 ? `<p class="now-hint multi-note">${phases.length} phases in flight. Same layout per phase — ready for parallel work later.</p>` : ""}
      <div class="phase-stack">
        ${phases.map((phase, index_) => renderPhaseView(phase, index, {
          primary: index_ === 0,
        })).join("")}
      </div>
      <section class="phase-block">
        <h3 class="now-label">Handoff ${index.handoff.updated_at ? `· ${escapeHtml(formatAge(index.handoff.updated_at))}` : ""}</h3>
        <pre class="handoff">${escapeHtml(index.handoff.body || "No handoff yet.")}</pre>
      </section>
    </div>
  `;
  void hydratePhaseDocs(panels.active);
}

function stateRank(value) {
  return { active: 0, blocked: 1, ready: 2, proposed: 3, closed: 4, canceled: 5 }[value] ?? 9;
}

function renderRoadmap(index) {
  const { state: stateFilter, type: typeFilter, q, sort } = state.roadmapFilters;
  let rows = [...index.phases]
    .filter((phase) => (!stateFilter || phase.state === stateFilter) && (!typeFilter || phase.type === typeFilter))
    .filter((phase) => matchesQuery(`${phase.id} ${phase.title} ${specsLabel(phase)}`, q));

  rows.sort((left, right) => {
    if (sort === "order") return left.order - right.order;
    if (sort === "age") return right.age_days - left.age_days;
    if (sort === "title") return left.title.localeCompare(right.title);
    return stateRank(left.state) - stateRank(right.state) || left.order - right.order;
  });

  const body = rows.map((phase) => `
    <tr data-id="${escapeHtml(phase.id)}" data-type="${escapeHtml(phase.type)}" data-state="${escapeHtml(phase.state)}" ${state.selectedId === phase.id ? 'data-selected="true"' : ""}>
      <td class="mono">${escapeHtml(phase.id)}</td>
      <td class="${phase.type === "design" ? "type-design" : ""}">${escapeHtml(typeLabel(phase.type))}</td>
      <td class="wrap">
        <span class="cell-primary">${escapeHtml(phase.title)}</span>
        ${
          phase.state === "canceled" && phase.lessons
            ? `<span class="cell-secondary">Lessons: ${escapeHtml(phase.lessons)}</span>`
            : ""
        }
      </td>
      <td>${shortSpecCell(phase.feature)}</td>
      <td>${shortSpecCell(phase.area)}</td>
      <td>${statusHtml(phase.state)}</td>
      <td title="opened ${escapeHtml(phase.opened ?? "")}">${escapeHtml(formatOpenedAge(phase.opened))}</td>
    </tr>
  `).join("");

  panels.roadmap.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("roadmap-q", q, "Search phases…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">State</span>
          ${chip("state", "", stateFilter, "All")}
          ${["active", "ready", "proposed", "blocked", "closed", "canceled"].map((value) => chip("state", value, stateFilter)).join("")}
        </div>
        <div class="chip-group">
          <span class="chip-label">Type</span>
          ${chip("type", "", typeFilter, "All")}
          ${chip("type", "build", typeFilter, "Build")}
          ${chip("type", "design", typeFilter, "Design")}
        </div>
        ${sortSelect("roadmap-sort", sort, [["state", "State"], ["order", "Order"], ["age", "Age"], ["title", "Title"]])}
      </div>
    </div>
    <p class="table-meta">Showing ${rows.length} of ${index.phases.length} · columns: ID, Kind, Summary, Feature, Area, Status, Age</p>
    <div class="table-frame">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Kind</th><th class="wrap">Summary</th><th>Feature</th><th>Area</th><th>Status</th><th>Age</th>
          </tr>
        </thead>
        <tbody>${body || `<tr><td colspan="7">No phases match.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function activityRefPhaseCells(event) {
  const ref = event.ref ?? null;
  const phase = event.phase ?? null;
  const same = Boolean(ref && phase && ref === phase);
  if (same) {
    return `<td class="mono" colspan="2" title="Ref and Phase are the same">${escapeHtml(ref)}</td>`;
  }
  return `<td class="mono">${escapeHtml(ref ?? "—")}</td><td class="mono">${escapeHtml(phase ?? "—")}</td>`;
}

function renderActivity(index) {
  const { actor, type, phase, q, sort } = state.activityFilters;
  const source = index.activity.current_month ?? [];
  if (source.length === 0) {
    panels.activity.innerHTML = `<div class="empty">Commands will appear here as they run.</div>`;
    return;
  }

  let events = source
    .filter((event) => !actor || event.actor === actor)
    .filter((event) => !type || event.type === type)
    .filter((event) => !phase || event.phase === phase)
    .filter((event) => matchesQuery(`${event.type} ${event.summary} ${event.ref ?? ""} ${event.phase ?? ""} ${event.cmd ?? ""}`, q));

  events = [...events].sort((left, right) => {
    if (sort === "type") return left.type.localeCompare(right.type) || right.ts.localeCompare(left.ts);
    if (sort === "phase") return String(left.phase ?? "").localeCompare(String(right.phase ?? "")) || right.ts.localeCompare(left.ts);
    return right.ts.localeCompare(left.ts);
  });

  const types = [...new Set(source.map((event) => event.type))].sort();
  const phases = [...new Set(source.map((event) => event.phase).filter(Boolean))].sort();

  panels.activity.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("activity-q", q, "Search activity…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Actor</span>
          ${chip("actor", "", actor, "All")}
          ${chip("actor", "agent", actor)}
          ${chip("actor", "user", actor)}
        </div>
        <div class="chip-group">
          <span class="chip-label">Type</span>
          ${chip("type", "", type, "All")}
          ${types.map((value) => chip("type", value, type)).join("")}
        </div>
        <div class="chip-group">
          <span class="chip-label">Phase</span>
          ${chip("phase", "", phase, "All")}
          ${phases.map((value) => chip("phase", value, phase)).join("")}
        </div>
        ${sortSelect("activity-sort", sort, [["time", "Time"], ["type", "Type"], ["phase", "Phase"]])}
      </div>
    </div>
    <p class="table-meta">Showing ${events.length} of ${source.length} · columns: ID, Kind, Summary, Feature, Area, Status, Age</p>
    <div class="table-frame">
      <table>
        <thead><tr><th>ID</th><th>Kind</th><th class="wrap">Summary</th><th>Feature</th><th>Area</th><th>Status</th><th>Age</th></tr></thead>
        <tbody>
          ${events.map((event) => {
            const idLabel = event.ref ?? event.phase ?? "—";
            const phaseNote = event.phase && event.ref && event.phase !== event.ref
              ? event.phase
              : null;
            return `
            <tr>
              <td class="mono" title="${escapeHtml([event.ref, event.phase].filter(Boolean).join(" · "))}">${escapeHtml(idLabel)}${phaseNote ? `<span class="cell-secondary">${escapeHtml(phaseNote)}</span>` : ""}</td>
              <td>${escapeHtml(event.type)}</td>
              <td class="wrap"><span class="cell-primary">${escapeHtml(event.summary)}</span><span class="cell-secondary">${escapeHtml(event.actor)}</span></td>
              <td>—</td>
              <td>—</td>
              <td>${statusHtml(event.status ?? "complete")}</td>
              <td class="mono" title="${escapeHtml(event.ts)}">${escapeHtml(formatAge(event.ts))}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="7">No events match.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function knowledgeItems(index) {
  return [
    {
      id: "product",
      label: "Product",
      items: [{ id: "PRODUCT", title: "PRODUCT.md", secondary: "who / what / never" }],
    },
    {
      id: "specs",
      label: "Specs",
      items: (index.specs ?? []).map((spec) => ({
        id: spec.id,
        title: spec.title,
        secondary: `${shortSpecId(spec.id)} · ${spec.status}`,
      })),
    },
    {
      id: "decisions",
      label: "Decisions",
      items: (index.decisions ?? []).map((decision) => ({
        id: decision.id,
        title: decision.title,
        secondary: `${decision.id} · ${decision.date}`,
      })),
    },
    {
      id: "research",
      label: "Research",
      items: (index.research ?? []).map((item) => ({
        id: item.id,
        title: item.question,
        secondary: `${item.id} · ${item.verdict}`,
      })),
    },
    {
      id: "releases",
      label: "Releases",
      items: (index.releases ?? []).map((item) => ({
        id: item.id,
        title: item.summary,
        secondary: `${item.id} · ${item.date}`,
      })),
    },
  ];
}

async function loadKnowledgeDoc(id) {
  const pane = document.querySelector("[data-knowledge-doc]");
  if (!pane) return;

  if (id === "PRODUCT") {
    pane.innerHTML = `
      <p class="doc-path">Docs/PRODUCT.md</p>
      <div class="doc-meta-slot"></div>
      <article class="doc-body prose"></article>
    `;
    renderDocInto(
      { pathLabel: "Docs/PRODUCT.md", body: state.index?.product?.body || "No product map yet." },
      {
        pathEl: pane.querySelector(".doc-path"),
        metaEl: pane.querySelector(".doc-meta-slot"),
        bodyEl: pane.querySelector(".doc-body"),
      },
    );
    return;
  }

  pane.innerHTML = `<p class="knowledge-doc-empty">Loading ${escapeHtml(id)}…</p>`;
  try {
    const response = await fetch(`/api/doc?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      pane.innerHTML = `<p class="knowledge-doc-empty">Could not load ${escapeHtml(id)}.</p>`;
      return;
    }
    const doc = await response.json();
    pane.innerHTML = `
      <p class="doc-path"></p>
      <div class="doc-meta-slot"></div>
      <article class="doc-body prose"></article>
    `;
    renderDocInto(doc, {
      pathEl: pane.querySelector(".doc-path"),
      metaEl: pane.querySelector(".doc-meta-slot"),
      bodyEl: pane.querySelector(".doc-body"),
    });
  } catch {
    pane.innerHTML = `<p class="knowledge-doc-empty">Could not load ${escapeHtml(id)}.</p>`;
  }
}

function renderKnowledge(index) {
  const groups = knowledgeItems(index);
  const allIds = groups.flatMap((group) => group.items.map((item) => item.id));
  if (!allIds.includes(state.knowledgeId)) state.knowledgeId = allIds[0] ?? "PRODUCT";

  const tocWidth = Number(readStored(TOC_WIDTH_KEY)) || 320;

  panels.knowledge.innerHTML = `
    <div class="knowledge${state.tocCollapsed ? " toc-collapsed" : ""}" style="--toc-w:${tocWidth}px">
      <aside class="knowledge-toc">
        <div class="knowledge-toc-head">
          <div class="toc-head-row">
            <strong>Documents</strong>
            <button type="button" class="icon-btn" data-toc-collapse title="Collapse document list">⟨</button>
          </div>
          ${searchInput("knowledge-q", "", "Filter documents…")}
        </div>
        <div class="knowledge-groups">
          ${groups.map((group) => `
            <div class="knowledge-group">
              <h2 class="knowledge-group-label">${escapeHtml(group.label)}</h2>
              ${
                group.items.length === 0
                  ? `<p class="cell-secondary">None yet</p>`
                  : `<ul class="toc-list">
                      ${group.items.map((item) => `
                        <li>
                          <button type="button" class="toc-item" data-knowledge-id="${escapeHtml(item.id)}" ${state.knowledgeId === item.id ? 'aria-current="true"' : ""}>
                            <span class="cell-primary">${escapeHtml(item.title)}</span>
                            <span class="cell-secondary">${escapeHtml(item.secondary)}</span>
                          </button>
                        </li>
                      `).join("")}
                    </ul>`
              }
            </div>
          `).join("")}
        </div>
      </aside>
      <div class="toc-resize" data-resize="toc" title="Drag to resize"></div>
      <section class="knowledge-doc" data-knowledge-doc></section>
      <button type="button" class="toc-expand" data-toc-expand title="Show document list" ${state.tocCollapsed ? "" : "hidden"}>Documents ⟩</button>
    </div>
  `;

  void loadKnowledgeDoc(state.knowledgeId);
}

function issueStatus(issue) {
  return issue.status ?? "open";
}

function workBucket(status) {
  return status === "open" || status === "active" ? "open" : "closed";
}

function renderWork(index) {
  const { kind, status, q, sort } = state.workFilters;
  const source = index.work ?? [];
  if (source.length === 0) {
    panels.work.innerHTML = `<div class="empty">No work yet. Run <code>/log</code> or <code>/fix</code>.</div>`;
    return;
  }

  let rows = source
    .filter((row) => !kind || row.kind === kind)
    .filter((row) => !status || workBucket(row.status) === status)
    .filter((row) =>
      matchesQuery(
        `${row.id} ${row.kind} ${row.summary} ${row.status} ${row.feature ?? ""} ${row.area ?? ""} ${row.note ?? ""}`,
        q,
      ));

  const openRank = (row) => (workBucket(row.status) === "open" ? 0 : 1);
  rows = [...rows].sort((left, right) => {
    if (sort === "kind") {
      return openRank(left) - openRank(right)
        || left.kind.localeCompare(right.kind)
        || (right.age_days ?? 0) - (left.age_days ?? 0);
    }
    if (sort === "status") {
      return openRank(left) - openRank(right)
        || left.status.localeCompare(right.status)
        || (right.age_days ?? 0) - (left.age_days ?? 0);
    }
    if (sort === "id") {
      return openRank(left) - openRank(right) || left.id.localeCompare(right.id);
    }
    if (sort === "age") {
      return (right.age_days ?? 0) - (left.age_days ?? 0);
    }
    // open-first (default): open/active above closed, then newer first
    return openRank(left) - openRank(right) || (right.age_days ?? 0) - (left.age_days ?? 0);
  });

  const kinds = [...new Set(source.map((row) => row.kind))].sort();
  const openCount = source.filter((row) => workBucket(row.status) === "open").length;
  const closedCount = source.filter((row) => workBucket(row.status) === "closed").length;
  const emptyFiltered = rows.length === 0
    ? (
      status === "open" && closedCount > 0
        ? `No open work. ${closedCount} closed — choose Closed or All.`
        : status === "closed" && openCount > 0
          ? `No closed work. ${openCount} open — choose Open or All.`
          : "No work matches these filters."
    )
    : null;

  panels.work.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("work-q", q, "Search work…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Status</span>
          ${chip("work-status", "", status, "All")}
          ${chip("work-status", "open", status, `Open${openCount ? ` (${openCount})` : ""}`)}
          ${chip("work-status", "closed", status, `Closed${closedCount ? ` (${closedCount})` : ""}`)}
        </div>
        <div class="chip-group">
          <span class="chip-label">Kind</span>
          ${chip("work-kind", "", kind, "All")}
          ${kinds.map((value) => chip("work-kind", value, kind)).join("")}
        </div>
        ${sortSelect("work-sort", sort, [["open-first", "Open first"], ["age", "Age"], ["kind", "Kind"], ["status", "Status"], ["id", "ID"]])}
      </div>
    </div>
    <p class="table-meta">Showing ${rows.length} of ${source.length} · Docs/WORK.yaml</p>
    <div class="table-frame">
      <table>
        <thead><tr><th>ID</th><th>Kind</th><th class="wrap">Summary</th><th>Feature</th><th>Area</th><th>Status</th><th>Age</th></tr></thead>
        <tbody>
          ${
            emptyFiltered
              ? `<tr><td colspan="7">${escapeHtml(emptyFiltered)}</td></tr>`
              : rows.map((row) => `
            <tr data-id="${escapeHtml(row.id)}" data-status="${escapeHtml(row.status)}">
              <td class="mono">${escapeHtml(row.id)}</td>
              <td>${escapeHtml(row.kind)}</td>
              <td class="wrap"><span class="cell-primary">${escapeHtml(row.summary)}</span></td>
              <td>${shortSpecCell(row.feature)}</td>
              <td>${shortSpecCell(row.area)}</td>
              <td>${statusHtml(row.status)}</td>
              <td title="${escapeHtml(row.opened ?? "")}">${escapeHtml(formatOpenedAge(row.opened))}</td>
            </tr>
          `).join("")
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderSignals(index) {
  const { severity, kind, status, q, sort } = state.signalsFilters;
  const source = index.issues ?? [];
  if (source.length === 0) {
    panels.signals.innerHTML = `<div class="empty">No signals. Empty is a valid state.</div>`;
    return;
  }

  const severityRank = { high: 0, medium: 1, low: 2 };
  let issues = source
    .filter((issue) => !severity || issue.severity === severity)
    .filter((issue) => !kind || issue.kind === kind)
    .filter((issue) => !status || issueStatus(issue) === status)
    .filter((issue) => matchesQuery(`${issue.kind} ${issue.ref} ${issue.summary} ${issue.spec ?? ""} ${issueStatus(issue)}`, q));

  issues = [...issues].sort((left, right) => {
    if (sort === "age") return (right.age_days ?? 0) - (left.age_days ?? 0);
    if (sort === "kind") return left.kind.localeCompare(right.kind);
    if (sort === "status") return issueStatus(left).localeCompare(issueStatus(right)) || (right.age_days ?? 0) - (left.age_days ?? 0);
    return (severityRank[left.severity] ?? 9) - (severityRank[right.severity] ?? 9)
      || (right.age_days ?? 0) - (left.age_days ?? 0);
  });

  const kinds = [...new Set(source.map((issue) => issue.kind))].sort();
  const openCount = source.filter((issue) => issueStatus(issue) === "open").length;
  const closedCount = source.filter((issue) => issueStatus(issue) === "fixed").length;
  const emptyFiltered = issues.length === 0
    ? (
      status === "open" && closedCount > 0
        ? `No open signals. ${closedCount} closed — choose Closed or All.`
        : status === "fixed" && openCount > 0
          ? `No closed signals. ${openCount} open — choose Open or All.`
          : "No signals match these filters."
    )
    : null;

  panels.signals.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("signals-q", q, "Search signals…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Status</span>
          ${chip("signal-status", "", status, "All")}
          ${chip("signal-status", "open", status, `Open${openCount ? ` (${openCount})` : ""}`)}
          ${chip("signal-status", "fixed", status, `Closed${closedCount ? ` (${closedCount})` : ""}`)}
        </div>
        <div class="chip-group">
          <span class="chip-label">Severity</span>
          ${chip("signal-severity", "", severity, "All")}
          ${chip("signal-severity", "high", severity)}
          ${chip("signal-severity", "medium", severity)}
          ${chip("signal-severity", "low", severity)}
        </div>
        <div class="chip-group">
          <span class="chip-label">Kind</span>
          ${chip("signal-kind", "", kind, "All")}
          ${kinds.map((value) => chip("signal-kind", value, kind)).join("")}
        </div>
        ${sortSelect("signals-sort", sort, [["severity", "Severity"], ["age", "Age"], ["kind", "Kind"], ["status", "Status"]])}
      </div>
    </div>
    <p class="table-meta">${index.paths_scanned_at ? `Slow cycle ${formatAge(index.paths_scanned_at)} · ` : ""}Showing ${issues.length} of ${source.length} · columns: ID, Kind, Summary, Feature, Area, Status, Age</p>
    <div class="table-frame">
      <table>
        <thead><tr><th>ID</th><th>Kind</th><th class="wrap">Summary</th><th>Feature</th><th>Area</th><th>Status</th><th>Age</th></tr></thead>
        <tbody>
          ${
            emptyFiltered
              ? `<tr><td colspan="7">${escapeHtml(emptyFiltered)}</td></tr>`
              : issues.map((issue) => {
                const tags = featureAreaFromSpecId(issue.spec);
                const ageLabel = issue.age_days == null
                  ? "—"
                  : issue.age_days === 0
                    ? "<24h"
                    : `${issue.age_days}d`;
                return `
            <tr data-id="${escapeHtml(issue.ref)}" data-status="${escapeHtml(issueStatus(issue))}">
              <td class="mono">${escapeHtml(issue.ref)}</td>
              <td>${escapeHtml(issue.kind)}</td>
              <td class="wrap"><span class="cell-primary">${escapeHtml(issue.summary)}</span><span class="cell-secondary sev-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span></td>
              <td>${shortSpecCell(tags.feature)}</td>
              <td>${shortSpecCell(tags.area)}</td>
              <td>${statusHtml(issueStatus(issue))}</td>
              <td title="${issue.age_days == null ? "" : `${issue.age_days} day(s)`}">${escapeHtml(ageLabel)}</td>
            </tr>`;
              }).join("")
          }
        </tbody>
      </table>
    </div>
  `;
}

function updateChrome(index) {
  state.lastIndexedAt = index.indexed_at;
  indexedAt.textContent = `indexed ${formatAge(index.indexed_at)}`;
  const high = index.issues.filter(
    (issue) => issueStatus(issue) === "open" && issue.severity === "high",
  ).length;
  if (high > 0) {
    issuePill.hidden = false;
    issuePill.textContent = `● ${high} signal${high === 1 ? "" : "s"}`;
  } else {
    issuePill.hidden = true;
  }
}

function renderAll() {
  if (!state.index) return;
  updateChrome(state.index);
  renderActive(state.index);
  renderRoadmap(state.index);
  renderActivity(state.index);
  renderKnowledge(state.index);
  renderWork(state.index);
  renderSignals(state.index);
}

function showPage(page) {
  state.page = page;
  const meta = PAGE_META[page] ?? PAGE_META.active;
  pageTitle.textContent = meta.title;
  pageSubtitle.textContent = meta.subtitle;
  for (const [name, panel] of Object.entries(panels)) {
    panel.hidden = name !== page;
  }
  for (const tab of document.querySelectorAll(".tab")) {
    if (tab.dataset.page === page) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (page === "knowledge") detail.hidden = true;
}

function applyDetailWidth(width) {
  const clamped = Math.min(Math.max(width, 360), Math.floor(window.innerWidth * 0.7));
  detail.style.width = `${clamped}px`;
  writeStored(DETAIL_WIDTH_KEY, String(clamped));
}

function renderWorkDetail(row) {
  const fields = [
    ["Kind", row.kind],
    ["Status", row.status],
    ["Opened", row.opened],
    ["Age", formatOpenedAge(row.opened)],
    ["Feature", shortSpecId(row.feature)],
    ["Area", shortSpecId(row.area)],
    ["Phase", row.phase ?? "—"],
    ["Blocked by", row.blocked_by ?? "—"],
    ["Promoted to", row.promoted_to ?? "—"],
  ];
  return `
    <div class="phase-card">
      <p class="cell-primary" style="margin:0 0 1rem">${escapeHtml(row.summary)}</p>
      <dl class="glance-grid">
        ${fields.map(([label, value]) => `
          <div class="glance-cell">
            <dt>${escapeHtml(label)}</dt>
            <dd class="mono">${escapeHtml(String(value))}</dd>
          </div>
        `).join("")}
      </dl>
      ${row.note ? `<p class="muted" style="margin-top:1rem">${escapeHtml(row.note)}</p>` : ""}
      <p class="muted" style="margin-top:1rem">Ledger row in <code>Docs/WORK.yaml</code> — not a separate markdown ticket.</p>
    </div>
  `;
}

function renderSignalDetail(issue) {
  const fields = [
    ["Kind", issue.kind],
    ["Status", issueStatus(issue)],
    ["Severity", issue.severity],
    ["Spec", issue.spec ?? "—"],
    ["Age", issue.age_days == null ? "—" : issue.age_days === 0 ? "<24h" : `${issue.age_days}d`],
  ];
  return `
    <div class="phase-card">
      <p class="cell-primary" style="margin:0 0 1rem">${escapeHtml(issue.summary)}</p>
      <dl class="glance-grid">
        ${fields.map(([label, value]) => `
          <div class="glance-cell">
            <dt>${escapeHtml(label)}</dt>
            <dd class="mono">${escapeHtml(String(value))}</dd>
          </div>
        `).join("")}
      </dl>
      <p class="muted" style="margin-top:1rem">Derived signal — not an authored Work row.</p>
    </div>
  `;
}

async function openDetail(id) {
  state.selectedId = id;
  detail.hidden = false;
  detail.classList.remove("collapsed");
  detailTitle.textContent = id;
  applyDetailWidth(Number(readStored(DETAIL_WIDTH_KEY)) || 560);

  const phase = state.index?.phases?.find((item) => item.id === id);
  const work = state.index?.work?.find((item) => item.id === id);
  const signal = state.index?.issues?.find((item) => item.ref === id);

  if (phase) {
    detailMeta.textContent = phase.sourcePath ? `Docs/${phase.sourcePath}` : "";
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderPhaseView(phase, state.index, {
      primary: phase.state === "active",
      compact: true,
    });
    await hydratePhaseDocs(detailBody);
  } else if (work) {
    detailMeta.textContent = "Docs/WORK.yaml";
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderWorkDetail(work);
  } else if (signal) {
    detailMeta.textContent = "derived signal";
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderSignalDetail(signal);
  } else {
    const response = await fetch(`/api/doc?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      detailMeta.textContent = "";
      detailFrontmatter.hidden = true;
      detailBody.className = "doc-body";
      detailBody.innerHTML = `<p class="muted">No detail for ${escapeHtml(id)}.</p>`;
      return;
    }
    const doc = await response.json();
    detailBody.className = "doc-body prose";
    renderDocInto(doc, {
      pathEl: detailMeta,
      metaEl: detailFrontmatter,
      bodyEl: detailBody,
    });
  }

  if (state.page === "roadmap") renderRoadmap(state.index);
  if (state.page === "work") renderWork(state.index);
  if (state.page === "signals") renderSignals(state.index);
}

async function loadIndex() {
  const response = await fetch("/api/index");
  if (!response.ok) throw new Error("Failed to load index");
  state.index = await response.json();
  renderAll();
}

async function reindex() {
  const button = document.querySelector("#reindex");
  button?.classList.add("busy");
  try {
    await fetch("/api/reindex", { method: "POST" });
    await loadIndex();
  } finally {
    button?.classList.remove("busy");
  }
}

function connectEvents() {
  const source = new EventSource("/api/events");
  source.addEventListener("index", () => {
    void loadIndex();
  });
}

function bindResize(handle, onMove) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    const move = (moveEvent) => onMove(moveEvent);
    const up = () => {
      handle.releasePointerCapture(event.pointerId);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
}

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest(".tab");
  if (!button) return;
  showPage(button.dataset.page);
});

document.querySelector("#reindex").addEventListener("click", () => {
  void reindex();
});

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  writeStored(THEME_KEY, next);
  applyTheme(next);
});

document.querySelector("#detail-close").addEventListener("click", () => {
  detail.hidden = true;
  state.selectedId = null;
  if (state.index) {
    if (state.page === "roadmap") renderRoadmap(state.index);
    if (state.page === "work") renderWork(state.index);
    if (state.page === "signals") renderSignals(state.index);
  }
});

document.querySelector("#detail-collapse").addEventListener("click", () => {
  detail.classList.toggle("collapsed");
});

const detailResize = document.querySelector('[data-resize="detail"]');
if (detailResize) {
  bindResize(detailResize, (event) => {
    applyDetailWidth(window.innerWidth - event.clientX);
  });
}

document.addEventListener("click", (event) => {
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    void copyText(copy.dataset.copy).then(() => {
      const previous = copy.textContent;
      copy.textContent = "Copied";
      setTimeout(() => {
        copy.textContent = previous;
      }, 900);
    });
    return;
  }

  const tocCollapse = event.target.closest("[data-toc-collapse]");
  if (tocCollapse) {
    state.tocCollapsed = true;
    writeStored(TOC_COLLAPSED_KEY, "1");
    document.querySelector(".knowledge")?.classList.add("toc-collapsed");
    document.querySelector("[data-toc-expand]")?.removeAttribute("hidden");
    return;
  }

  const tocExpand = event.target.closest("[data-toc-expand]");
  if (tocExpand) {
    state.tocCollapsed = false;
    writeStored(TOC_COLLAPSED_KEY, "0");
    document.querySelector(".knowledge")?.classList.remove("toc-collapsed");
    tocExpand.hidden = true;
    return;
  }

  const tocItem = event.target.closest("[data-knowledge-id]");
  if (tocItem && state.index) {
    state.knowledgeId = tocItem.dataset.knowledgeId;
    for (const item of document.querySelectorAll("[data-knowledge-id]")) {
      if (item === tocItem) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    }
    void loadKnowledgeDoc(state.knowledgeId);
    return;
  }

  const chipButton = event.target.closest("[data-filter]");
  if (chipButton && state.index) {
    const { filter, value } = chipButton.dataset;
    if (["state", "type"].includes(filter) && state.page === "roadmap") {
      state.roadmapFilters = { ...state.roadmapFilters, [filter]: value };
      renderRoadmap(state.index);
    } else if (
      filter === "actor"
      || filter === "phase"
      || (filter === "type" && state.page === "activity")
    ) {
      state.activityFilters = { ...state.activityFilters, [filter]: value };
      renderActivity(state.index);
    } else if (filter === "work-status") {
      state.workFilters = { ...state.workFilters, status: value };
      renderWork(state.index);
    } else if (filter === "work-kind") {
      state.workFilters = { ...state.workFilters, kind: value };
      renderWork(state.index);
    } else if (filter === "signal-status") {
      state.signalsFilters = { ...state.signalsFilters, status: value };
      renderSignals(state.index);
    } else if (filter === "signal-severity") {
      state.signalsFilters = { ...state.signalsFilters, severity: value };
      renderSignals(state.index);
    } else if (filter === "signal-kind") {
      state.signalsFilters = { ...state.signalsFilters, kind: value };
      renderSignals(state.index);
    }
    return;
  }

  if (state.page === "knowledge") return;
  const row = event.target.closest("tr[data-id]");
  if (row?.dataset.id) void openDetail(row.dataset.id);
});

document.addEventListener("change", (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || !state.index) return;
  if (select.name === "roadmap-sort") {
    state.roadmapFilters = { ...state.roadmapFilters, sort: select.value };
    renderRoadmap(state.index);
  } else if (select.name === "activity-sort") {
    state.activityFilters = { ...state.activityFilters, sort: select.value };
    renderActivity(state.index);
  } else if (select.name === "work-sort") {
    state.workFilters = { ...state.workFilters, sort: select.value };
    renderWork(state.index);
  } else if (select.name === "signals-sort") {
    state.signalsFilters = { ...state.signalsFilters, sort: select.value };
    renderSignals(state.index);
  }
});

document.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "search" || !state.index) return;

  const restore = (panel, name) => {
    const next = panel.querySelector(`input[name="${name}"]`);
    if (next) {
      next.focus();
      next.setSelectionRange(input.value.length, input.value.length);
    }
  };

  if (input.name === "roadmap-q") {
    state.roadmapFilters = { ...state.roadmapFilters, q: input.value };
    renderRoadmap(state.index);
    restore(panels.roadmap, "roadmap-q");
  } else if (input.name === "activity-q") {
    state.activityFilters = { ...state.activityFilters, q: input.value };
    renderActivity(state.index);
    restore(panels.activity, "activity-q");
  } else if (input.name === "work-q") {
    state.workFilters = { ...state.workFilters, q: input.value };
    renderWork(state.index);
    restore(panels.work, "work-q");
  } else if (input.name === "signals-q") {
    state.signalsFilters = { ...state.signalsFilters, q: input.value };
    renderSignals(state.index);
    restore(panels.signals, "signals-q");
  } else if (input.name === "knowledge-q") {
    const q = input.value.toLowerCase();
    for (const item of document.querySelectorAll(".toc-item")) {
      const text = item.textContent?.toLowerCase() ?? "";
      item.parentElement.hidden = q ? !text.includes(q) : false;
    }
  }
});

document.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest('[data-resize="toc"]');
  if (!handle) return;
  event.preventDefault();
  handle.setPointerCapture(event.pointerId);
  const move = (moveEvent) => {
    const knowledge = document.querySelector(".knowledge");
    if (!knowledge) return;
    const rect = knowledge.getBoundingClientRect();
    const width = Math.min(Math.max(moveEvent.clientX - rect.left, 220), 480);
    knowledge.style.setProperty("--toc-w", `${width}px`);
    writeStored(TOC_WIDTH_KEY, String(width));
  };
  const up = () => {
    handle.releasePointerCapture(event.pointerId);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
});

setInterval(() => {
  if (!state.lastIndexedAt) return;
  indexedAt.textContent = `indexed ${formatAge(state.lastIndexedAt)}`;
  const ageMs = Date.now() - Date.parse(state.lastIndexedAt);
  heartbeat.dataset.stale = ageMs > 60_000 ? "true" : "false";
}, 1000);

applyTheme(readStored(THEME_KEY) === "light" ? "light" : "dark");
applyDetailWidth(Number(readStored(DETAIL_WIDTH_KEY)) || 520);
showPage("active");
void loadIndex().then(connectEvents).catch((error) => {
  panels.active.innerHTML = `<div class="empty">Dashboard failed to load: ${escapeHtml(error.message)}</div>`;
});
