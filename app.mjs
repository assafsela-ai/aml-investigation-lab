import { checkClaims, findOwnershipConflicts, rankAlerts } from "./model.mjs";

const byId = id => document.getElementById(id);
const lab = byId("lab");
const stage = byId("stage");
const inspector = byId("inspector");
const caseSelect = byId("case-select");
const stageButtons = [...byId("stages").querySelectorAll("button")];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const escape = value => String(value).replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const decisions = ["Close alert", "Request information", "Escalate for review"];
const nodeLabels = ["Origin", "Account under review", "Recipient"];
const state = {
  stage: "flow", method: "context", capacity: 3, sourceId: null,
  visibleSettlement: true, checked: false, decisions: new Map(),
};
let data;

const activeCase = () => data.cases.find(record => record.id === caseSelect.value);
const visibleRecords = () => {
  const record = activeCase();
  return [...record.transfers, ...record.documents].filter(source =>
    source.type !== "settlement" || state.visibleSettlement);
};

function announce(message) {
  byId("announcement").textContent = message;
}

function sectionHead(title, description, action = "") {
  return `<div class="section-head"><div><p class="meta">${escape(activeCase().id)}</p>
    <h2 id="stage-title" tabindex="-1">${title}</h2><p>${description}</p></div>${action}</div>`;
}

function sourceButton(record, label) {
  return `<button type="button" class="quiet" data-record="${escape(record.id)}">${label}</button>`;
}

function settlementToggle() {
  if (!activeCase().documents.some(record => record.type === "settlement")) return "";
  return `<label class="toggle"><input type="checkbox" id="settlement" ${state.visibleSettlement ? "checked" : ""}> Include the settlement record</label>`;
}

function renderInspector() {
  if (state.stage === "queue") {
    inspector.innerHTML = `<h2 id="inspector-title" tabindex="-1">How to read the queue</h2>
      <p class="inspector-intro">Only the cases with an Open button include a full investigation.</p>
      <div class="inspector-detail"><h3>Rules score</h3><p>Ranks alerts by the transfer pattern alone.</p></div>
      <div class="inspector-detail"><h3>With case context</h3><p>Also considers business records and open questions. Both sets of scores are fixed for this training exercise.</p></div>
      <div class="inspector-detail"><h3>Priority label</h3><p>The training label marks a case that needs further review.</p></div>`;
    return;
  }
  const sources = visibleRecords();
  const record = sources.find(source => source.id === state.sourceId);
  inspector.innerHTML = `<h2 id="inspector-title" tabindex="-1">Source records</h2>
    <p class="inspector-intro">Open a record to read the original entry.</p>
    <ul class="records">${sources.map(source => `<li><button type="button" class="quiet record"
      data-record="${escape(source.id)}" aria-pressed="${source.id === state.sourceId}">
      <span>${escape(source.title)}</span><span class="record-id">${escape(source.id)}</span>
    </button></li>`).join("")}</ul>
    ${record ? `<div class="inspector-detail"><h3 id="source-title" tabindex="-1">${escape(record.title)}</h3>
      <p class="record-id">${escape(record.id)} · ${escape(record.date)}</p>
      <p class="source-text">${escape(record.text)}</p></div>` : ""}`;
}

function renderFlow() {
  const record = activeCase();
  const graph = record.accounts.map((name, index) => {
    const transfer = record.transfers[index];
    return `<div class="node ${index === 1 ? "subject" : ""}"><small>${nodeLabels[index]}</small><strong>${escape(name)}</strong></div>
      ${transfer ? `<button type="button" class="edge" data-record="${escape(transfer.id)}" aria-pressed="${transfer.id === state.sourceId}"
        aria-label="Open ${escape(transfer.title.toLowerCase())} of ${currency.format(transfer.amount)}, ${escape(transfer.id)}">
        <span class="edge-line" aria-hidden="true"></span>${currency.format(transfer.amount)}
      </button>` : ""}`;
  }).join("");
  stage.innerHTML = sectionHead(escape(record.name), "Open a transfer to inspect the source record.",
    '<button type="button" class="primary" data-go="review" data-check>Check evidence</button>') +
    `<div class="graph" role="group" aria-label="Money flow in time order">${graph}</div>
    <p class="graph-note">12 Oct 2026 · Transfer amounts in USD</p>`;
}

