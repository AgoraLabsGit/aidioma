const PAGE_META = {
  active: { title: "Active" },
  roadmap: { title: "Roadmap" },
  activity: { title: "Activity" },
  knowledge: { title: "Knowledge" },
  work: { title: "Work" },
  signals: { title: "Signals" },
  docs: { title: "Docs" },
  settings: { title: "Settings" },
};

/** Beginner Docs (D-027): Welcome + customer Commands overview — not System/COMMANDS.md. */
const DOCS_ITEMS = [
  { id: "START", title: "Welcome" },
  { id: "COMMANDS-OVERVIEW", title: "Commands" },
];

const DETAIL_WIDTH_KEY = "aidioma-detail-width";
const TOC_WIDTH_KEY = "aidioma-toc-width";
const TOC_COLLAPSED_KEY = "aidioma-toc-collapsed";
const THEME_KEY = "aidioma-dashboard-theme";
/** Color intensity: rich (Kind+Status hues) | status (Status only) | mono (muted). */
const COLOR_MODE_KEY = "aidioma-dashboard-color-mode";
const COLOR_MODES = ["rich", "status", "mono"];
const PAGE_KEY = "aidioma-dashboard-page";
const FILTER_KEYS = {
  roadmap: "aidioma-filters-roadmap",
  activity: "aidioma-filters-activity",
  work: "aidioma-filters-work",
  signals: "aidioma-filters-signals",
  knowledge: "aidioma-filters-knowledge",
};

/** Activity page process spine (D-023). Journal still stores all types. */
const ACTIVITY_PROCESS_ALWAYS = ["handoff", "close", "check", "ship"];
const ACTIVITY_PROCESS_OPTIONAL = ["launch", "dashboard", "status", "triage", "system"];
const ACTIVITY_PROCESS_ALLOWLIST = [...ACTIVITY_PROCESS_ALWAYS, ...ACTIVITY_PROCESS_OPTIONAL];

const DEFAULT_FILTERS = {
  roadmap: { state: "", type: "", feature: "", area: "", q: "", sort: "schedule", sortDir: "asc" },
  activity: { type: "", feature: "", area: "", q: "", sort: "time", sortDir: "desc" },
  work: { kind: "", status: "", feature: "", area: "", q: "", sort: "age", sortDir: "desc" },
  signals: { severity: "", kind: "", status: "open", feature: "", area: "", q: "", sort: "severity", sortDir: "asc" },
  knowledge: { type: "", status: "current", feature: "", area: "", q: "" },
};

/** First-click direction per column (second click flips). */
function defaultSortDirFor(_page, sortKey) {
  // Age / Activity time: newest first on first click (asc = older first via comparators).
  if (sortKey === "age" || sortKey === "time") return "desc";
  return "asc";
}

/** Apply asc/desc to a comparator result (0 / ±n). */
function orient(cmp, dir) {
  if (!cmp) return 0;
  return dir === "asc" ? cmp : -cmp;
}

function openedTimeMs(opened) {
  if (!opened) return NaN;
  if (/^\d{4}-\d{2}-\d{2}T/u.test(opened)) return Date.parse(opened);
  if (/^\d{4}-\d{2}-\d{2}$/u.test(opened)) return Date.parse(`${opened}T00:00:00.000Z`);
  return Date.parse(opened);
}

/** Ascending = older first; use with orient(…, sortDir). desc ⇒ newest first. */
function compareOpenedAsc(leftOpened, rightOpened) {
  const left = openedTimeMs(leftOpened);
  const right = openedTimeMs(rightOpened);
  if (Number.isNaN(left) && Number.isNaN(right)) return 0;
  if (Number.isNaN(left)) return 1;
  if (Number.isNaN(right)) return -1;
  return left - right;
}

function loadFilters(key, defaults) {
  const raw = readStored(key);
  if (!raw) return { ...defaults };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...defaults };
    const merged = { ...defaults, ...parsed };
    // Legacy factory default was open-first (not a column); promote to Age newest-first.
    if (key === FILTER_KEYS.work && merged.sort === "open-first") {
      return { ...merged, sort: "age", sortDir: "desc" };
    }
    return merged;
  } catch {
    return { ...defaults };
  }
}

function persistPageFilters(page) {
  const pair = {
    roadmap: [FILTER_KEYS.roadmap, () => state.roadmapFilters],
    activity: [FILTER_KEYS.activity, () => state.activityFilters],
    work: [FILTER_KEYS.work, () => state.workFilters],
    signals: [FILTER_KEYS.signals, () => state.signalsFilters],
    knowledge: [FILTER_KEYS.knowledge, () => state.knowledgeFilters],
  }[page];
  if (!pair) return;
  // Never persist free-text search — a leftover q (e.g. "F-005") hides new Work rows
  // while Activity (separate filters / newest-first) still shows them (F-008).
  const value = { ...pair[1](), q: "" };
  writeStored(pair[0], JSON.stringify(value));
}

const storedPage = readStored(PAGE_KEY);
const initialPage = storedPage && PAGE_META[storedPage] ? storedPage : "active";

const state = {
  index: null,
  page: initialPage,
  roadmapFilters: loadFilters(FILTER_KEYS.roadmap, DEFAULT_FILTERS.roadmap),
  activityFilters: loadFilters(FILTER_KEYS.activity, DEFAULT_FILTERS.activity),
  workFilters: loadFilters(FILTER_KEYS.work, DEFAULT_FILTERS.work),
  signalsFilters: loadFilters(FILTER_KEYS.signals, DEFAULT_FILTERS.signals),
  knowledgeFilters: loadFilters(FILTER_KEYS.knowledge, DEFAULT_FILTERS.knowledge),
  knowledgeId: "PRODUCT",
  docsId: "START",
  activeTabId: null,
  selectedId: null,
  lastIndexedAt: null,
  tocCollapsed: readStored(TOC_COLLAPSED_KEY) === "1",
  filterPanelOpen: false,
};

const panels = {
  active: document.querySelector("#page-active"),
  roadmap: document.querySelector("#page-roadmap"),
  activity: document.querySelector("#page-activity"),
  knowledge: document.querySelector("#page-knowledge"),
  work: document.querySelector("#page-work"),
  signals: document.querySelector("#page-signals"),
  docs: document.querySelector("#page-docs"),
  settings: document.querySelector("#page-settings"),
};

const indexedAt = document.querySelector("#indexed-at");
const issuePill = document.querySelector("#issue-pill");
const docsPill = document.querySelector("#docs-pill");
const heartbeat = document.querySelector(".heartbeat");
const pageTitle = document.querySelector("#page-title");
const detail = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailTitleCopy = document.querySelector("#detail-title-copy");
const detailMeta = document.querySelector("#detail-meta");
const detailFrontmatter = document.querySelector("#detail-frontmatter");
const detailBody = document.querySelector("#detail-body");
const themeToggle = document.querySelector("#theme-toggle");
const settingsPill = document.querySelector("#settings-pill");

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
  themeToggle?.setAttribute("aria-pressed", String(theme === "light"));
}

function normalizeColorMode(value) {
  return COLOR_MODES.includes(value) ? value : "rich";
}

function applyColorMode(mode) {
  const next = normalizeColorMode(mode);
  document.documentElement.dataset.color = next;
  writeStored(COLOR_MODE_KEY, next);
  return next;
}

function currentColorMode() {
  return normalizeColorMode(document.documentElement.dataset.color || readStored(COLOR_MODE_KEY));
}

const COLOR_MODE_OPTIONS = [
  { value: "rich", label: "Rich", hint: "Kind + Status colors" },
  { value: "status", label: "Status only", hint: "Status hues; Kind muted" },
  { value: "mono", label: "Monochrome", hint: "Muted chips everywhere" },
];

