const state = {
  index: null,
  page: "now",
  roadmapFilters: { state: "", type: "" },
  selectedId: null,
  lastIndexedAt: null,
};

const panels = {
  now: document.querySelector('#page-now'),
  roadmap: document.querySelector('#page-roadmap'),
  activity: document.querySelector('#page-activity'),
  knowledge: document.querySelector('#page-knowledge'),
  issues: document.querySelector('#page-issues'),
};

const indexedAt = document.querySelector("#indexed-at");
const issuePill = document.querySelector("#issue-pill");
const heartbeat = document.querySelector(".heartbeat");
const detail = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailBody = document.querySelector("#detail-body");

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
  return `${hours}h ago`;
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
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

function activePhase(index) {
  return index.phases.find((phase) => phase.state === "active")
    ?? index.phases.find((phase) => phase.state === "blocked")
    ?? null;
}

function renderNow(index) {
  const phase = activePhase(index);
  const ready = index.phases.find((item) => item.state === "ready");
  const command = index.next_command;
  const checklist = (index.active_proof_checklist ?? [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  if (!phase) {
    panels.now.innerHTML = `
      <div class="now-grid">
        <div class="now-block">
          <h2>Phase</h2>
          <p class="outcome">No active phase</p>
          <p class="meta-line">${ready ? `Next ready: <code>${escapeHtml(ready.id)}</code> ${escapeHtml(ready.title)}` : "Nothing ready — schedule with /plan"}</p>
        </div>
        <div class="now-block">
          <h2>Next command <span class="hint">(suggestion)</span></h2>
          <div class="command-box">
            <code id="next-command">${escapeHtml(command ?? "/plan")}</code>
            <button type="button" data-copy="${escapeHtml(command ?? "/plan")}">Copy</button>
          </div>
        </div>
        <div class="now-block">
          <h2>Git</h2>
          <p class="meta-line mono">${escapeHtml(index.repo.branch)} · ${index.repo.clean ? "clean" : "dirty"} · ahead ${index.repo.ahead} / behind ${index.repo.behind}</p>
        </div>
        <div class="now-block">
          <h2>Handoff</h2>
          <pre class="handoff">${escapeHtml(index.handoff.body || "No handoff yet.")}</pre>
        </div>
      </div>
    `;
    return;
  }

  panels.now.innerHTML = `
    <div class="now-grid">
      <div class="now-block">
        <h2>Phase</h2>
        <p class="meta-line">
          <code>${escapeHtml(phase.id)}</code>
          ${statusHtml(phase.state)}
          <span class="${phase.type === "design" ? "type-design" : ""}">${escapeHtml(phase.type)} / ${escapeHtml(phase.proof_kind)}</span>
          <span>age ${phase.age_days}d</span>
        </p>
        <p class="outcome">${escapeHtml(phase.title)}</p>
      </div>
      <div class="now-block">
        <h2>Outcome</h2>
        <p>${escapeHtml(phase.outcome)}</p>
      </div>
      <div class="now-block">
        <h2>Proof</h2>
        <p>${escapeHtml(phase.proof)}</p>
        ${checklist ? `<ul>${checklist}</ul>` : ""}
      </div>
      <div class="now-block">
        <h2>Non-goals</h2>
        <ul>${(phase.non_goals ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li class='hint'>None listed</li>"}</ul>
      </div>
      <div class="now-block">
        <h2>Next command <span class="hint">(suggestion)</span></h2>
        ${
          phase.state === "blocked" || !command
            ? `<p>${escapeHtml(index.blocked_reason || "Phase blocked — no command suggested.")}</p>`
            : `<div class="command-box">
                <code id="next-command">${escapeHtml(command)}</code>
                <button type="button" data-copy="${escapeHtml(command)}">Copy</button>
              </div>`
        }
      </div>
      <div class="now-block">
        <h2>Git · Health · Production</h2>
        <p class="meta-line mono">${escapeHtml(index.repo.branch)} · ${index.repo.clean ? "clean" : "dirty"} · ahead ${index.repo.ahead} / behind ${index.repo.behind}</p>
        <p class="meta-line">Open high issues: ${index.issues.filter((issue) => issue.severity === "high").length} · In production: ${escapeHtml(index.in_production.release ?? "none")}</p>
      </div>
      <div class="now-block">
        <h2>Handoff ${index.handoff.updated_at ? `<span class="hint">${escapeHtml(formatAge(index.handoff.updated_at))}</span>` : ""}</h2>
        <pre class="handoff">${escapeHtml(index.handoff.body || "No handoff yet.")}</pre>
      </div>
    </div>
  `;
}

function stateRank(value) {
  return { active: 0, blocked: 1, ready: 2, proposed: 3, closed: 4, abandoned: 5 }[value] ?? 9;
}

function renderRoadmap(index) {
  const { state: stateFilter, type: typeFilter } = state.roadmapFilters;
  const rows = [...index.phases]
    .sort((left, right) => stateRank(left.state) - stateRank(right.state) || left.order - right.order)
    .filter((phase) => (!stateFilter || phase.state === stateFilter) && (!typeFilter || phase.type === typeFilter));

  const body = rows.map((phase) => `
    <tr data-id="${escapeHtml(phase.id)}" ${state.selectedId === phase.id ? 'data-selected="true"' : ""}>
      <td><code>${escapeHtml(phase.id)}</code></td>
      <td class="wrap">${escapeHtml(phase.title)}</td>
      <td class="${phase.type === "design" ? "type-design" : ""}">${escapeHtml(phase.type)}</td>
      <td>${statusHtml(phase.state)}</td>
      <td class="wrap">${escapeHtml(phase.outcome)}</td>
      <td>${escapeHtml(phase.proof_kind)}</td>
      <td class="mono">${escapeHtml((phase.amends_specs ?? []).join(", ") || "—")}</td>
      <td>${phase.age_days}d${phase.state === "abandoned" && phase.lessons ? ` · ${escapeHtml(phase.lessons)}` : ""}</td>
    </tr>
  `).join("");

  panels.roadmap.innerHTML = `
    <form class="filters" id="roadmap-filters">
      <label>State
        <select name="state">
          <option value="">All states</option>
          ${["active", "ready", "proposed", "blocked", "closed", "abandoned"].map((value) =>
            `<option value="${value}" ${stateFilter === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label>Type
        <select name="type">
          <option value="">All types</option>
          <option value="implementation" ${typeFilter === "implementation" ? "selected" : ""}>implementation</option>
          <option value="design" ${typeFilter === "design" ? "selected" : ""}>design</option>
        </select>
      </label>
    </form>
    <div class="table-frame">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Type</th><th>State</th><th>Outcome</th><th>Proof kind</th><th>Specs</th><th>Age</th>
          </tr>
        </thead>
        <tbody id="roadmap-rows">${body || `<tr><td colspan="8">No phases match.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderActivity(index) {
  const events = index.activity.current_month ?? [];
  if (events.length === 0) {
    panels.activity.innerHTML = `<div class="empty">Commands will appear here as they run.</div>`;
    return;
  }
  panels.activity.innerHTML = `
    <div class="table-frame">
      <table>
        <thead><tr><th>Time</th><th>Type</th><th>Actor</th><th>Ref</th><th>Summary</th><th>Phase</th></tr></thead>
        <tbody>
          ${events.map((event) => `
            <tr>
              <td class="mono">${escapeHtml(event.ts)}</td>
              <td>${escapeHtml(event.type)}</td>
              <td>${escapeHtml(event.actor)}</td>
              <td class="mono">${escapeHtml(event.ref ?? "—")}</td>
              <td class="wrap">${escapeHtml(event.summary)}</td>
              <td class="mono">${escapeHtml(event.phase ?? "—")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderKnowledge(index) {
  const specs = index.specs ?? [];
  const decisions = index.decisions ?? [];
  const research = index.research ?? [];
  const releases = index.releases ?? [];
  panels.knowledge.innerHTML = `
    <div class="now-block" style="margin-bottom:12px">
      <h2>PRODUCT.md</h2>
      <pre class="handoff">${escapeHtml(index.product.body || "No product map yet. Run /design after PHASE-002.")}</pre>
    </div>
    <div class="now-block" style="margin-bottom:12px">
      <h2>Specs</h2>
      ${specs.length === 0
        ? `<div class="empty">No specs yet. Run <code>/design</code>.</div>`
        : `<div class="table-frame"><table><thead><tr><th>ID</th><th>Kind</th><th>Title</th><th>Status</th><th>Depends on</th><th>Used by</th></tr></thead>
           <tbody>${specs.map((spec) => `<tr data-id="${escapeHtml(spec.id)}"><td class="mono">${escapeHtml(spec.id)}</td><td>${escapeHtml(spec.kind)}</td><td class="wrap">${escapeHtml(spec.title)}</td><td>${statusHtml(spec.status)}</td><td class="mono">${escapeHtml((spec.depends_on ?? []).join(", ") || "—")}</td><td class="mono">${escapeHtml((spec.used_by ?? []).join(", ") || "—")}</td></tr>`).join("")}</tbody></table></div>`}
    </div>
    <div class="now-block" style="margin-bottom:12px">
      <h2>Decisions</h2>
      ${decisions.length === 0
        ? `<div class="empty">No decisions yet. Run <code>/research</code> or <code>/design</code>.</div>`
        : `<div class="table-frame"><table><thead><tr><th>ID</th><th>Date</th><th>Title</th><th>Chose</th><th>Affects</th><th>Phase</th></tr></thead>
           <tbody>${decisions.map((decision) => `<tr><td class="mono">${escapeHtml(decision.id)}</td><td>${escapeHtml(decision.date)}</td><td class="wrap">${escapeHtml(decision.title)}</td><td class="wrap">${escapeHtml(decision.chose)}</td><td class="mono">${escapeHtml(decision.affects.join(", ") || "—")}</td><td class="mono">${escapeHtml(decision.phase ?? "—")}</td></tr>`).join("")}</tbody></table></div>`}
    </div>
    <div class="now-block" style="margin-bottom:12px">
      <h2>Research</h2>
      ${research.length === 0
        ? `<div class="empty">No research yet. Run <code>/research</code>.</div>`
        : `<div class="table-frame"><table><thead><tr><th>ID</th><th>Date</th><th>Question</th><th>Verdict</th><th>Status</th><th>Phase</th></tr></thead>
           <tbody>${research.map((item) => `<tr data-id="${escapeHtml(item.id)}"><td class="mono">${escapeHtml(item.id)}</td><td>${escapeHtml(item.date)}</td><td class="wrap">${escapeHtml(item.question)}</td><td>${escapeHtml(item.verdict)}</td><td>${statusHtml(item.status)}</td><td class="mono">${escapeHtml(item.phase ?? "—")}</td></tr>`).join("")}</tbody></table></div>`}
    </div>
    <div class="now-block">
      <h2>Releases</h2>
      ${releases.length === 0
        ? `<div class="empty">No releases yet. Run <code>/ship</code> when ready.</div>`
        : `<div class="table-frame"><table><thead><tr><th>ID</th><th>Date</th><th>Phase</th><th>Summary</th></tr></thead>
           <tbody>${releases.map((item) => `<tr><td class="mono">${escapeHtml(item.id)}</td><td>${escapeHtml(item.date)}</td><td class="mono">${escapeHtml(item.phase ?? "—")}</td><td class="wrap">${escapeHtml(item.summary)}</td></tr>`).join("")}</tbody></table></div>`}
    </div>
  `;
}

function renderIssues(index) {
  const issues = index.issues ?? [];
  if (issues.length === 0) {
    panels.issues.innerHTML = `<div class="empty">No issues. Empty is a valid state.</div>`;
    return;
  }
  panels.issues.innerHTML = `
    <p class="hint">${index.paths_scanned_at ? `Slow cycle: ${escapeHtml(formatAge(index.paths_scanned_at))}` : "Slow cycle not run yet (paths signals deferred)."}</p>
    <div class="table-frame">
      <table>
        <thead><tr><th>Kind</th><th>Ref</th><th>Summary</th><th>Spec</th><th>Age</th><th>Severity</th></tr></thead>
        <tbody>
          ${issues.map((issue) => `
            <tr data-id="${escapeHtml(issue.ref)}">
              <td>${escapeHtml(issue.kind)}</td>
              <td class="mono">${escapeHtml(issue.ref)}</td>
              <td class="wrap">${escapeHtml(issue.summary)}</td>
              <td class="mono">${escapeHtml(issue.spec ?? "—")}</td>
              <td>${issue.age_days ?? "—"}</td>
              <td>${escapeHtml(issue.severity)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function updateChrome(index) {
  state.lastIndexedAt = index.indexed_at;
  indexedAt.textContent = `indexed ${formatAge(index.indexed_at)}`;
  const high = index.issues.filter((issue) => issue.severity === "high").length;
  if (high > 0) {
    issuePill.hidden = false;
    issuePill.textContent = `● ${high} issue${high === 1 ? "" : "s"}`;
  } else {
    issuePill.hidden = true;
  }
}

function renderAll() {
  if (!state.index) return;
  updateChrome(state.index);
  renderNow(state.index);
  renderRoadmap(state.index);
  renderActivity(state.index);
  renderKnowledge(state.index);
  renderIssues(state.index);
}

function showPage(page) {
  state.page = page;
  for (const [name, panel] of Object.entries(panels)) {
    panel.hidden = name !== page;
  }
  for (const tab of document.querySelectorAll(".tab")) {
    if (tab.dataset.page === page) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
}

async function openDetail(id) {
  state.selectedId = id;
  const response = await fetch(`/api/doc?id=${encodeURIComponent(id)}`);
  if (!response.ok) return;
  const doc = await response.json();
  detail.hidden = false;
  detailTitle.textContent = id;
  detailMeta.textContent = doc.path;
  detailBody.textContent = doc.body;
  renderRoadmap(state.index);
}

async function loadIndex() {
  const response = await fetch("/api/index");
  if (!response.ok) throw new Error("Failed to load index");
  state.index = await response.json();
  renderAll();
}

async function reindex() {
  await fetch("/api/reindex", { method: "POST" });
  await loadIndex();
}

function connectEvents() {
  const source = new EventSource("/api/events");
  source.addEventListener("index", () => {
    void loadIndex();
  });
  source.onerror = () => {
    // Browser will retry; heartbeat staleness covers dead watchers.
  };
}

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest(".tab");
  if (!button) return;
  showPage(button.dataset.page);
});

document.querySelector("#reindex").addEventListener("click", () => {
  void reindex();
});

document.querySelector("#detail-close").addEventListener("click", () => {
  detail.hidden = true;
  state.selectedId = null;
  if (state.index) renderRoadmap(state.index);
});

document.addEventListener("click", (event) => {
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    void copyText(copy.dataset.copy);
    return;
  }
  const row = event.target.closest("tr[data-id]");
  if (row?.dataset.id) {
    void openDetail(row.dataset.id);
  }
});

document.addEventListener("change", (event) => {
  const form = event.target.closest("#roadmap-filters");
  if (!form || !state.index) return;
  const data = new FormData(form);
  state.roadmapFilters = {
    state: String(data.get("state") || ""),
    type: String(data.get("type") || ""),
  };
  renderRoadmap(state.index);
});

setInterval(() => {
  if (!state.lastIndexedAt) return;
  indexedAt.textContent = `indexed ${formatAge(state.lastIndexedAt)}`;
  const ageMs = Date.now() - Date.parse(state.lastIndexedAt);
  heartbeat.dataset.stale = ageMs > 60_000 ? "true" : "false";
}, 1000);

showPage("now");
void loadIndex().then(connectEvents).catch((error) => {
  panels.now.innerHTML = `<div class="empty">Dashboard failed to load: ${escapeHtml(error.message)}</div>`;
});