function renderOwnership() {
  const sources = visibleRecords();
  const documents = sources.filter(source => source.type === "ownership");
  const conflicts = findOwnershipConflicts(sources);
  const ownership = documents[0];
  stage.innerHTML = sectionHead("Compare ownership records", "Open the original lines and compare the reported dates and stakes.") +
    `<div class="ownership-map"><span>${escape(ownership.owner)}</span>
      <b>${documents.map(record => `${record.stake}%`).join(" / ")}</b><span>${escape(ownership.subject)}</span></div>
    ${conflicts.length ? `<p class="notice warning"><strong>Ownership conflict.</strong> The two records report different stakes on ${escape(ownership.asOf)}. The verified stake is still open.</p>` :
    '<p class="notice ranking-summary">One ownership record is available in this case.</p>'}
    <ul class="records">${documents.map(record => `<li>${sourceButton(record, `${escape(record.title)} · ${record.stake}%`)}</li>`).join("")}</ul>`;
}

function renderRanking(shouldAnnounce = false) {
  for (const button of stage.querySelectorAll("[data-method]")) {
    button.setAttribute("aria-pressed", button.dataset.method === state.method);
  }
  byId("capacity-display").textContent = state.capacity;
  const result = rankAlerts(data.queue, state.method, state.capacity);
  const summary = `${result.found} of ${result.total} priority cases inside the review limit. ${result.total - result.found} outside.`;
  byId("ranking").innerHTML = `<p class="ranking-summary">${summary}</p>
    <ol class="rank-list">${result.ranked.map((alert, index) => {
      const title = `${escape(alert.name)} <span class="record-id">${escape(alert.id)}</span>`;
      const open = data.cases.some(record => record.id === alert.id);
      return `<li class="${index < state.capacity ? "selected" : ""}"><div class="rank-row">
        ${open ? `<button type="button" class="row-link" data-open="${escape(alert.id)}" aria-label="Open ${escape(alert.name)}">${title}</button>` : `<span>${title}</span>`}
        <span class="rank-score">${alert[state.method]}</span>
        <span class="rank-state">${index < state.capacity ? "In queue" : "Outside queue"}${alert.priority ? " · Priority case" : ""}</span>
      </div></li>`;
    }).join("")}</ol>`;
  if (shouldAnnounce) announce(summary);
}

function renderQueue() {
  stage.innerHTML = `<div class="section-head"><div><h2 id="stage-title" tabindex="-1">Prioritize alerts</h2>
    <p>Compare which cases a team can reach with the same review limit.</p></div></div>
    <div class="controls">
      <div role="group" aria-label="Ranking method">
        <button type="button" class="quiet method" data-method="rules">Rules score</button>
        <button type="button" class="quiet method" data-method="context">With case context</button>
      </div>
      <div class="budget"><label for="capacity">Daily review limit</label>
        <input id="capacity" type="range" min="1" max="${data.queue.length}" value="${state.capacity}">
        <span id="capacity-display" aria-hidden="true">${state.capacity}</span>
      </div>
    </div><div id="ranking"></div>`;
  renderRanking();
}

function renderClaims() {
  const claims = checkClaims(activeCase().claims, visibleRecords());
  byId("claims").innerHTML = claims.map(claim => `<li class="claim">
    <strong>${escape(claim.text)}</strong>
    ${state.checked ? `<span class="claim-badge ${claim.supported ? "good" : "warning"}">${claim.supported ? "Supported" : "Missing support"}</span>
      ${claim.supported ? "" : `<p>${escape(claim.gap)}</p>`}` : ""}
    ${claim.record ? sourceButton(claim.record, `Open cited record · ${escape(claim.source)}`) : `<p class="record-id">Record ${escape(claim.source)} is hidden.</p>`}
  </li>`).join("");
  return claims.filter(claim => !claim.supported).length;
}