function renderSettings() {
  if (!panels.settings) return;
  const mode = currentColorMode();
  const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  panels.settings.innerHTML = `
    <div class="settings-panel">
      <section class="settings-section">
        <h2 class="settings-heading">Appearance</h2>
        <p class="settings-hint">Local preferences only (this browser). Theme toggle stays in the sidebar foot.</p>
        <div class="settings-field">
          <span class="settings-label">Theme</span>
          <span class="settings-value mono">${escapeHtml(theme)}</span>
        </div>
        <div class="settings-field">
          <span class="settings-label">Color</span>
          <div class="filters" role="group" aria-label="Color mode">
            <div class="chip-group">
              ${COLOR_MODE_OPTIONS.map((opt) => `
                <button
                  type="button"
                  class="chip"
                  data-color-mode="${escapeHtml(opt.value)}"
                  aria-pressed="${mode === opt.value ? "true" : "false"}"
                  title="${escapeHtml(opt.hint)}"
                >${escapeHtml(opt.label)}</button>
              `).join("")}
            </div>
          </div>
        </div>
        <p class="settings-hint">${escapeHtml(COLOR_MODE_OPTIONS.find((opt) => opt.value === mode)?.hint ?? "")}</p>
      </section>
    </div>
  `;
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

/**
 * Table Age from Work/phase `opened`.
 * - ISO datetime → real relative time (formatAge)
 * - Date-only YYYY-MM-DD → calendar days only ("today" / "Nd ago") — never fake hours
 *   from midnight UTC (that made every same-day row show e.g. "16h ago").
 */
function formatOpenedAge(opened) {
  if (!opened) return "—";
  if (/^\d{4}-\d{2}-\d{2}T/u.test(opened)) {
    return formatAge(opened);
  }
  if (/^\d{4}-\d{2}-\d{2}$/u.test(opened)) {
    const start = Date.parse(`${opened}T00:00:00.000Z`);
    if (Number.isNaN(start)) return "—";
    const days = Math.max(0, Math.floor((Date.now() - start) / (24 * 60 * 60 * 1000)));
    if (days === 0) return "today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
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

/**
 * Shared tone chip for Status + Kind/Type (no leading dot).
 * `variant`: "status" (lifecycle) | "kind" (taxonomy — hues only when Color=rich).
 */
function statusChipHtml(value, label = value, { variant = "status" } = {}) {
  if (value == null || value === "" || value === "—") return "—";
  const text = label == null || label === "" ? value : label;
  return `<span class="status" data-variant="${escapeHtml(variant)}" data-state="${escapeHtml(String(value))}">${escapeHtml(String(text))}</span>`;
}

function statusHtml(value) {
  return statusChipHtml(value);
}

function kindHtml(value, label = value) {
  return statusChipHtml(value, label, { variant: "kind" });
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


function matchesSpecFilter(value, filter) {
  if (!filter) return true;
  if (filter === "__none__") return value == null || value === "";
  return value === filter;
}

function collectSpecOptions(items, getFeature, getArea) {
  const features = new Set();
  const areas = new Set();
  let untaggedFeature = false;
  let untaggedArea = false;
  for (const item of items) {
    const feature = getFeature(item);
    const area = getArea(item);
    if (feature) features.add(feature);
    else untaggedFeature = true;
    if (area) areas.add(area);
    else untaggedArea = true;
  }
  return {
    features: [...features].sort(),
    areas: [...areas].sort(),
    untaggedFeature,
    untaggedArea,
  };
}

function filtersAreDefault(page, filters) {
  const defaults = DEFAULT_FILTERS[page];
  if (!defaults) return true;
  return Object.keys(defaults).every((key) => (filters[key] ?? "") === (defaults[key] ?? ""));
}

function deepFilterCount(filters) {
  return [filters.feature, filters.area].filter(Boolean).length;
}

/**
 * Activity Feature/Area: prefer explicit phase tags; else when `ref` is a Work id,
 * join WORK.yaml (ledger SSOT — same pattern as activityDisplayStatus / F-006).
 * Phase id in `ref` still resolves via the phase list.
 */
function activityTags(index, event) {
  const phaseId = event.phase ?? null;
  if (phaseId) {
    const phase = (index.phases ?? []).find((row) => row.id === phaseId);
    if (phase) {
      return { feature: phase.feature ?? null, area: phase.area ?? null };
    }
  }
  const ref = event.ref ?? null;
  if (ref) {
    const work = (index.work ?? []).find((row) => row.id === ref);
    if (work) {
      return { feature: work.feature ?? null, area: work.area ?? null };
    }
    const phase = (index.phases ?? []).find((row) => row.id === ref);
    if (phase) {
      return { feature: phase.feature ?? null, area: phase.area ?? null };
    }
  }
  return { feature: null, area: null };
}

function filterPanelHtml(page, filters, options) {
  const open = state.filterPanelOpen && state.page === page;
  const deepCount = deepFilterCount(filters);
  const badge = deepCount ? `<span class="filter-badge">${deepCount}</span>` : "";
  const dirty = !filtersAreDefault(page, filters);
  return `
    <div class="toolbar-actions">
      <div class="filter-panel-wrap">
        <button type="button" class="toolbar-btn" data-filter-panel-toggle aria-expanded="${open}" aria-haspopup="dialog">
          Filters${badge}
        </button>
        <div class="filter-panel" role="dialog" aria-label="Feature and area filters" ${open ? "" : "hidden"}>
          <div class="filter-panel-section">
            <span class="chip-label">Feature</span>
            <div class="chip-group">
              ${chip("feature", "", filters.feature ?? "", "All")}
              ${options.untaggedFeature ? chip("feature", "__none__", filters.feature ?? "", "Untagged") : ""}
              ${options.features.map((id) => chip("feature", id, filters.feature ?? "", shortSpecId(id))).join("")}
            </div>
          </div>
          <div class="filter-panel-section">
            <span class="chip-label">Area</span>
            <div class="chip-group">
              ${chip("area", "", filters.area ?? "", "All")}
              ${options.untaggedArea ? chip("area", "__none__", filters.area ?? "", "Untagged") : ""}
              ${options.areas.map((id) => chip("area", id, filters.area ?? "", shortSpecId(id))).join("")}
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="toolbar-btn" data-filter-reset ${dirty ? "" : "disabled"}>Reset</button>
    </div>
  `;
}

function rerenderTablePage(page) {
  if (!state.index) return;
  if (page === "roadmap") renderRoadmap(state.index);
  else if (page === "activity") renderActivity(state.index);
  else if (page === "work") renderWork(state.index);
  else if (page === "signals") renderSignals(state.index);
  else if (page === "knowledge") renderKnowledge(state.index);
}

function resetPageFilters(page) {
  const next = { ...DEFAULT_FILTERS[page] };
  if (page === "roadmap") state.roadmapFilters = next;
  else if (page === "activity") state.activityFilters = next;
  else if (page === "work") state.workFilters = next;
  else if (page === "signals") state.signalsFilters = next;
  else if (page === "knowledge") state.knowledgeFilters = next;
  else return;
  state.filterPanelOpen = false;
  persistPageFilters(page);
  rerenderTablePage(page);
}

function pageFilters(page) {
  if (page === "roadmap") return state.roadmapFilters;
  if (page === "activity") return state.activityFilters;
  if (page === "work") return state.workFilters;
  if (page === "signals") return state.signalsFilters;
  if (page === "knowledge") return state.knowledgeFilters;
  return null;
}

function setPageFilter(page, key, value) {
  const current = pageFilters(page);
  if (!current) return;
  const next = { ...current, [key]: value };
  if (page === "roadmap") state.roadmapFilters = next;
  else if (page === "activity") state.activityFilters = next;
  else if (page === "work") state.workFilters = next;
  else if (page === "signals") state.signalsFilters = next;
  else if (page === "knowledge") state.knowledgeFilters = next;
  persistPageFilters(page);
  if (key === "feature" || key === "area") state.filterPanelOpen = true;
  rerenderTablePage(page);
}

function chip(name, value, current, label = value) {
  return `<button type="button" class="chip" data-filter="${name}" data-value="${escapeHtml(value)}" aria-pressed="${current === value}">${escapeHtml(label || "All")}</button>`;
}

function searchInput(name, value, placeholder) {
  return `<input class="search" type="search" name="${escapeHtml(name)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" />`;
}

/** Display truncate for table summary cells (full text in title). */
const SUMMARY_CAP = 80;
/** Knowledge TOC primary title — one line; authored names should fit (T-054). */
const KNOWLEDGE_TITLE_CAP = 60;

function truncateSummary(text) {
  const value = String(text ?? "");
  if (value.length <= SUMMARY_CAP) {
    return `<span class="cell-primary" title="${escapeHtml(value)}">${escapeHtml(value)}</span>`;
  }
  return `<span class="cell-primary" title="${escapeHtml(value)}">${escapeHtml(value.slice(0, SUMMARY_CAP))}…</span>`;
}

function truncateKnowledgeTitle(text) {
  const value = String(text ?? "");
  if (value.length <= KNOWLEDGE_TITLE_CAP) return value;
  return `${value.slice(0, KNOWLEDGE_TITLE_CAP)}…`;
}

/** Column key → sort key. Summary is never sortable; every other column is. */
const TABLE_SORT_KEYS = {
  roadmap: {
    id: "schedule",
    order: "schedule",
    kind: "type",
    feature: "feature",
    area: "area",
    status: "state",
    age: "age",
  },
  activity: {
    id: "id",
    kind: "type",
    feature: "feature",
    area: "area",
    status: "status",
    age: "time",
  },
  work: {
    id: "id",
    kind: "kind",
    feature: "feature",
    area: "area",
    status: "status",
    age: "age",
  },
  signals: {
    id: "id",
    kind: "kind",
    feature: "feature",
    area: "area",
    status: "status",
    age: "age",
  },
};

const TABLE_COLUMNS = [
  ["id", "ID", ""],
  ["kind", "Kind", ""],
  ["summary", "Summary", "wrap"],
  ["feature", "Feature", ""],
  ["area", "Area", ""],
  ["status", "Status", ""],
  ["age", "Age", ""],
];

/** Roadmap: schedule step (Order) sits right of phase id. */
const ROADMAP_COLUMNS = [
  ["id", "ID", ""],
  ["order", "Order", ""],
  ["kind", "Kind", ""],
  ["summary", "Summary", "wrap"],
  ["feature", "Feature", ""],
  ["area", "Area", ""],
  ["status", "Status", ""],
  ["age", "Age", ""],
];

function columnsForPage(page) {
  return page === "roadmap" ? ROADMAP_COLUMNS : TABLE_COLUMNS;
}

function sortableTh(sortKey, currentSort, sortDir, label, extraClass = "") {
  const active = currentSort === sortKey;
  const classes = ["sortable", extraClass].filter(Boolean).join(" ");
  const ariaSort = !active ? "none" : sortDir === "asc" ? "ascending" : "descending";
  const mark = !active ? "" : sortDir === "asc" ? "▴" : "▾";
  return `<th class="${classes}" aria-sort="${ariaSort}">
    <button type="button" class="th-sort" data-sort-key="${escapeHtml(sortKey)}" aria-pressed="${active}" title="${active ? `Sorted ${sortDir === "asc" ? "ascending" : "descending"} — click to reverse` : "Sort"}">
      ${escapeHtml(label)}${mark ? `<span class="sort-mark" aria-hidden="true">${mark}</span>` : ""}
    </button>
  </th>`;
}

function tableHeaders(page, currentSort, sortDir = "asc") {
  const map = TABLE_SORT_KEYS[page] ?? {};
  return columnsForPage(page).map(([col, label, cls]) => {
    const sortKey = map[col];
    if (!sortKey) {
      return `<th${cls ? ` class="${escapeHtml(cls)}"` : ""}>${escapeHtml(label)}</th>`;
    }
    return sortableTh(sortKey, currentSort, sortDir, label, cls);
  }).join("");
}

function applyTableSort(page, sortKey) {
  if (!state.index) return;
  const current = pageFilters(page);
  if (!current) return;
  const same = current.sort === sortKey;
  const sortDir = same
    ? (current.sortDir === "asc" ? "desc" : "asc")
    : defaultSortDirFor(page, sortKey);
  const next = { ...current, sort: sortKey, sortDir };
  if (page === "roadmap") state.roadmapFilters = next;
  else if (page === "activity") state.activityFilters = next;
  else if (page === "work") state.workFilters = next;
  else if (page === "signals") state.signalsFilters = next;
  persistPageFilters(page);
  rerenderTablePage(page);
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

function isKnowledgeNavId(id) {
  const value = String(id ?? "");
  return (
    value === "PRODUCT"
    || /^SPEC-[FA]-[A-Z0-9-]+$/u.test(value)
    || /^D-\d{3}$/u.test(value)
    || /^R-\d{3}$/u.test(value)
    || /^RELEASE-\d{3}$/u.test(value)
  );
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      if (isKnowledgeNavId(href)) {
        return `<button type="button" class="knowledge-link" data-knowledge-link="${href}">${label}</button>`;
      }
      return `[${label}](${href})`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(raw) {
  const withoutComments = String(raw ?? "").replace(/<!--[\s\S]*?-->/g, "");
  const lines = withoutComments.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listType = null; // "ul" | "ol" | "check"
  let listItemOpen = false;
  let inTable = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeListItem = () => {
    if (!listItemOpen) return;
    html.push("</li>");
    listItemOpen = false;
  };

  const closeList = () => {
    closeListItem();
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
      html.push("</tbody></table></div>");
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
        html.push("<div class=\"md-table-wrap\"><table class=\"md-table\"><thead>");
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
      closeListItem();
      const checked = checklist[1].toLowerCase() === "x";
      html.push(`<li data-checked="${checked}">${checkIcon(checked)}<span class="proof-checklist-label">${inlineMarkdown(checklist[2])}</span>`);
      listItemOpen = true;
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      openList("ol");
      closeListItem();
      html.push(`<li>${inlineMarkdown(ordered[1])}`);
      listItemOpen = true;
      continue;
    }

    const bullet = line.match(/^(?:-|\*(?!\*))\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      openList("ul");
      closeListItem();
      const item = bullet[1].trim();
      html.push(item
        ? `<li>${inlineMarkdown(item)}`
        : `<li class="muted">(empty)`);
      listItemOpen = true;
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

    // Soft-wrapped source lines stay in the open list item; else one paragraph until blank.
    if (listType && listItemOpen) {
      html.push(` ${inlineMarkdown(trimmed)}`);
      continue;
    }
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

/** Work kind → human label (ids stay F/T/P/R/Q/A/S-nnn; D- remains decisions). */
function workKindLabel(kind) {
  const labels = {
    fix: "Fix",
    task: "Task",
    proposal: "Proposal",
    research: "Research",
    question: "Question",
    audit: "Audit",
    design: "Design",
  };
  return labels[kind] ?? kind ?? "—";
}

/** Compact clipboard text for an Activity event (no durable event id). */
function activityCopyText(event) {
  const parts = [event.ts, event.type];
  if (event.ref) parts.push(event.ref);
  else if (event.phase) parts.push(event.phase);
  else if (event.cmd) parts.push(event.cmd);
  return parts.filter(Boolean).join(" ");
}

/** ID cell with copy control — stops row-open when clicked. */
function idCopyCell(id, { title = "Copy id", copyText: text = id, secondary = "" } = {}) {
  const value = String(id ?? "");
  const payload = String(text ?? value);
  if (!value || value === "—") return `<td class="mono">—</td>`;
  return `<td class="mono id-cell">
    <span class="id-cell-text">${escapeHtml(value)}</span>
    <button type="button" class="id-copy" data-copy="${escapeHtml(payload)}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">⧉</button>
    ${secondary}
  </td>`;
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

function formatGitGlance(status) {
  if (!status?.branch) return "—";
  return `${status.branch} · ${status.clean ? "clean" : "dirty"} · ↑${status.ahead ?? 0} ↓${status.behind ?? 0}`;
}

/** Phase Status Git — desk for this phase, never Docs-home `index.repo` alone. */
function gitGlanceForPhase(phase, index) {
  if (phase?.git?.branch) return formatGitGlance(phase.git);
  if (
    index.projection_roots?.overlay_phase === phase?.id
    && index.projection_roots?.overlay_branch
  ) {
    return formatGitGlance({
      branch: index.projection_roots.overlay_branch,
      clean: index.repo?.clean,
      ahead: index.repo?.ahead,
      behind: index.repo?.behind,
    });
  }
  const match = repoWorktrees(index).find((tree) => tree.phase_id === phase?.id);
  if (match?.branch) return formatGitGlance(match);
  return "no phase worktree";
}

function workGlance(index, phaseId) {
  const related = (index.work ?? []).filter((row) => row.phase === phaseId);
  if (related.length) return `${related.length} related`;
  const open = (index.work ?? []).filter((row) => row.status === "open" || row.status === "active").length;
  return `${open} open / ${(index.work ?? []).length} total`;
}

function glanceCellHtml(label, value, { mono = false, title = "" } = {}) {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  return `
    <div class="glance-cell"${titleAttr}>
      <dt>${escapeHtml(label)}</dt>
      <dd class="${mono ? "mono" : ""}">${value}</dd>
    </div>
  `;
}

function glanceTwoColHtml(phase, index) {
  const pairs = [
    [
      ["State", statusHtml(phase.state)],
      ["Proof", escapeHtml(phase.proof_kind)],
    ],
    [
      ["Type", kindHtml(phase.type, typeLabel(phase.type))],
      ["Git", escapeHtml(gitGlanceForPhase(phase, index)), { mono: true }],
    ],
    [
      ["Owner", escapeHtml(phase.owner ?? "—")],
      ["Check", escapeHtml(index.last_check?.status ?? "—")],
    ],
    [
      ["Opened", escapeHtml(phase.opened)],
      ["Work", escapeHtml(workGlance(index, phase.id))],
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

/** Specs amended: Files-style id + title rows (not inline code soup). */
function amendedSpecsHtml(specPaths, empty = "None yet") {
  if (!specPaths.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return specPaths.map((spec) => {
    const title = spec.title && spec.title !== spec.id ? ` ${escapeHtml(spec.title)}` : "";
    return `
    <div class="path-group">
      <div class="path-group-title"><code>${escapeHtml(spec.id)}</code>${title}</div>
    </div>`;
  }).join("");
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

  return `
    <article class="phase-view${compact ? " phase-view-compact" : ""}" data-phase="${escapeHtml(phase.id)}" data-phase-doc="${escapeHtml(phase.id)}">
      <header class="phase-header">
        ${
          compact
            ? ""
            : `<p class="phase-id-row"><code>${escapeHtml(phase.id)}</code></p>`
        }
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
        ${glanceTwoColHtml(phase, index)}
      </section>

      <section class="phase-card">
        <div class="phase-card-section">
          <h3 class="now-label">Brief</h3>
          <div class="prose" data-section="Brief"><p class="muted">Loading…</p></div>
          <h4 class="phase-subhead">Out of scope</h4>
          ${
            nonGoals.length
              ? `<ul class="phase-plain-list">${nonGoals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : `<p class="muted">None listed</p>`
          }
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Context</h3>
          ${contextPathsHtml(phase.context_paths)}
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
          ${amendedSpecsHtml(specPaths, "None yet")}
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

        <div class="phase-card-section">
          <h3 class="now-label">Activity</h3>
          ${phaseActivityHtml(index, phase.id)}
        </div>

        <div class="phase-card-section">
          <h3 class="now-label">Audits</h3>
          ${phaseAuditsHtml(index, phase.id)}
        </div>

        ${
          phase.type === "build" || index.last_check?.status
            ? `<div class="phase-card-section">
                <h3 class="now-label">Tests</h3>
                ${phaseTestsHtml(index)}
              </div>`
            : ""
        }
      </section>
    </article>
  `;
}


function phaseActivityHtml(index, phaseId) {
  const events = (index.activity?.current_month ?? [])
    .filter((event) => event.phase === phaseId || event.ref === phaseId)
    .sort((left, right) => String(right.ts ?? "").localeCompare(String(left.ts ?? "")));
  if (!events.length) {
    return `<p class="muted">No activity events for this phase yet.</p>`;
  }
  return `<ul class="phase-plain-list">${events.slice(0, 40).map((event) => `
    <li>
      <span class="status" data-state="${escapeHtml(activityDisplayStatus(event, index))}">${escapeHtml(activityDisplayStatus(event, index))}</span>
      <code>${escapeHtml(event.type ?? "—")}</code>
      <span>${escapeHtml(event.ref && event.ref !== phaseId ? `${event.ref} · ` : "")}${escapeHtml(event.cmd ? `${event.cmd} — ${event.summary ?? ""}` : (event.summary ?? "—"))}</span>
      <span class="muted mono">${escapeHtml(event.ts ? formatAge(event.ts) : "—")}</span>
    </li>`).join("")}</ul>`;
}

function phaseAuditsHtml(index, phaseId) {
  const audits = (index.activity?.current_month ?? []).filter(
    (event) => event.type === "audit" && event.phase === phaseId,
  );
  if (!audits.length) {
    return `<p class="muted">Not run — no <code>/audit</code> or close-audit events for this phase yet.</p>`;
  }
  return `<ul>${audits.slice(0, 5).map((event) => `
    <li>
      <span class="status" data-state="${escapeHtml(event.status === "complete" ? "done" : event.status)}">${escapeHtml(event.status)}</span>
      <code>${escapeHtml(event.cmd)}</code>
      <span>${escapeHtml(event.summary)}</span>
      <span class="muted mono">${escapeHtml(formatAge(event.ts))}</span>
    </li>`).join("")}</ul>`;
}

function phaseTestsHtml(index) {
  const check = index.last_check;
  if (!check?.status) {
    return `<p class="muted">Not run — no <code>/check</code> recorded yet.</p>`;
  }
  return `<p>
    <span class="status" data-state="${escapeHtml(check.status === "pass" ? "active" : "blocked")}">${escapeHtml(check.status)}</span>
    <span class="muted mono">${escapeHtml(check.ts ? formatAge(check.ts) : "—")}</span>
  </p>`;
}

const COMMAND_MAP = [
  { cls: "Lifecycle", rows: [
    ["/run", "Phase triage → execute outcome", "/triage, /research, /design, /fix, /task, /audit, /check, …"],
    ["/close", "Triage → /check → Proof/Scope/Publish", "/triage, /check, /audit, helpers"],
    ["/plan", "Phase file; review Research first", "/research, /log"],
    ["/ship", "Deploy + RELEASES", "/check"],
  ]},
  { cls: "Action", rows: [
    ["/task", "Small chore", "/check; optional /audit"],
    ["/fix", "Bounded defect", "/check; optional /audit"],
    ["/audit", "Scoped review (not merge gate)", "review sub-agent"],
    ["/research", "Options + required Adv", "Adv sub-agent; optional /design"],
    ["/design", "Decisions/specs; Research first; Adv", "/research; Adv sub-agent"],
  ]},
  { cls: "Utility", rows: [
    ["/status", "Brief + context.json", "—"],
    ["/check", "Path-aware tests/lint", "—"],
    ["/triage", "Batch Work; phase mode implicit", "/fix, /task; then /check"],
    ["/log", "Park Work row", "—"],
    ["/dashboard", "Docs home when present; else primary+overlay", "—"],
    ["/handoff", "Overwrite HANDOFF", "—"],
    ["/launch", "App server", "—"],
  ]},
  { cls: "Meta", rows: [
    ["/system", "Framework edits", "/check; Adv if close/audit rules"],
  ]},
];

function renderCommandsPanel() {
  const body = document.querySelector("#commands-panel-body");
  if (!body) return;
  body.innerHTML = COMMAND_MAP.map((group) => `
    <section class="commands-group">
      <h3>${escapeHtml(group.cls)}</h3>
      <table class="commands-table">
        <thead><tr><th>Cmd</th><th>Does</th><th>May invoke</th></tr></thead>
        <tbody>
          ${group.rows.map(([cmd, does, may]) => `
            <tr>
              <td><button type="button" class="cmd-copy mono" data-copy="${escapeHtml(cmd)}" title="Copy">${escapeHtml(cmd)}</button></td>
              <td>${escapeHtml(does)}</td>
              <td class="muted">${escapeHtml(may)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>`).join("");
}

function setCommandsPanelOpen(open) {
  const panel = document.querySelector("#commands-panel");
  const button = document.querySelector("#commands-panel-btn");
  if (!panel || !button) return;
  panel.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    setWorktreesPanelOpen(false);
    renderCommandsPanel();
  }
}

const WORKTREE_CATEGORY_LABEL = {
  docs: "Docs home",
  main: "Main",
  phase: "Phases",
  task: "Tasks",
  other: "Other",
};


/** Prefer repo.worktrees; accept legacy repo.sessions (stale dashboard process). */
function repoWorktrees(index) {
  const list = index?.repo?.worktrees ?? index?.repo?.sessions;
  return Array.isArray(list) ? list : [];
}

function syncWorktreesBadge(index) {
  const countEl = document.querySelector("#worktrees-count");
  const button = document.querySelector("#worktrees-panel-btn");
  const worktrees = repoWorktrees(index);
  const count = index?.repo?.worktree_count ?? index?.repo?.session_count ?? worktrees.length;
  if (countEl) {
    countEl.textContent = String(count);
    countEl.hidden = count <= 0;
  }
  if (button) {
    button.title = count
      ? `Worktrees — ${count}`
      : "Worktrees";
  }
}

function syncActiveBadge(index) {
  const countEl = document.querySelector("#active-phase-count");
  const button = document.querySelector("#active-badge-btn");
  /** Same set as Active tabs: in-flight phases + status:active Work. */
  const count = activeTabItems(index).length;
  if (countEl) countEl.textContent = String(count);
  if (button) {
    const phases = currentPhases(index).length;
    const work = currentActiveWork(index).length;
    const label =
      count === 0
        ? "nothing in flight"
        : [
            phases ? `${phases} phase${phases === 1 ? "" : "s"}` : null,
            work ? `${work} active Work` : null,
          ]
            .filter(Boolean)
            .join(" · ");
    button.title = `Active — ${label}`;
    button.setAttribute("aria-label", `Open Active — ${label}`);
    if (state.page === "active") button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
}

function renderWorktreesPanel(index) {
  const body = document.querySelector("#worktrees-panel-body");
  if (!body) return;
  const worktrees = repoWorktrees(index);
  if (!worktrees.length) {
    body.innerHTML = `<p class="muted">No git worktrees discovered.</p>`;
    return;
  }
  const groups = ["docs", "main", "phase", "task", "other"]
    .map((category) => ({
      category,
      rows: worktrees.filter((worktree) => worktree.category === category),
    }))
    .filter((group) => group.rows.length);
  body.innerHTML = groups
    .map(
      (group) => `
    <section class="commands-group">
      <h3>${escapeHtml(WORKTREE_CATEGORY_LABEL[group.category] ?? group.category)} (${group.rows.length})</h3>
      ${group.rows
        .map((worktree) => {
          const branch = worktree.branch ?? "DETACHED";
          const dirty = worktree.clean ? "clean" : "dirty";
          const sync = `↑${worktree.ahead ?? 0} ↓${worktree.behind ?? 0}`;
          const phase = worktree.phase_id
            ? `<button type="button" class="cmd-copy" data-open-id="${escapeHtml(worktree.phase_id)}" title="Open phase">${escapeHtml(worktree.phase_id)}</button>`
            : "";
          const link = worktree.web_url
            ? `<a class="worktree-link" href="${escapeHtml(worktree.web_url)}" target="_blank" rel="noreferrer">GitHub</a>`
            : "";
          return `
        <div class="worktree-row">
          <div class="worktree-top">
            <code>${escapeHtml(branch)}</code>
            <button type="button" class="id-copy" data-copy="${escapeHtml(branch)}" title="Copy branch">⧉</button>
            ${phase}
            ${link}
          </div>
          <div class="worktree-meta">${escapeHtml(dirty)} · ${escapeHtml(sync)}${worktree.short_head ? ` · ${escapeHtml(worktree.short_head)}` : ""}${worktree.is_primary ? " · primary" : ""}${worktree.is_docs_home ? " · docs home" : ""}</div>
          <div class="worktree-path">${escapeHtml(worktree.path)}</div>
        </div>`;
        })
        .join("")}
    </section>`,
    )
    .join("");
}

function setWorktreesPanelOpen(open) {
  const panel = document.querySelector("#worktrees-panel");
  const button = document.querySelector("#worktrees-panel-btn");
  if (!panel || !button) return;
  panel.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    setCommandsPanelOpen(false);
    renderWorktreesPanel(state.index);
  }
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
      const briefSlot = host.querySelector(`[data-section="Brief"]`);
      if (briefSlot) {
        // D-024: prefer ## Brief, else legacy ## Context
        const brief =
          extractMarkdownSection(body, "Brief") || extractMarkdownSection(body, "Context");
        briefSlot.innerHTML = brief
          ? renderMarkdown(brief)
          : `<p class="muted">No Brief/Context section in phase file.</p>`;
      }
      for (const name of ["Inputs", "Plan"]) {
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

/** Work rows currently executing (Active-flush / do-now). */
function currentActiveWork(index) {
  return (index.work ?? []).filter((row) => row.status === "active");
}

/** Active tabs: in-flight phases first, then status:active Work. */
function activeTabItems(index) {
  const phases = currentPhases(index).map((phase) => ({
    kind: "phase",
    id: phase.id,
    title: phase.title,
    phase,
  }));
  const work = currentActiveWork(index).map((row) => ({
    kind: "work",
    id: row.id,
    title: row.summary,
    row,
  }));
  return [...phases, ...work];
}

function renderActive(index) {
  const tabs = activeTabItems(index);
  const ready = index.phases.find((item) => item.state === "ready");
  /** Handoff only when attached to the selected tab (D-031). */
  const handoffForTab = (tabId) => {
    const ref = index.handoff?.ref;
    if (!ref || ref !== tabId) return "";
    const body = index.handoff.body?.trim();
    if (!body) return "";
    return `
      <section class="phase-block">
        <h3 class="now-label">Handoff ${index.handoff.updated_at ? `· ${escapeHtml(formatAge(index.handoff.updated_at))}` : ""}</h3>
        <pre class="handoff">${escapeHtml(body)}</pre>
      </section>`;
  };

  if (tabs.length === 0) {
    state.activeTabId = null;
    const nextStep = ready
      ? `Next ready: ${ready.id}. Promote with /run, flush a Work row active, or schedule with /plan.`
      : "Promote a ready phase with /run, flush a Work row active, or schedule with /plan.";
    panels.active.innerHTML = `
      <div class="now">
        <div class="phase-view">
          <header class="phase-header">
            <h2 class="phase-name">Nothing active</h2>
            <p class="phase-outcome">${escapeHtml(nextStep)}</p>
          </header>
        </div>
      </div>
    `;
    return;
  }

  if (!tabs.some((tab) => tab.id === state.activeTabId)) {
    state.activeTabId = tabs[0].id;
  }
  const selected = tabs.find((tab) => tab.id === state.activeTabId) ?? tabs[0];
  const tabButtons = tabs
    .map((tab) => {
      const selectedAttr = tab.id === selected.id ? ' aria-selected="true"' : ' aria-selected="false"';
      const label = `${tab.id} · ${tab.title}`;
      const kindClass = tab.kind === "work" ? " active-phase-tab-work" : "";
      return `<button type="button" class="active-phase-tab${kindClass}" role="tab" data-active-tab="${escapeHtml(tab.id)}" data-active-kind="${tab.kind}"${selectedAttr} title="${escapeHtml(label)}">${escapeHtml(tab.id)}</button>`;
    })
    .join("");

  const panel =
    selected.kind === "phase"
      ? renderPhaseView(selected.phase, index, { primary: true })
      : renderWorkDetail(selected.row, index, { primary: true });

  panels.active.innerHTML = `
    <div class="now">
      <div class="active-phase-tabs" role="tablist" aria-label="In-flight phases and active Work">${tabButtons}</div>
      <div class="active-phase-panel" role="tabpanel">
        ${panel}
      </div>
      ${handoffForTab(selected.id)}
    </div>
  `;
  if (selected.kind === "phase") void hydratePhaseDocs(panels.active);
}

function stateRank(value) {
  return { active: 0, blocked: 1, ready: 2, proposed: 3, closed: 4, canceled: 5 }[value] ?? 9;
}

/** Dependency depth for Roadmap schedule sort (mirrors derive sortPhasesForRoadmap). */
function phaseScheduleDepths(phases) {
  const byId = new Map(phases.map((phase) => [phase.id, phase]));
  const depth = new Map();
  const visiting = new Set();
  const walk = (id) => {
    if (depth.has(id)) return depth.get(id);
    if (visiting.has(id)) {
      depth.set(id, 0);
      return 0;
    }
    visiting.add(id);
    const phase = byId.get(id);
    let value = 0;
    if (phase) {
      for (const dep of phase.depends_on ?? []) {
        value = Math.max(value, walk(dep) + 1);
      }
    }
    visiting.delete(id);
    depth.set(id, value);
    return value;
  };
  for (const phase of phases) walk(phase.id);
  return depth;
}

/** 1-based schedule step from full phase set (depends_on depth → order → id). */
function phaseScheduleRanks(phases) {
  const depths = phaseScheduleDepths(phases);
  const sorted = [...phases].sort((left, right) =>
    (depths.get(left.id) ?? 0) - (depths.get(right.id) ?? 0)
      || left.order - right.order
      || left.id.localeCompare(right.id));
  const ranks = new Map();
  sorted.forEach((phase, index) => ranks.set(phase.id, index + 1));
  return { depths, ranks };
}

function renderRoadmap(index) {
  const { state: stateFilter, type: typeFilter, feature, area, q, sort, sortDir = "asc" } = state.roadmapFilters;
  const { depths, ranks } = phaseScheduleRanks(index.phases);
  let rows = [...index.phases]
    .filter((phase) => (!stateFilter || phase.state === stateFilter) && (!typeFilter || phase.type === typeFilter))
    .filter((phase) => matchesSpecFilter(phase.feature, feature) && matchesSpecFilter(phase.area, area))
    .filter((phase) => matchesQuery(`${phase.id} ${phase.title} ${specsLabel(phase)}`, q));

  rows.sort((left, right) => {
    let cmp = 0;
    if (sort === "schedule") {
      // Default focus: active phase(s) first, then remaining by schedule Order.
      const leftActive = left.state === "active" ? 0 : 1;
      const rightActive = right.state === "active" ? 0 : 1;
      cmp = leftActive - rightActive
        || (ranks.get(left.id) ?? 0) - (ranks.get(right.id) ?? 0);
    } else if (sort === "age") {
      cmp = compareOpenedAsc(left.opened, right.opened)
        || (left.age_days ?? 0) - (right.age_days ?? 0);
    } else if (sort === "type") {
      cmp = left.type.localeCompare(right.type) || left.order - right.order;
    } else if (sort === "feature") {
      cmp = String(left.feature ?? "").localeCompare(String(right.feature ?? ""))
        || (ranks.get(left.id) ?? 0) - (ranks.get(right.id) ?? 0);
    } else if (sort === "area") {
      cmp = String(left.area ?? "").localeCompare(String(right.area ?? ""))
        || (ranks.get(left.id) ?? 0) - (ranks.get(right.id) ?? 0);
    } else if (sort === "state") {
      cmp = stateRank(left.state) - stateRank(right.state) || left.order - right.order;
    } else {
      cmp = (ranks.get(left.id) ?? 0) - (ranks.get(right.id) ?? 0);
    }
    return orient(cmp, sortDir);
  });

  const body = rows.map((phase) => {
    const step = ranks.get(phase.id) ?? "—";
    return `
    <tr data-id="${escapeHtml(phase.id)}" data-type="${escapeHtml(phase.type)}" data-state="${escapeHtml(phase.state)}" ${state.selectedId === phase.id ? 'data-selected="true"' : ""}>
      ${idCopyCell(phase.id, { title: "Copy phase id" })}
      <td class="mono" title="Schedule step (depends_on → order). Frontmatter order=${escapeHtml(String(phase.order))}">${escapeHtml(String(step))}</td>
      <td>${kindHtml(phase.type, typeLabel(phase.type))}</td>
      <td class="wrap">
        ${truncateSummary(phase.title)}
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
    </tr>`;
  }).join("");

  const specOptions = collectSpecOptions(index.phases, (row) => row.feature, (row) => row.area);

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
      </div>
      ${filterPanelHtml("roadmap", state.roadmapFilters, specOptions)}
    </div>
    <div class="table-frame">
      <table>
        <thead>
          <tr>${tableHeaders("roadmap", sort, sortDir)}</tr>
        </thead>
        <tbody>${body || `<tr><td colspan="8">No phases match.</td></tr>`}</tbody>
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

/**
 * Activity Status column: ledger SSOT overlays event JSON.
 * - `ref` → Work row status when present
 * - `ref` or `phase` → Phase id: closed/canceled phases force `done` (stale mid-close
 *   often logs `status: active` with `ref: null`, e.g. PHASE-007 15:56)
 * - else map `complete` → `done`
 */
function activityDisplayStatus(event, index) {
  const ref = event.ref;
  if (ref) {
    const work = (index.work ?? []).find((row) => row.id === ref);
    if (work?.status) return work.status;
  }
  const phaseId = ref && String(ref).startsWith("PHASE-") ? ref : event.phase;
  if (phaseId) {
    const phase = (index.phases ?? []).find((row) => row.id === phaseId);
    if (phase?.state === "closed" || phase?.state === "canceled") return "done";
  }
  if (event.status === "complete") return "done";
  return event.status ?? "done";
}

function isActivityProcessType(type) {
  return ACTIVITY_PROCESS_ALLOWLIST.includes(type);
}

/** D-023: default All = always-shown process types; chips ⊆ process allowlist. */
function filterActivityPageEvents(source, type) {
  const scoped = source.filter((event) => isActivityProcessType(event.type));
  if (!type) {
    return scoped.filter((event) => ACTIVITY_PROCESS_ALWAYS.includes(event.type));
  }
  if (!isActivityProcessType(type)) return [];
  return scoped.filter((event) => event.type === type);
}

function renderActivity(index) {
  const { type, feature, area, q, sort, sortDir = "desc" } = state.activityFilters;
  const source = index.activity.current_month ?? [];
  const processSource = source.filter((event) => isActivityProcessType(event.type));
  if (processSource.length === 0) {
    panels.activity.innerHTML = `<div class="empty">No process events yet. Outcome work → Work; phase runs → Active detail.</div>`;
    return;
  }

  // Drop stale outcome-type chip from older localStorage prefs (D-023).
  const typeFilter = type && isActivityProcessType(type) ? type : "";
  if (type && !typeFilter) {
    state.activityFilters = { ...state.activityFilters, type: "" };
  }

  let events = filterActivityPageEvents(source, typeFilter)
    .filter((event) => {
      const tags = activityTags(index, event);
      return matchesSpecFilter(tags.feature, feature) && matchesSpecFilter(tags.area, area);
    })
    .filter((event) => matchesQuery(`${event.type} ${event.summary} ${event.ref ?? ""} ${event.phase ?? ""} ${event.cmd ?? ""}`, q));

  events = [...events].sort((left, right) => {
    const idOf = (event) => String(event.ref ?? event.phase ?? "");
    const leftTags = activityTags(index, left);
    const rightTags = activityTags(index, right);
    let cmp = 0;
    if (sort === "type") {
      cmp = left.type.localeCompare(right.type) || compareOpenedAsc(left.ts, right.ts);
    } else if (sort === "id") {
      cmp = idOf(left).localeCompare(idOf(right)) || compareOpenedAsc(left.ts, right.ts);
    } else if (sort === "status") {
      cmp = activityDisplayStatus(left, index).localeCompare(activityDisplayStatus(right, index))
        || compareOpenedAsc(left.ts, right.ts);
    } else if (sort === "feature") {
      cmp = String(leftTags.feature ?? "").localeCompare(String(rightTags.feature ?? ""))
        || compareOpenedAsc(left.ts, right.ts);
    } else if (sort === "area") {
      cmp = String(leftTags.area ?? "").localeCompare(String(rightTags.area ?? ""))
        || compareOpenedAsc(left.ts, right.ts);
    } else {
      // time (default): ascending = older first; default sortDir desc ⇒ newest first
      cmp = compareOpenedAsc(left.ts, right.ts);
    }
    return orient(cmp, sortDir);
  });

  const types = ACTIVITY_PROCESS_ALLOWLIST.filter((value) =>
    processSource.some((event) => event.type === value) || ACTIVITY_PROCESS_ALWAYS.includes(value),
  );
  const specOptions = collectSpecOptions(
    processSource,
    (event) => activityTags(index, event).feature,
    (event) => activityTags(index, event).area,
  );

  panels.activity.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("activity-q", q, "Search process activity…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Type</span>
          ${chip("type", "", typeFilter, "All")}
          ${types.map((value) => chip("type", value, typeFilter)).join("")}
        </div>
      </div>
      ${filterPanelHtml("activity", { ...state.activityFilters, type: typeFilter }, specOptions)}
    </div>
    <div class="table-frame">
      <table>
        <thead><tr>${tableHeaders("activity", sort, sortDir)}</tr></thead>
        <tbody>
          ${events.map((event) => {
            // Process ops often omit ref (e.g. /check) — fall back to cmd, never a blank cell.
            const idLabel = event.ref ?? event.phase ?? event.cmd ?? event.type ?? "—";
            const phaseNote = event.phase && event.ref && event.phase !== event.ref
              ? event.phase
              : null;
            return `
            <tr>
              ${idCopyCell(idLabel, {
                title: "Copy activity key (ts type ref)",
                copyText: activityCopyText(event),
                secondary: phaseNote
                  ? `<span class="cell-secondary">${escapeHtml(phaseNote)}</span>`
                  : "",
              })}
              <td>${kindHtml(event.type)}</td>
              <td class="wrap">${truncateSummary(event.summary)}</td>
              <td>${shortSpecCell(activityTags(index, event).feature)}</td>
              <td>${shortSpecCell(activityTags(index, event).area)}</td>
              <td title="${escapeHtml(event.status ?? "")}">${statusHtml(activityDisplayStatus(event, index))}</td>
              <td class="mono" title="${escapeHtml(event.ts)}">${escapeHtml(formatAge(event.ts))}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="7">No events match.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/** Decision ids marked superseded by another decision's `supersedes` text (`D-nnn`) or own superseded_by. */
function supersededDecisionIds(decisions) {
  const set = new Set();
  for (const decision of decisions ?? []) {
    if (decision.superseded_by) set.add(decision.id);
    const raw = decision.supersedes;
    if (!raw || raw === "—" || raw === "-") continue;
    for (const match of String(raw).matchAll(/\bD-\d+\b/gu)) set.add(match[0]);
  }
  return set;
}

function knowledgeStatusBucket(kind, entry, supersededDecisions) {
  if (kind === "product" || kind === "releases") return "current";
  if (kind === "feature" || kind === "area") {
    if (entry?.status === "superseded" || entry?.superseded_by) return "superseded";
    return "current";
  }
  if (kind === "research") {
    return entry?.status === "superseded" ? "superseded" : "current";
  }
  if (kind === "decisions") {
    return supersededDecisions.has(entry?.id) ? "superseded" : "current";
  }
  return "current";
}

function matchesKnowledgeStatus(bucket, statusFilter) {
  if (!statusFilter || statusFilter === "all") return true;
  if (statusFilter === "current") return bucket === "current";
  if (statusFilter === "superseded") return bucket === "superseded";
  return true;
}

function knowledgeAffectTags(affects) {
  const list = affects ?? [];
  return {
    features: list.filter((id) => String(id).startsWith("SPEC-F-")),
    areas: list.filter((id) => String(id).startsWith("SPEC-A-")),
  };
}

function matchesAnySpecFilter(values, filter) {
  if (!filter) return true;
  if (filter === "__none__") return values.length === 0;
  return values.includes(filter);
}

/** Feature/Area slice for Knowledge TOC (S-007). Product always in; Releases only when both deep filters empty. */
function knowledgeMatchesSlice(kind, entry, featureFilter, areaFilter, index) {
  if (kind === "product") return true;
  if (kind === "releases") return !featureFilter && !areaFilter;

  const specs = index.specs ?? [];
  const featureRow = featureFilter && featureFilter !== "__none__"
    ? specs.find((spec) => spec.id === featureFilter)
    : null;
  const featureArea = knowledgePrimaryArea(featureRow);
  const featuresInArea = areaFilter && areaFilter !== "__none__"
    ? specs
      .filter((spec) => spec.kind === "feature" && (spec.depends_on ?? []).includes(areaFilter))
      .map((spec) => spec.id)
    : [];

  if (kind === "feature") {
    const areas = (entry.depends_on ?? []).filter((id) => String(id).startsWith("SPEC-A-"));
    const featureOk = !featureFilter
      ? true
      : featureFilter === "__none__"
        ? false
        : entry.id === featureFilter;
    const areaOk = matchesAnySpecFilter(areas, areaFilter);
    return featureOk && areaOk;
  }

  if (kind === "area") {
    const featureOk = !featureFilter
      ? true
      : featureFilter === "__none__"
        ? true
        : featureArea === entry.id;
    const areaOk = !areaFilter
      ? true
      : areaFilter === "__none__"
        ? false
        : entry.id === areaFilter;
    return featureOk && areaOk;
  }

  if (kind === "research" || kind === "decisions") {
    const tags = knowledgeAffectTags(entry?.affects);
    let featureOk = true;
    if (featureFilter === "__none__") featureOk = tags.features.length === 0;
    else if (featureFilter) {
      featureOk = tags.features.includes(featureFilter)
        || (featureArea != null && tags.areas.includes(featureArea));
    }
    let areaOk = true;
    if (areaFilter === "__none__") areaOk = tags.areas.length === 0;
    else if (areaFilter) {
      areaOk = tags.areas.includes(areaFilter)
        || tags.features.some((id) => featuresInArea.includes(id));
    }
    return featureOk && areaOk;
  }

  return true;
}

function collectKnowledgeSpecOptions(index) {
  const rows = [];
  for (const spec of index.specs ?? []) {
    if (spec.kind === "feature") {
      rows.push({ feature: spec.id, area: knowledgePrimaryArea(spec) });
    } else if (spec.kind === "area") {
      rows.push({ feature: null, area: spec.id });
    }
  }
  for (const item of [...(index.research ?? []), ...(index.decisions ?? [])]) {
    const tags = knowledgeAffectTags(item.affects);
    if (!tags.features.length && !tags.areas.length) {
      rows.push({ feature: null, area: null });
      continue;
    }
    for (const feature of tags.features.length ? tags.features : [null]) {
      for (const area of tags.areas.length ? tags.areas : [null]) {
        rows.push({ feature, area });
      }
    }
  }
  rows.push({ feature: null, area: null }); // Product / Releases → Untagged chips
  return collectSpecOptions(rows, (row) => row.feature, (row) => row.area);
}

function knowledgeItems(index) {
  const specs = index.specs ?? [];
  const supersededDecisions = supersededDecisionIds(index.decisions);
  return [
    {
      id: "product",
      label: "Product",
      items: [{
        id: "PRODUCT",
        title: "Product map",
        titleFull: "Product map",
        secondary: "PRODUCT · active",
        statusBucket: "current",
        entry: null,
      }],
    },
    {
      id: "feature",
      label: "Feature Specs",
      items: specs
        .filter((spec) => spec.kind === "feature")
        .map((spec) => ({
          id: spec.id,
          title: truncateKnowledgeTitle(spec.title),
          titleFull: spec.title,
          secondary: `${shortSpecId(spec.id)} · ${spec.status}`,
          statusBucket: knowledgeStatusBucket("feature", spec, supersededDecisions),
          entry: spec,
        })),
    },
    {
      id: "area",
      label: "Area Specs",
      items: specs
        .filter((spec) => spec.kind === "area")
        .map((spec) => ({
          id: spec.id,
          title: truncateKnowledgeTitle(spec.title),
          titleFull: spec.title,
          secondary: `${shortSpecId(spec.id)} · ${spec.status}`,
          statusBucket: knowledgeStatusBucket("area", spec, supersededDecisions),
          entry: spec,
        })),
    },
    {
      id: "decisions",
      label: "Decisions",
      items: (index.decisions ?? []).map((decision) => ({
        id: decision.id,
        title: truncateKnowledgeTitle(decision.title),
        titleFull: decision.title,
        secondary: `${decision.id} · ${decision.date}`,
        statusBucket: knowledgeStatusBucket("decisions", decision, supersededDecisions),
        entry: decision,
      })),
    },
    {
      id: "research",
      label: "Research",
      items: (index.research ?? []).map((item) => ({
        id: item.id,
        title: truncateKnowledgeTitle(item.question),
        titleFull: item.question,
        secondary: `${item.id} · ${item.status}`,
        statusBucket: knowledgeStatusBucket("research", item, supersededDecisions),
        entry: item,
      })),
    },
    {
      id: "releases",
      label: "Releases",
      items: (index.releases ?? []).map((item) => ({
        id: item.id,
        title: truncateKnowledgeTitle(item.summary),
        titleFull: item.summary,
        secondary: `${item.id} · ${item.date}`,
        statusBucket: knowledgeStatusBucket("releases", item, supersededDecisions),
        entry: item,
      })),
    },
  ];
}

function knowledgeLinkButtons(ids) {
  const list = (ids ?? []).filter(Boolean);
  if (!list.length) return `<p class="muted">None</p>`;
  return `<ul class="phase-plain-list">${list.map((id) => `
    <li><button type="button" class="knowledge-link" data-knowledge-link="${escapeHtml(id)}"><code>${escapeHtml(id)}</code></button></li>
  `).join("")}</ul>`;
}

function knowledgePrimaryArea(indexEntry) {
  const depends = indexEntry?.depends_on ?? [];
  return depends.find((id) => String(id).startsWith("SPEC-A-")) ?? null;
}

function knowledgeGlancePairs(kind, meta, indexEntry) {
  if (kind === "product") {
    // Same slot pattern as Feature/Area; honest empties (PRODUCT has no index/frontmatter).
    return [
      [["Type", "Product"], ["Status", statusHtml("active")]],
      [["Feature", "<code>PRODUCT</code>"], ["Area", "—"]],
      [["Created", "— <span class=\"muted\">(not in frontmatter)</span>"], ["Amended", "—"]],
      [["Version proxy", "living", { title: "Stand-in for semver: last amending phase id (or living)" }], ["Built by", "—"]],
    ];
  }
  if (kind === "feature" || kind === "area") {
    const area = kind === "feature" ? knowledgePrimaryArea(indexEntry) : (indexEntry?.id ?? null);
    const feature = kind === "feature" ? (indexEntry?.id ?? null) : null;
    const amended = indexEntry?.last_amended || meta.last_amended || "—";
    return [
      [["Type", escapeHtml(kind === "feature" ? "Feature" : "Area")], ["Status", statusHtml(meta.status || indexEntry?.status || "—")]],
      [["Feature", feature ? `<code>${escapeHtml(feature)}</code>` : "—"], ["Area", area ? `<code>${escapeHtml(area)}</code>` : "—"]],
      [["Created", "— <span class=\"muted\">(not in frontmatter)</span>"], ["Amended", escapeHtml(amended)]],
      [["Version proxy", escapeHtml(indexEntry?.last_amended || "living"), { title: "Stand-in for semver: last amending phase id (or living)" }], ["Built by", escapeHtml((indexEntry?.built_by ?? []).join(", ") || "—")]],
    ];
  }
  if (kind === "decision") {
    return [
      [["Type", "Decision"], ["Status", statusHtml("active")]],
      [["Date", escapeHtml(indexEntry?.date || "—")], ["Phase", escapeHtml(indexEntry?.phase || "—")]],
      [["Created", escapeHtml(indexEntry?.date || "—")], ["Last edited", escapeHtml(indexEntry?.date || "—")]],
      [["Version", escapeHtml(indexEntry?.id || "—")], ["Semver", "—"]],
    ];
  }
  if (kind === "research") {
    return [
      [["Type", "Research"], ["Status", statusHtml(meta.status || indexEntry?.status || "—")]],
      [["Date", escapeHtml(indexEntry?.date || meta.date || "—")], ["Phase", escapeHtml(indexEntry?.phase || meta.phase || "—")]],
      [["Created", escapeHtml(indexEntry?.date || meta.date || "—")], ["Last edited", escapeHtml(indexEntry?.date || meta.date || "—")]],
      [["Verdict", escapeHtml(meta.verdict || indexEntry?.verdict || "—")], ["Version", escapeHtml(indexEntry?.id || "—")]],
    ];
  }
  if (kind === "release") {
    return [
      [["Type", "Release"], ["Status", statusHtml("shipped")]],
      [["Date", escapeHtml(indexEntry?.date || "—")], ["Phase", escapeHtml(indexEntry?.phase || "—")]],
      [["Created", escapeHtml(indexEntry?.date || "—")], ["Last edited", escapeHtml(indexEntry?.date || "—")]],
      [["Version", escapeHtml(indexEntry?.id || "—")], ["Semver", "—"]],
    ];
  }
  return [[["Type", "Document"], ["Id", `<code>${escapeHtml(meta.id || "—")}</code>`]]];
}

function knowledgeKindForId(id, index) {
  if (id === "PRODUCT") return "product";
  const spec = (index?.specs ?? []).find((item) => item.id === id);
  if (spec) return spec.kind === "area" ? "area" : "feature";
  if ((index?.decisions ?? []).some((item) => item.id === id)) return "decision";
  if ((index?.research ?? []).some((item) => item.id === id)) return "research";
  if ((index?.releases ?? []).some((item) => item.id === id)) return "release";
  if (/^D-\d{3}$/u.test(id)) return "decision";
  if (/^R-\d{3}$/u.test(id)) return "research";
  if (/^RELEASE-\d{3}$/u.test(id)) return "release";
  if (/^SPEC-A-/u.test(id)) return "area";
  if (/^SPEC-F-/u.test(id)) return "feature";
  return "document";
}

function knowledgeIndexEntry(id, index) {
  if (id === "PRODUCT") return null;
  return (
    (index?.specs ?? []).find((item) => item.id === id)
    || (index?.decisions ?? []).find((item) => item.id === id)
    || (index?.research ?? []).find((item) => item.id === id)
    || (index?.releases ?? []).find((item) => item.id === id)
    || null
  );
}

function knowledgeTitle(id, meta, indexEntry) {
  if (id === "PRODUCT") return "Product map";
  if (indexEntry?.title) return indexEntry.title;
  if (indexEntry?.question) return indexEntry.question;
  if (indexEntry?.summary) return indexEntry.summary;
  if (meta.title) return meta.title;
  if (meta.question) return meta.question;
  return id;
}

function knowledgeOutcome(id, meta, indexEntry, bodyText) {
  if (id === "PRODUCT") return "Who / what / never — living product map.";
  if (indexEntry?.outcome) return indexEntry.outcome;
  if (meta.outcome) return meta.outcome;
  if (indexEntry?.verdict) return `Verdict: ${indexEntry.verdict}`;
  if (meta.verdict) return `Verdict: ${meta.verdict}`;
  if (indexEntry?.summary && indexEntry.summary !== indexEntry.title) return indexEntry.summary;
  const firstLine = String(bodyText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("---"));
  return firstLine || "Knowledge artifact.";
}

function knowledgeConnectionsHtml(kind, indexEntry) {
  if (kind === "feature" || kind === "area") {
    return `
      <div class="phase-card-section">
        <h3 class="now-label">Connections</h3>
        <h4 class="phase-subhead">Depends on</h4>
        ${knowledgeLinkButtons(indexEntry?.depends_on ?? [])}
        <h4 class="phase-subhead">Decisions</h4>
        ${knowledgeLinkButtons(indexEntry?.decisions ?? [])}
        <h4 class="phase-subhead">Research</h4>
        ${knowledgeLinkButtons(indexEntry?.research ?? [])}
        <h4 class="phase-subhead">Product</h4>
        ${knowledgeLinkButtons(["PRODUCT"])}
      </div>`;
  }
  if (kind === "research") {
    return `
      <div class="phase-card-section">
        <h3 class="now-label">Connections</h3>
        <h4 class="phase-subhead">Informed by</h4>
        ${knowledgeLinkButtons(indexEntry?.informed ?? [])}
        <h4 class="phase-subhead">Affects</h4>
        ${knowledgeLinkButtons(indexEntry?.affects ?? [])}
        <h4 class="phase-subhead">Product</h4>
        ${knowledgeLinkButtons(["PRODUCT"])}
      </div>`;
  }
  if (kind === "decision") {
    const affects = indexEntry?.affects ?? [];
    return `
      <div class="phase-card-section">
        <h3 class="now-label">Connections</h3>
        <h4 class="phase-subhead">Affects</h4>
        ${knowledgeLinkButtons(affects)}
        <h4 class="phase-subhead">Product</h4>
        ${knowledgeLinkButtons(["PRODUCT"])}
      </div>`;
  }
  if (kind === "release") {
    return `
      <div class="phase-card-section">
        <h3 class="now-label">Connections</h3>
        <h4 class="phase-subhead">Phase</h4>
        ${indexEntry?.phase ? `<p><code>${escapeHtml(indexEntry.phase)}</code></p>` : `<p class="muted">None</p>`}
        <h4 class="phase-subhead">Product</h4>
        ${knowledgeLinkButtons(["PRODUCT"])}
      </div>`;
  }
  if (kind === "product") {
    return `
      <div class="phase-card-section">
        <h3 class="now-label">Connections</h3>
        <p class="muted">Use Feature Specs / Area Specs / Decisions / Research in the document list.</p>
      </div>`;
  }
  return "";
}

function knowledgeRelatedEvents(index, id) {
  return (index?.activity?.current_month ?? [])
    .filter((event) => event.ref === id || event.phase === id)
    .sort((left, right) => String(right.ts ?? "").localeCompare(String(left.ts ?? "")));
}

function knowledgeActivityHtml(index, id) {
  const events = knowledgeRelatedEvents(index, id).filter((event) => event.type !== "audit");
  if (!events.length) {
    return `<div class="phase-card-section">
      <h3 class="now-label">Change log</h3>
      <p class="muted">No activity events with <code>ref: ${escapeHtml(id)}</code> yet. Specs do not keep a separate changelog file.</p>
    </div>`;
  }
  return `<div class="phase-card-section">
    <h3 class="now-label">Change log</h3>
    <p class="muted">Projected from activity journal (living substitute for per-file changelogs).</p>
    <ul class="phase-plain-list">${events.slice(0, 40).map((event) => `
      <li>
        <span class="status" data-state="${escapeHtml(activityDisplayStatus(event, index))}">${escapeHtml(activityDisplayStatus(event, index))}</span>
        <code>${escapeHtml(event.type ?? "—")}</code>
        <span>${escapeHtml(event.cmd ? `${event.cmd} — ${event.summary ?? ""}` : (event.summary ?? "—"))}</span>
        <span class="muted mono">${escapeHtml(event.ts ? formatAge(event.ts) : "—")}</span>
      </li>`).join("")}</ul>
  </div>`;
}

function knowledgeAuditsHtml(index, id) {
  const events = knowledgeRelatedEvents(index, id).filter(
    (event) => event.type === "audit" || event.cmd === "/audit",
  );
  if (!events.length) {
    return `<div class="phase-card-section">
      <h3 class="now-label">Audits</h3>
      <p class="muted">No /audit events for this artifact yet.</p>
    </div>`;
  }
  return `<div class="phase-card-section">
    <h3 class="now-label">Audits</h3>
    <ul class="phase-plain-list">${events.slice(0, 20).map((event) => `
      <li>
        <span class="status" data-state="${escapeHtml(activityDisplayStatus(event, index))}">${escapeHtml(activityDisplayStatus(event, index))}</span>
        <code>${escapeHtml(event.ref ?? event.type ?? "—")}</code>
        <span>${escapeHtml(event.summary ?? "—")}</span>
        <span class="muted mono">${escapeHtml(event.ts ? formatAge(event.ts) : "—")}</span>
      </li>`).join("")}</ul>
  </div>`;
}

function knowledgePathListHtml(paths) {
  const list = (paths ?? []).filter(Boolean);
  if (!list.length) return `<p class="muted">None</p>`;
  return `<ul class="phase-plain-list">${list.map((path) => `<li class="mono">${escapeHtml(path)}</li>`).join("")}</ul>`;
}

function knowledgeFilesHtml(kind, indexEntry, id) {
  if (kind === "product") {
    return `<div class="phase-card-section">
      <h3 class="now-label">Files</h3>
      ${knowledgePathListHtml(["Docs/PRODUCT.md"])}
    </div>`;
  }
  if (kind === "feature" || kind === "area") {
    const paths = indexEntry?.paths ?? [];
    const fallback = [`Docs/Specs/${kind === "feature" ? "Features" : "Areas"}/${id}.md`];
    return `<div class="phase-card-section">
      <h3 class="now-label">Files</h3>
      ${knowledgePathListHtml(paths.length ? paths : fallback)}
    </div>`;
  }
  if (kind === "decision") {
    return `<div class="phase-card-section">
      <h3 class="now-label">Files</h3>
      ${knowledgePathListHtml(["Docs/DECISIONS.md"])}
    </div>`;
  }
  if (kind === "research") {
    return `<div class="phase-card-section">
      <h3 class="now-label">Files</h3>
      ${knowledgePathListHtml([`Docs/Research/${id}.md`])}
    </div>`;
  }
  if (kind === "release") {
    return `<div class="phase-card-section">
      <h3 class="now-label">Files</h3>
      ${knowledgePathListHtml(["Docs/RELEASES.md"])}
    </div>`;
  }
  return "";
}

function knowledgeBuiltByHtml(kind, indexEntry) {
  if (kind !== "feature" && kind !== "area") return "";
  const built = indexEntry?.built_by ?? [];
  return `<div class="phase-card-section">
    <h3 class="now-label">Built by</h3>
    ${built.length ? `<ul class="phase-plain-list">${built.map((phaseId) => `<li><code>${escapeHtml(phaseId)}</code></li>`).join("")}</ul>` : `<p class="muted">None yet</p>`}
  </div>`;
}

function renderKnowledgeDetailShell({ id, title, outcome, glanceHtml, sectionsHtml }) {
  return `
    <article class="phase-view knowledge-detail" data-knowledge-doc-id="${escapeHtml(id)}">
      <header class="phase-header">
        <div class="phase-title-row">
          <h2 class="phase-name">${escapeHtml(title)}</h2>
          <p class="phase-id-row"><code>${escapeHtml(id)}</code>
            <button type="button" class="icon-btn copy-id" data-copy="${escapeHtml(id)}" title="Copy id" aria-label="Copy id">⧉</button>
          </p>
        </div>
        <p class="phase-outcome">${escapeHtml(outcome)}</p>
      </header>
      <section class="phase-block">
        <h3 class="now-label">Status</h3>
        ${glanceHtml}
      </section>
      <section class="phase-card">
        ${sectionsHtml}
      </section>
    </article>
  `;
}

function paintKnowledgeDoc(pane, { id, body }) {
  const index = state.index;
  const kind = knowledgeKindForId(id, index);
  const indexEntry = knowledgeIndexEntry(id, index);
  const { meta, body: md } = parseFrontmatter(body);
  const title = knowledgeTitle(id, meta, indexEntry);
  const outcome = knowledgeOutcome(id, meta, indexEntry, md);
  const glanceHtml = glancePairsHtml(knowledgeGlancePairs(kind, meta, indexEntry));
  const bodyHtml = renderMarkdown(md);
  const sectionsHtml = `
    <div class="phase-card-section">
      <h3 class="now-label">Brief</h3>
      <div class="prose">${bodyHtml}</div>
    </div>
    ${knowledgeConnectionsHtml(kind, indexEntry)}
    ${knowledgeFilesHtml(kind, indexEntry, id)}
    ${knowledgeBuiltByHtml(kind, indexEntry)}
    ${knowledgeActivityHtml(index, id)}
    ${knowledgeAuditsHtml(index, id)}
  `;
  pane.innerHTML = renderKnowledgeDetailShell({
    id,
    title,
    outcome,
    glanceHtml,
    sectionsHtml,
  });
}

async function loadKnowledgeDoc(id) {
  const pane = document.querySelector("[data-knowledge-doc]");
  if (!pane) return;

  if (id === "PRODUCT") {
    paintKnowledgeDoc(pane, {
      id,
      body: state.index?.product?.body || "# Product\n\nNo product map yet.\n",
    });
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
    paintKnowledgeDoc(pane, { id, body: doc.body ?? "" });
  } catch {
    pane.innerHTML = `<p class="knowledge-doc-empty">Could not load ${escapeHtml(id)}.</p>`;
  }
}

function selectKnowledgeDoc(id) {
  if (!id || !state.index) return;
  state.knowledgeId = id;
  for (const item of document.querySelectorAll("[data-knowledge-id]")) {
    if (item.dataset.knowledgeId === id) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  }
  void loadKnowledgeDoc(id);
}

function renderKnowledge(index) {
  const {
    type: typeFilter,
    status: statusFilter = "current",
    feature: featureFilter = "",
    area: areaFilter = "",
    q,
  } = state.knowledgeFilters;
  // Knowledge TOC is always visible (no collapse chrome).
  state.tocCollapsed = false;
  const groups = knowledgeItems(index)
    .filter((group) => !typeFilter || group.id === typeFilter)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        matchesKnowledgeStatus(item.statusBucket, statusFilter)
        && knowledgeMatchesSlice(group.id, item.entry ?? item, featureFilter, areaFilter, index)
        && matchesQuery(`${item.id} ${item.titleFull ?? item.title} ${item.secondary}`, q)),
    }));
  const visibleIds = groups.flatMap((group) => group.items.map((item) => item.id));
  if (!visibleIds.includes(state.knowledgeId)) state.knowledgeId = visibleIds[0] ?? "PRODUCT";

  const tocWidth = Number(readStored(TOC_WIDTH_KEY)) || 320;
  const specOptions = collectKnowledgeSpecOptions(index);

  panels.knowledge.innerHTML = `
    <div class="page-toolbar knowledge-toolbar">
      ${searchInput("knowledge-q", q, "Search Knowledge…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Type</span>
          ${chip("knowledge-type", "", typeFilter, "All")}
          ${chip("knowledge-type", "product", typeFilter, "Product")}
          ${chip("knowledge-type", "feature", typeFilter, "Feature")}
          ${chip("knowledge-type", "area", typeFilter, "Area")}
          ${chip("knowledge-type", "decisions", typeFilter, "Decisions")}
          ${chip("knowledge-type", "research", typeFilter, "Research")}
          ${chip("knowledge-type", "releases", typeFilter, "Releases")}
        </div>
        <div class="chip-group">
          <span class="chip-label">Status</span>
          ${chip("knowledge-status", "current", statusFilter, "Current")}
          ${chip("knowledge-status", "superseded", statusFilter, "Superseded")}
          ${chip("knowledge-status", "all", statusFilter, "All")}
        </div>
      </div>
      ${filterPanelHtml("knowledge", state.knowledgeFilters, specOptions)}
    </div>
    <div class="knowledge" style="--toc-w:${tocWidth}px">
      <aside class="knowledge-toc">
        <div class="knowledge-groups">
          ${groups.map((group) => `
            <div class="knowledge-group" data-knowledge-group="${escapeHtml(group.id)}">
              <h2 class="knowledge-group-label">${escapeHtml(group.label)}</h2>
              ${
                group.items.length === 0
                  ? `<p class="cell-secondary">None match</p>`
                  : `<ul class="toc-list">
                      ${group.items.map((item) => `
                        <li>
                          <button type="button" class="toc-item" data-knowledge-id="${escapeHtml(item.id)}" data-status="${escapeHtml(item.statusBucket)}" title="${escapeHtml(item.titleFull ?? item.title)}" ${state.knowledgeId === item.id ? 'aria-current="true"' : ""}>
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
    </div>
  `;

  void loadKnowledgeDoc(state.knowledgeId);
}

async function loadDocsDoc(id) {
  const pane = document.querySelector("[data-docs-doc]");
  if (!pane) return;

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

function renderDocs() {
  if (!panels.docs) return;
  const ids = DOCS_ITEMS.map((item) => item.id);
  if (!ids.includes(state.docsId)) state.docsId = ids[0] ?? "START";

  // Narrow fixed TOC — do not share Knowledge collapse/width prefs.
  panels.docs.innerHTML = `
    <div class="knowledge" style="--toc-w:220px">
      <aside class="knowledge-toc">
        <ul class="toc-list">
          ${DOCS_ITEMS.map((item) => `
            <li>
              <button type="button" class="toc-item" data-docs-id="${escapeHtml(item.id)}" ${state.docsId === item.id ? 'aria-current="true"' : ""}>
                <span class="cell-primary">${escapeHtml(item.title)}</span>
              </button>
            </li>
          `).join("")}
        </ul>
      </aside>
      <div class="toc-resize" data-resize="toc" title="Drag to resize"></div>
      <section class="knowledge-doc" data-docs-doc></section>
    </div>
  `;

  void loadDocsDoc(state.docsId);
}

function issueStatus(issue) {
  return issue.status ?? "open";
}

function workBucket(status) {
  return status === "open" || status === "active" ? "open" : "closed";
}

/** Work Status chips: Open/Active exact; Closed = done|promoted|dropped. */
function matchesWorkStatusFilter(rowStatus, filter) {
  if (!filter) return true;
  if (filter === "closed") return workBucket(rowStatus) === "closed";
  return rowStatus === filter;
}

function renderWork(index) {
  const { kind, status, feature, area, q, sort, sortDir = "asc" } = state.workFilters;
  const source = index.work ?? [];
  if (source.length === 0) {
    panels.work.innerHTML = `<div class="empty">No work yet. Run <code>/log</code> or <code>/fix</code>.</div>`;
    return;
  }

  let rows = source
    .filter((row) => !kind || row.kind === kind)
    .filter((row) => matchesWorkStatusFilter(row.status, status))
    .filter((row) => matchesSpecFilter(row.feature, feature) && matchesSpecFilter(row.area, area))
    .filter((row) =>
      matchesQuery(
        `${row.id} ${row.kind} ${row.summary} ${row.status} ${row.feature ?? ""} ${row.area ?? ""} ${row.note ?? ""}`,
        q,
      ));

  const openRank = (row) => (workBucket(row.status) === "open" ? 0 : 1);
  rows = [...rows].sort((left, right) => {
    let cmp = 0;
    if (sort === "kind") {
      cmp = openRank(left) - openRank(right)
        || left.kind.localeCompare(right.kind)
        || compareOpenedAsc(left.opened, right.opened);
    } else if (sort === "status") {
      cmp = openRank(left) - openRank(right)
        || left.status.localeCompare(right.status)
        || compareOpenedAsc(left.opened, right.opened);
    } else if (sort === "id") {
      cmp = openRank(left) - openRank(right) || left.id.localeCompare(right.id);
    } else if (sort === "feature") {
      cmp = openRank(left) - openRank(right)
        || String(left.feature ?? "").localeCompare(String(right.feature ?? ""))
        || left.id.localeCompare(right.id);
    } else if (sort === "area") {
      cmp = openRank(left) - openRank(right)
        || String(left.area ?? "").localeCompare(String(right.area ?? ""))
        || left.id.localeCompare(right.id);
    } else if (sort === "age") {
      // Default: newest first when sortDir is desc.
      cmp = compareOpenedAsc(left.opened, right.opened)
        || (left.age_days ?? 0) - (right.age_days ?? 0);
    } else {
      // Legacy open-first: open/active above closed, then older→newer within bucket
      cmp = openRank(left) - openRank(right) || compareOpenedAsc(left.opened, right.opened);
    }
    return orient(cmp, sortDir);
  });

  const kinds = [...new Set(source.map((row) => row.kind))].sort();
  const openCount = source.filter((row) => row.status === "open").length;
  const activeCount = source.filter((row) => row.status === "active").length;
  const closedCount = source.filter((row) => workBucket(row.status) === "closed").length;
  const emptyFiltered = rows.length === 0
    ? (
      status === "open" && (activeCount > 0 || closedCount > 0)
        ? `No open work.${activeCount ? ` ${activeCount} active —` : ""}${closedCount ? ` ${closedCount} closed —` : ""} choose Active, Closed, or All.`
        : status === "active" && (openCount > 0 || closedCount > 0)
          ? `No active work.${openCount ? ` ${openCount} open —` : ""}${closedCount ? ` ${closedCount} closed —` : ""} choose Open, Closed, or All.`
          : status === "closed" && (openCount > 0 || activeCount > 0)
            ? `No closed work.${openCount ? ` ${openCount} open —` : ""}${activeCount ? ` ${activeCount} active —` : ""} choose Open, Active, or All.`
            : "No work matches these filters."
    )
    : null;

  const specOptions = collectSpecOptions(source, (row) => row.feature, (row) => row.area);

  panels.work.innerHTML = `
    <div class="page-toolbar">
      ${searchInput("work-q", q, "Search work…")}
      <div class="filters">
        <div class="chip-group">
          <span class="chip-label">Status</span>
          ${chip("work-status", "", status, "All")}
          ${chip("work-status", "open", status, `Open${openCount ? ` (${openCount})` : ""}`)}
          ${chip("work-status", "active", status, `Active${activeCount ? ` (${activeCount})` : ""}`)}
          ${chip("work-status", "closed", status, `Closed${closedCount ? ` (${closedCount})` : ""}`)}
        </div>
        <div class="chip-group">
          <span class="chip-label">Kind</span>
          ${chip("work-kind", "", kind, "All")}
          ${kinds.map((value) => chip("work-kind", value, kind, workKindLabel(value))).join("")}
        </div>
      </div>
      ${filterPanelHtml("work", state.workFilters, specOptions)}
    </div>
    <div class="table-frame">
      <table>
        <thead><tr>${tableHeaders("work", sort, sortDir)}</tr></thead>
        <tbody>
          ${
            emptyFiltered
              ? `<tr><td colspan="7">${escapeHtml(emptyFiltered)}</td></tr>`
              : rows.map((row) => `
            <tr data-id="${escapeHtml(row.id)}" data-status="${escapeHtml(row.status)}">
              ${idCopyCell(row.id, { title: "Copy work id" })}
              <td title="${escapeHtml(row.kind)}">${kindHtml(row.kind, workKindLabel(row.kind))}</td>
              <td class="wrap">${truncateSummary(row.summary)}</td>
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
  const { severity, kind, status, feature, area, q, sort, sortDir = "asc" } = state.signalsFilters;
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
    .filter((issue) => {
      const tags = featureAreaFromSpecId(issue.spec);
      return matchesSpecFilter(tags.feature, feature) && matchesSpecFilter(tags.area, area);
    })
    .filter((issue) => matchesQuery(`${issue.kind} ${issue.ref} ${issue.summary} ${issue.spec ?? ""} ${issueStatus(issue)}`, q));

  issues = [...issues].sort((left, right) => {
    const tags = (issue) => featureAreaFromSpecId(issue.spec);
    let cmp = 0;
    if (sort === "age") {
      // Match compareOpenedAsc polarity: ascending = older first; default sortDir desc ⇒ newest first.
      cmp = (right.age_days ?? 0) - (left.age_days ?? 0);
    } else if (sort === "kind") {
      cmp = left.kind.localeCompare(right.kind);
    } else if (sort === "id") {
      cmp = String(left.ref ?? "").localeCompare(String(right.ref ?? ""));
    } else if (sort === "feature") {
      cmp = String(tags(left).feature ?? "").localeCompare(String(tags(right).feature ?? ""))
        || String(left.ref ?? "").localeCompare(String(right.ref ?? ""));
    } else if (sort === "area") {
      cmp = String(tags(left).area ?? "").localeCompare(String(tags(right).area ?? ""))
        || String(left.ref ?? "").localeCompare(String(right.ref ?? ""));
    } else if (sort === "status") {
      cmp = issueStatus(left).localeCompare(issueStatus(right))
        || (left.age_days ?? 0) - (right.age_days ?? 0);
    } else {
      // default: severity, then newer age within severity
      cmp = (severityRank[left.severity] ?? 9) - (severityRank[right.severity] ?? 9)
        || (left.age_days ?? 0) - (right.age_days ?? 0);
    }
    return orient(cmp, sortDir);
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

  const specOptions = collectSpecOptions(
    source,
    (issue) => featureAreaFromSpecId(issue.spec).feature,
    (issue) => featureAreaFromSpecId(issue.spec).area,
  );

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
      </div>
      ${filterPanelHtml("signals", state.signalsFilters, specOptions)}
    </div>
    <div class="table-frame">
      <table>
        <thead><tr>${tableHeaders("signals", sort, sortDir)}</tr></thead>
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
              <td>${kindHtml(issue.kind)}</td>
              <td class="wrap">${truncateSummary(issue.summary)}<span class="cell-secondary sev-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span></td>
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
  const overlayPhase = index.projection_roots?.overlay_phase;
  const overlayBranch = index.projection_roots?.overlay_branch;
  indexedAt.textContent = overlayPhase
    ? `indexed ${formatAge(index.indexed_at)} · live ${overlayPhase}${overlayBranch ? ` (${overlayBranch})` : ""}`
    : `indexed ${formatAge(index.indexed_at)}`;
  if (heartbeat) {
    heartbeat.title = overlayPhase
      ? `Interim D-018 overlay on primary (live ${overlayBranch || "phase"}) — Docs home is D-020/P-001`
      : "Interim D-018 primary root — Docs home is D-020/P-001";
  }
  syncWorktreesBadge(index);
  syncActiveBadge(index);
  if (!document.querySelector("#worktrees-panel")?.hidden) {
    renderWorktreesPanel(index);
  }
  const high = index.issues.filter(
    (issue) => issueStatus(issue) === "open" && issue.severity === "high",
  ).length;
  if (!issuePill) return;
  issuePill.hidden = false;
  issuePill.dataset.alert = high > 0 ? "true" : "false";
  const signalsTitle = high > 0
    ? `${high} signal${high === 1 ? "" : "s"}`
    : "Signals";
  issuePill.title = signalsTitle;
  issuePill.setAttribute(
    "aria-label",
    high > 0 ? `Open Signals — ${high} high severity` : "Open Signals",
  );
  if (state.page === "signals") issuePill.setAttribute("aria-current", "page");
  else issuePill.removeAttribute("aria-current");
  if (docsPill) {
    if (state.page === "docs") docsPill.setAttribute("aria-current", "page");
    else docsPill.removeAttribute("aria-current");
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
  renderDocs();
  renderSettings();
}

function showPage(page) {
  state.page = page;
  writeStored(PAGE_KEY, page);
  const meta = PAGE_META[page] ?? PAGE_META.active;
  pageTitle.textContent = meta.title;
  for (const [name, panel] of Object.entries(panels)) {
    if (panel) panel.hidden = name !== page;
  }
  for (const tab of document.querySelectorAll(".tab")) {
    if (tab.dataset.page === page) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  const activeBadge = document.querySelector("#active-badge-btn");
  if (activeBadge) {
    if (page === "active") activeBadge.setAttribute("aria-current", "page");
    else activeBadge.removeAttribute("aria-current");
  }
  if (issuePill) {
    if (page === "signals") issuePill.setAttribute("aria-current", "page");
    else issuePill.removeAttribute("aria-current");
  }
  if (docsPill) {
    if (page === "docs") docsPill.setAttribute("aria-current", "page");
    else docsPill.removeAttribute("aria-current");
  }
  if (settingsPill) {
    if (page === "settings") settingsPill.setAttribute("aria-current", "page");
    else settingsPill.removeAttribute("aria-current");
  }
  if (page === "knowledge" || page === "docs" || page === "settings") detail.hidden = true;
  if (page === "settings") renderSettings();
  syncDetailRailGutter();
}

function applyDetailWidth(width) {
  const clamped = Math.min(Math.max(width, 360), Math.floor(window.innerWidth * 0.7));
  detail.style.width = `${clamped}px`;
  writeStored(DETAIL_WIDTH_KEY, String(clamped));
}

function glancePairsHtml(pairs) {
  return `
    <dl class="glance-grid">
      ${pairs
        .map(
          ([left, right]) => `
        ${glanceCellHtml(left[0], left[1], left[2])}
        ${glanceCellHtml(right[0], right[1], right[2] ?? {})}
      `,
        )
        .join("")}
    </dl>
  `;
}

function renderWorkQuestions(questions) {
  if (!questions?.length) return "";
  const items = questions
    .map((item) => {
      const answered = item.answer != null && String(item.answer).length > 0;
      return `<li>
        <strong>${escapeHtml(item.q)}</strong>
        <span class="muted"> · asked ${escapeHtml(item.asked)}</span>
        <div>${answered ? escapeHtml(item.answer) : "<em class=\"muted\">unanswered</em>"}</div>
      </li>`;
    })
    .join("");
  return `
    <div class="phase-card-section">
      <h3 class="now-label">Open questions</h3>
      <ul class="phase-plain-list">${items}</ul>
    </div>`;
}

/** Activity events for a Work id (journal projection — D-022). */
function workActivityEvents(index, workId) {
  return (index?.activity?.current_month ?? [])
    .filter((event) => event.ref === workId)
    .sort((left, right) => String(right.ts ?? "").localeCompare(String(left.ts ?? "")));
}

function renderWorkActivity(index, workId) {
  const events = workActivityEvents(index, workId);
  if (!events.length) {
    return `<div class="phase-card-section">
      <h3 class="now-label">Activity</h3>
      <p class="muted">No activity events with <code>ref: ${escapeHtml(workId)}</code> yet.</p>
    </div>`;
  }
  return `<div class="phase-card-section">
    <h3 class="now-label">Activity</h3>
    <ul class="phase-plain-list">${events.slice(0, 40).map((event) => `
      <li>
        <span class="status" data-state="${escapeHtml(activityDisplayStatus(event, index))}">${escapeHtml(activityDisplayStatus(event, index))}</span>
        <code>${escapeHtml(event.type ?? "—")}</code>
        <span>${escapeHtml(event.cmd ? `${event.cmd} — ${event.summary ?? ""}` : (event.summary ?? "—"))}</span>
        <span class="muted mono">${escapeHtml(event.ts ? formatAge(event.ts) : "—")}</span>
      </li>`).join("")}</ul>
  </div>`;
}

/** Declared context_paths (D-024) — honest empty; never invent from tool traces. */
function contextPathsHtml(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return `<p class="muted">None declared</p>`;
  }
  return `<ul class="phase-plain-list">${paths
    .map((path) => `<li class="mono">${escapeHtml(path)}</li>`)
    .join("")}</ul>`;
}

/** Brief = authored intent (Work `note`). */
function renderWorkBrief(row) {
  const body = row.note
    ? `<p>${escapeHtml(row.note)}</p>`
    : `<p class="muted">No note on this Work row.</p>`;
  return `<div class="phase-card-section">
    <h3 class="now-label">Brief</h3>
    ${body}
  </div>`;
}

/** Context = declared context_paths filled at done. */
function renderWorkContextPaths(row) {
  return `<div class="phase-card-section">
    <h3 class="now-label">Context</h3>
    ${contextPathsHtml(row.context_paths)}
  </div>`;
}

/** Spec ids tagged on the Work row → same Files grouping as Phase (`paths` on specs). */
function workSpecPaths(index, row) {
  const specs = index?.specs ?? [];
  const ids = [row.feature, row.area].filter(Boolean);
  const seen = new Set();
  return ids
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((id) => {
      const spec = specs.find((item) => item.id === id);
      return {
        id,
        title: spec?.title ?? id,
        paths: spec?.paths ?? [],
      };
    });
}

/** Doc homes + phase source + feature/area path trees. */
function renderWorkFiles(index, row) {
  const docs = ["Docs/WORK.yaml"];
  const phase = row.phase
    ? (index?.phases ?? []).find((item) => item.id === row.phase)
    : null;
  if (phase?.sourcePath) docs.push(`Docs/${phase.sourcePath}`);
  for (const specId of [row.feature, row.area].filter(Boolean)) {
    const spec = (index?.specs ?? []).find((item) => item.id === specId);
    if (spec?.sourcePath) docs.push(`Docs/${spec.sourcePath}`);
  }
  const uniqueDocs = [...new Set(docs)];
  const specPaths = workSpecPaths(index, row);
  return `<div class="phase-card-section">
    <h3 class="now-label">Files</h3>
    <ul class="phase-plain-list">${uniqueDocs
      .map((path) => `<li class="mono">${escapeHtml(path)}</li>`)
      .join("")}</ul>
    ${
      specPaths.length
        ? pathsBlockHtml(specPaths)
        : `<p class="muted">No feature/area tags — no spec path trees.</p>`
    }
  </div>`;
}

/** Work detail — same section chrome as Phase details (Status block + card sections). */
function renderWorkDetail(row, index, { primary = false } = {}) {
  const pairs = [
    [
      ["Kind", kindHtml(row.kind, workKindLabel(row.kind))],
      ["Status", statusHtml(row.status)],
    ],
    [
      ["Opened", escapeHtml(row.opened ?? "—"), { mono: true }],
      ["Age", escapeHtml(formatOpenedAge(row.opened))],
    ],
    [
      ["Feature", escapeHtml(shortSpecId(row.feature)), { mono: true }],
      ["Area", escapeHtml(shortSpecId(row.area)), { mono: true }],
    ],
    [
      ["Phase", escapeHtml(row.phase ?? "—"), { mono: true }],
      ["Blocked by", escapeHtml(row.blocked_by ?? "—"), { mono: true }],
    ],
    [
      ["Promoted to", escapeHtml(row.promoted_to ?? "—"), { mono: true }],
      ["Activity", escapeHtml(String(workActivityEvents(index, row.id).length)), { mono: true }],
    ],
  ];
  const bodySections = [
    renderWorkBrief(row),
    renderWorkContextPaths(row),
    renderWorkQuestions(row.open_questions),
    row.done_summary
      ? `<div class="phase-card-section">
          <h3 class="now-label">Done summary</h3>
          <p>${escapeHtml(row.done_summary)}</p>
        </div>`
      : "",
    renderWorkFiles(index, row),
    renderWorkActivity(index, row.id),
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="phase-view${primary ? "" : " phase-view-compact"}" data-work="${escapeHtml(row.id)}">
      <header class="phase-header">
        ${primary ? `<p class="phase-id-row"><code>${escapeHtml(row.id)}</code></p>` : ""}
        <h2 class="phase-name">${escapeHtml(row.summary)}</h2>
        <p class="phase-outcome">Ledger row in <code>Docs/WORK.yaml</code> — not a separate markdown ticket.</p>
      </header>
      <section class="phase-block">
        <h3 class="now-label">Status</h3>
        ${glancePairsHtml(pairs)}
      </section>
      <section class="phase-card">${bodySections}</section>
    </article>
  `;
}

/** Signal detail — Phase-aligned Status + header. */
function renderSignalDetail(issue) {
  const age =
    issue.age_days == null ? "—" : issue.age_days === 0 ? "<24h" : `${issue.age_days}d`;
  const pairs = [
    [
      ["Kind", kindHtml(issue.kind)],
      ["Status", statusHtml(issueStatus(issue))],
    ],
    [
      ["Severity", escapeHtml(issue.severity)],
      ["Spec", escapeHtml(issue.spec ?? "—"), { mono: true }],
    ],
    [
      ["Age", escapeHtml(age)],
      ["Source", "Derived signal"],
    ],
  ];
  return `
    <article class="phase-view phase-view-compact">
      <header class="phase-header">
        <h2 class="phase-name">${escapeHtml(issue.summary)}</h2>
        <p class="phase-outcome">Derived health signal — not an authored Work row.</p>
      </header>
      <section class="phase-block">
        <h3 class="now-label">Status</h3>
        ${glancePairsHtml(pairs)}
      </section>
    </article>
  `;
}

const DETAIL_RAIL_GUTTER = 52;

/** Right-docked: expanded › collapses toward edge; collapsed ‹ expands open. */
function syncDetailCollapseControl() {
  const btn = document.querySelector("#detail-collapse");
  if (!btn) return;
  const collapsed = detail.classList.contains("collapsed");
  btn.textContent = collapsed ? "‹" : "›";
  btn.title = collapsed ? "Expand panel" : "Collapse panel";
  btn.setAttribute("aria-label", btn.title);
  btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

/**
 * Reserve only the collapsed-rail width while detail is open.
 * Expanded panel overlays further left — workspace does not reflow on expand/collapse.
 */
function syncDetailRailGutter() {
  const open = Boolean(detail && !detail.hidden);
  document.body.style.setProperty(
    "--detail-rail-gutter",
    open ? `${DETAIL_RAIL_GUTTER}px` : "0px",
  );
}

function closeDetail() {
  detail.hidden = true;
  detail.classList.remove("collapsed");
  state.selectedId = null;
  syncDetailTitleCopy(null);
  syncDetailCollapseControl();
  syncDetailRailGutter();
  if (state.index) {
    if (state.page === "roadmap") renderRoadmap(state.index);
    if (state.page === "work") renderWork(state.index);
    if (state.page === "signals") renderSignals(state.index);
  }
}


function syncDetailTitleCopy(id) {
  if (!detailTitleCopy) return;
  const value = String(id ?? "").trim();
  if (!value || value === "Detail") {
    detailTitleCopy.hidden = true;
    detailTitleCopy.dataset.copy = "";
    return;
  }
  detailTitleCopy.hidden = false;
  detailTitleCopy.dataset.copy = value;
  detailTitleCopy.title = `Copy ${value}`;
  detailTitleCopy.setAttribute("aria-label", `Copy ${value}`);
}

async function openDetail(id) {
  state.selectedId = id;
  detail.hidden = false;
  detail.classList.remove("collapsed");
  detailTitle.textContent = id;
  syncDetailTitleCopy(id);
  applyDetailWidth(Number(readStored(DETAIL_WIDTH_KEY)) || 560);
  syncDetailCollapseControl();
  syncDetailRailGutter();
  // ID lives in the topbar title — never repeat path/id bylines under it.
  detailMeta.textContent = "";
  detailMeta.hidden = true;

  const phase = state.index?.phases?.find((item) => item.id === id);
  const work = state.index?.work?.find((item) => item.id === id);
  const signal = state.index?.issues?.find((item) => item.ref === id);

  if (phase) {
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderPhaseView(phase, state.index, {
      primary: phase.state === "active",
      compact: true,
    });
    await hydratePhaseDocs(detailBody);
  } else if (work) {
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderWorkDetail(work, state.index);
  } else if (signal) {
    detailFrontmatter.hidden = true;
    detailFrontmatter.innerHTML = "";
    detailBody.className = "doc-body";
    detailBody.innerHTML = renderSignalDetail(signal);
  } else {
    const response = await fetch(`/api/doc?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      detailFrontmatter.hidden = true;
      detailBody.className = "doc-body";
      detailBody.innerHTML = `<p class="muted">No detail for ${escapeHtml(id)}.</p>`;
      return;
    }
    const doc = await response.json();
    detailBody.className = "doc-body prose";
    renderDocInto(doc, {
      pathEl: null,
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

issuePill?.addEventListener("click", () => {
  showPage("signals");
});

docsPill?.addEventListener("click", () => {
  showPage("docs");
});

settingsPill?.addEventListener("click", () => {
  showPage("settings");
});

panels.settings?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-color-mode]");
  if (!button?.dataset.colorMode) return;
  applyColorMode(button.dataset.colorMode);
  renderSettings();
});

document.querySelector("#reindex").addEventListener("click", () => {
  void reindex();
});

document.querySelector("#commands-panel-btn")?.addEventListener("click", () => {
  const panel = document.querySelector("#commands-panel");
  setCommandsPanelOpen(Boolean(panel?.hidden));
});

document.querySelector("#commands-panel-close")?.addEventListener("click", () => {
  setCommandsPanelOpen(false);
});

document.querySelector("#active-badge-btn")?.addEventListener("click", () => {
  setWorktreesPanelOpen(false);
  setCommandsPanelOpen(false);
  showPage("active");
});

panels.active?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-active-tab]");
  if (!tab?.dataset.activeTab || !state.index) return;
  state.activeTabId = tab.dataset.activeTab;
  renderActive(state.index);
});

document.querySelector("#worktrees-panel-btn")?.addEventListener("click", () => {
  const panel = document.querySelector("#worktrees-panel");
  setWorktreesPanelOpen(Boolean(panel?.hidden));
});

document.querySelector("#worktrees-panel-close")?.addEventListener("click", () => {
  setWorktreesPanelOpen(false);
});

document.querySelector("#worktrees-panel-body")?.addEventListener("click", (event) => {
  const openPhase = event.target.closest("[data-open-id]");
  if (openPhase?.dataset.openId) {
    setWorktreesPanelOpen(false);
    showPage("roadmap");
    void openDetail(openPhase.dataset.openId);
    return;
  }
});

document.querySelector("#commands-panel-body")?.addEventListener("click", (event) => {
  const button = event.target.closest(".cmd-copy");
  if (!button?.dataset.copy) return;
  void navigator.clipboard?.writeText(button.dataset.copy);
});

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  writeStored(THEME_KEY, next);
  applyTheme(next);
  if (state.page === "settings") renderSettings();
});

document.querySelector("#detail-close").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeDetail();
});

document.querySelector("#detail-collapse").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  detail.classList.toggle("collapsed");
  syncDetailCollapseControl();
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
    event.preventDefault();
    event.stopPropagation();
    void copyText(copy.dataset.copy).then(() => {
      const previous = copy.textContent;
      copy.textContent = "✓";
      setTimeout(() => {
        copy.textContent = previous;
      }, 900);
    });
    return;
  }

  const tocCollapse = event.target.closest("[data-toc-collapse]");
  if (tocCollapse && state.index) {
    state.tocCollapsed = true;
    writeStored(TOC_COLLAPSED_KEY, "1");
    renderKnowledge(state.index);
    return;
  }

  const tocExpand = event.target.closest("[data-toc-expand]");
  if (tocExpand && state.index) {
    state.tocCollapsed = false;
    writeStored(TOC_COLLAPSED_KEY, "0");
    renderKnowledge(state.index);
    return;
  }

  const knowledgeLink = event.target.closest("[data-knowledge-link]");
  if (knowledgeLink?.dataset.knowledgeLink && state.index && state.page === "knowledge") {
    selectKnowledgeDoc(knowledgeLink.dataset.knowledgeLink);
    return;
  }

  const tocItem = event.target.closest("[data-knowledge-id]");
  if (tocItem && state.index) {
    selectKnowledgeDoc(tocItem.dataset.knowledgeId);
    return;
  }

  const docsTocItem = event.target.closest("[data-docs-id]");
  if (docsTocItem) {
    state.docsId = docsTocItem.dataset.docsId;
    for (const item of document.querySelectorAll("[data-docs-id]")) {
      if (item === docsTocItem) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    }
    void loadDocsDoc(state.docsId);
    return;
  }

  const sortButton = event.target.closest("[data-sort-key]");
  if (sortButton?.dataset.sortKey && state.index) {
    applyTableSort(state.page, sortButton.dataset.sortKey);
    return;
  }

  const panelToggle = event.target.closest("[data-filter-panel-toggle]");
  if (panelToggle && state.index) {
    state.filterPanelOpen = !state.filterPanelOpen;
    rerenderTablePage(state.page);
    return;
  }

  const resetButton = event.target.closest("[data-filter-reset]");
  if (resetButton && state.index && !resetButton.disabled) {
    resetPageFilters(state.page);
    return;
  }

  const chipButton = event.target.closest("[data-filter]");
  if (chipButton && state.index) {
    const { filter, value } = chipButton.dataset;
    if (filter === "feature" || filter === "area") {
      setPageFilter(state.page, filter, value);
    } else if (["state", "type"].includes(filter) && state.page === "roadmap") {
      state.roadmapFilters = { ...state.roadmapFilters, [filter]: value };
      persistPageFilters("roadmap");
      renderRoadmap(state.index);
    } else if (filter === "type" && state.page === "activity") {
      state.activityFilters = { ...state.activityFilters, type: value };
      persistPageFilters("activity");
      renderActivity(state.index);
    } else if (filter === "work-status") {
      state.workFilters = { ...state.workFilters, status: value };
      persistPageFilters("work");
      renderWork(state.index);
    } else if (filter === "work-kind") {
      state.workFilters = { ...state.workFilters, kind: value };
      persistPageFilters("work");
      renderWork(state.index);
    } else if (filter === "signal-status") {
      state.signalsFilters = { ...state.signalsFilters, status: value };
      persistPageFilters("signals");
      renderSignals(state.index);
    } else if (filter === "signal-severity") {
      state.signalsFilters = { ...state.signalsFilters, severity: value };
      persistPageFilters("signals");
      renderSignals(state.index);
    } else if (filter === "signal-kind") {
      state.signalsFilters = { ...state.signalsFilters, kind: value };
      persistPageFilters("signals");
      renderSignals(state.index);
    } else if (filter === "knowledge-type" && state.page === "knowledge") {
      state.knowledgeFilters = { ...state.knowledgeFilters, type: value };
      persistPageFilters("knowledge");
      renderKnowledge(state.index);
      const restore = panels.knowledge.querySelector('input[name="knowledge-q"]');
      if (restore) restore.focus();
    } else if (filter === "knowledge-status" && state.page === "knowledge") {
      state.knowledgeFilters = { ...state.knowledgeFilters, status: value };
      persistPageFilters("knowledge");
      renderKnowledge(state.index);
      const restore = panels.knowledge.querySelector('input[name="knowledge-q"]');
      if (restore) restore.focus();
    }
    return;
  }

  if (state.filterPanelOpen && !event.target.closest(".filter-panel-wrap")) {
    state.filterPanelOpen = false;
    rerenderTablePage(state.page);
    return;
  }

  if (state.page === "knowledge" || state.page === "docs") return;
  const row = event.target.closest("tr[data-id]");
  if (row?.dataset.id) void openDetail(row.dataset.id);
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
    persistPageFilters("roadmap");
    renderRoadmap(state.index);
    restore(panels.roadmap, "roadmap-q");
  } else if (input.name === "activity-q") {
    state.activityFilters = { ...state.activityFilters, q: input.value };
    persistPageFilters("activity");
    renderActivity(state.index);
    restore(panels.activity, "activity-q");
  } else if (input.name === "work-q") {
    state.workFilters = { ...state.workFilters, q: input.value };
    persistPageFilters("work");
    renderWork(state.index);
    restore(panels.work, "work-q");
  } else if (input.name === "signals-q") {
    state.signalsFilters = { ...state.signalsFilters, q: input.value };
    persistPageFilters("signals");
    renderSignals(state.index);
    restore(panels.signals, "signals-q");
  } else if (input.name === "knowledge-q") {
    state.knowledgeFilters = { ...state.knowledgeFilters, q: input.value };
    persistPageFilters("knowledge");
    renderKnowledge(state.index);
    restore(panels.knowledge, "knowledge-q");
  }
});

document.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest('[data-resize="toc"]');
  if (!handle) return;
  event.preventDefault();
  handle.setPointerCapture(event.pointerId);
  const shell = handle.closest(".knowledge");
  const move = (moveEvent) => {
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    const width = Math.min(Math.max(moveEvent.clientX - rect.left, 220), 480);
    shell.style.setProperty("--toc-w", `${width}px`);
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
applyColorMode(readStored(COLOR_MODE_KEY) || "rich");
// Detail stays closed until a row is opened — never auto-show on refresh.
detail.hidden = true;
detail.classList.remove("collapsed");
state.selectedId = null;
applyDetailWidth(Number(readStored(DETAIL_WIDTH_KEY)) || 520);
syncDetailCollapseControl();
syncDetailRailGutter();
showPage(state.page);
void loadIndex().then(connectEvents).catch((error) => {
  panels.active.innerHTML = `<div class="empty">Dashboard failed to load: ${escapeHtml(error.message)}</div>`;
});
