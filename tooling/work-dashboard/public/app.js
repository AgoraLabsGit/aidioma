const elements = {
  area: document.querySelector("#area"),
  empty: document.querySelector("#empty-state"),
  filters: document.querySelector("#filters"),
  kind: document.querySelector("#kind"),
  refresh: document.querySelector("#refresh"),
  resultCount: document.querySelector("#result-count"),
  rows: document.querySelector("#registry-rows"),
  search: document.querySelector("#search"),
  sourceRoot: document.querySelector("#source-root"),
  status: document.querySelector("#status"),
  summary: document.querySelector("#summary"),
  warningCount: document.querySelector("#warning-count"),
  warningList: document.querySelector("#warning-list"),
  warningPanel: document.querySelector("#warning-panel"),
};

let registryRows = [];

function createTextElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function populateFilter(select, values, label) {
  const currentValue = select.value;
  const options = [new Option(`All ${label}`, "")];
  for (const value of [...new Set(values)].sort((left, right) => left.localeCompare(right))) {
    options.push(new Option(value, value));
  }
  select.replaceChildren(...options);
  if (values.includes(currentValue)) select.value = currentValue;
}

function renderSummary(counts) {
  const values = [
    counts.work,
    counts.fixes,
    counts.specs,
    counts.migrations,
    counts.pendingMigrationDecisions,
    counts.errors + counts.warnings,
  ];
  const targets = elements.summary.querySelectorAll("dd");
  targets.forEach((target, index) => { target.textContent = String(values[index]); });
}

function renderWarnings(warnings) {
  elements.warningPanel.hidden = warnings.length === 0;
  elements.warningCount.textContent = `${warnings.length} ${warnings.length === 1 ? "issue" : "issues"}`;
  const items = warnings.map((warning) => {
    const item = document.createElement("li");
    item.className = `warning-${warning.severity}`;
    const message = createTextElement("span", "", warning.message);
    const source = createTextElement("code", "source-path", ` — ${warning.sourcePath}`);
    item.append(message, source);
    return item;
  });
  elements.warningList.replaceChildren(...items);
}

function matchesFilters(row) {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const searchable = [row.id, row.title, row.summary, row.area, row.status, row.sourcePath]
    .join(" ")
    .toLocaleLowerCase();
  return (
    (!query || searchable.includes(query)) &&
    (!elements.kind.value || row.kind === elements.kind.value) &&
    (!elements.status.value || row.status === elements.status.value) &&
    (!elements.area.value || row.area === elements.area.value)
  );
}

function renderRow(row) {
  const tableRow = document.createElement("tr");
  const identity = document.createElement("td");
  identity.append(
    createTextElement("strong", "row-title", row.title),
    createTextElement("code", "row-id", row.id),
    createTextElement("p", "row-summary", row.summary),
  );

  const kind = document.createElement("td");
  kind.append(createTextElement("span", "pill", row.kind));

  const status = document.createElement("td");
  const statusPill = createTextElement("span", "pill", row.status);
  statusPill.dataset.status = row.status;
  status.append(statusPill);

  const area = createTextElement("td", "", row.area);
  const nextAction = document.createElement("td");
  nextAction.append(createTextElement("p", "next-action", row.nextAction ?? "—"));
  const source = document.createElement("td");
  source.append(createTextElement("code", "source-path", `${row.sourceRoot}/${row.sourcePath}`));
  tableRow.append(identity, kind, status, area, nextAction, source);
  return tableRow;
}

function renderRows() {
  const visibleRows = registryRows.filter(matchesFilters);
  elements.rows.replaceChildren(...visibleRows.map(renderRow));
  elements.empty.hidden = visibleRows.length !== 0;
  elements.resultCount.textContent = `${visibleRows.length} of ${registryRows.length} rows shown`;
}

async function loadRegistry() {
  elements.refresh.disabled = true;
  elements.resultCount.classList.remove("load-error");
  elements.resultCount.textContent = "Loading registry…";
  try {
    const response = await fetch("/api/registry", { cache: "no-store" });
    if (response.status !== 200 && response.status !== 422) {
      throw new Error("Registry request failed");
    }
    const snapshot = await response.json();
    registryRows = snapshot.rows;
    elements.sourceRoot.textContent = `Source root: ${snapshot.sourceRoot}`;
    renderSummary(snapshot.counts);
    renderWarnings(snapshot.warnings);
    populateFilter(elements.kind, registryRows.map((row) => row.kind), "kinds");
    populateFilter(elements.status, registryRows.map((row) => row.status), "statuses");
    populateFilter(elements.area, registryRows.map((row) => row.area), "areas");
    renderRows();
  } catch {
    registryRows = [];
    elements.rows.replaceChildren();
    elements.sourceRoot.textContent = "Source root: unavailable";
    elements.empty.hidden = true;
    elements.resultCount.classList.add("load-error");
    elements.resultCount.textContent = "Registry could not be loaded. Check the terminal for validation details.";
  } finally {
    elements.refresh.disabled = false;
  }
}

elements.filters.addEventListener("input", renderRows);
elements.filters.addEventListener("change", renderRows);
elements.refresh.addEventListener("click", loadRegistry);
void loadRegistry();