function renderReview() {
  const selected = state.decisions.get(activeCase().id);
  stage.innerHTML = sectionHead("Check the draft against its sources",
    "This prepared AI-style draft is checked in your browser against the training records.",
    '<button type="button" class="primary" data-check>Check evidence</button>') +
    `<ul id="claims" class="claims"></ul>${settlementToggle()}
    <form id="decision-form">
      <div class="decision"><label for="decision">Your next step</label>
        <select id="decision" required>
          <option value="">Choose a next step</option>
          ${decisions.map(option => `<option ${selected === option ? "selected" : ""}>${option}</option>`).join("")}
        </select><button type="submit" class="secondary">Record decision</button>
      </div>
      <p class="decision-note" id="decision-note">${selected ? `Recorded for this session: ${selected}.` : "Your choice stays in this practice session."}</p>
    </form>`;
  renderClaims();
}

const stageViews = { queue: renderQueue, flow: renderFlow, ownership: renderOwnership, review: renderReview };

function renderStage(focus = false) {
  for (const button of stageButtons) {
    if (button.dataset.stage === state.stage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  stageViews[state.stage]();
  renderInspector();
  if (focus) byId("stage-title").focus();
}

function selectCase(id) {
  caseSelect.value = id;
  state.sourceId = null;
  state.visibleSettlement = true;
  state.checked = false;
}

function reportCheck() {
  const missing = renderClaims();
  announce(`Evidence checked. ${missing} of ${activeCase().claims.length} claims lack support.`);
}

lab.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset;
  if (action.open) {
    selectCase(action.open);
    state.stage = "flow";
    renderStage(true);
  } else if (action.record) {
    state.sourceId = action.record;
    for (const edge of stage.querySelectorAll(".edge")) {
      edge.setAttribute("aria-pressed", edge.dataset.record === state.sourceId);
    }
    renderInspector();
    byId("source-title").focus();
  } else if (action.stage || action.go) {
    state.stage = action.stage || action.go;
    if (button.hasAttribute("data-check")) state.checked = true;
    renderStage(true);
    if (button.hasAttribute("data-check")) reportCheck();
  } else if (action.method) {
    state.method = action.method;
    renderRanking(true);
  } else if (button.hasAttribute("data-check")) {
    state.checked = true;
    reportCheck();
  }
});

lab.addEventListener("input", event => {
  if (event.target.id !== "capacity") return;
  state.capacity = Number(event.target.value);
  renderRanking(true);
});

lab.addEventListener("change", event => {
  if (event.target === caseSelect) {
    selectCase(caseSelect.value);
    if (state.stage === "queue") state.stage = "flow";
    renderStage();
    announce(`Opened ${activeCase().name}.`);
  }
  if (event.target.id === "settlement") {
    state.visibleSettlement = event.target.checked;
    if (!visibleRecords().some(record => record.id === state.sourceId)) state.sourceId = null;
    if (state.checked) reportCheck();
    else renderClaims();
    renderInspector();
  }
});

lab.addEventListener("submit", event => {
  if (event.target.id !== "decision-form") return;
  event.preventDefault();
  const selection = byId("decision").value;
  const message = `Recorded for this session: ${selection}.`;
  state.decisions.set(activeCase().id, selection);
  byId("decision-note").textContent = message;
  announce(message);
});

try {
  const response = await fetch(new URL("./data/cases.json", import.meta.url));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  data = await response.json();
  caseSelect.innerHTML = data.cases.map(record => `<option value="${escape(record.id)}">${escape(record.name)}</option>`).join("");
  renderStage();
  lab.hidden = false;
  byId("loading").hidden = true;
} catch (error) {
  byId("loading").textContent = "The training cases could not load. Reload the page, or serve the local checkout over HTTP.";
  console.error(error);
}
