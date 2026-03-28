// ZOCR Match - Compare GRPO Values vs AI OCR Extracted Values
const EXTRACTION_KEY = "documentAI_lastExtraction";

// User & Logout
const userEmailEl = document.getElementById("userEmail");
const btnLogout = document.getElementById("btnLogout");

const storedUser = localStorage.getItem("docai_user");
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    if (userEmailEl) userEmailEl.textContent = user.email || user.name || "";
  } catch (e) { }
}

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("docai_user");
    window.location.href = "/login.html";
  });
}

// DOM Elements
const noDataState = document.getElementById("noDataState");
const legendSection = document.getElementById("legendSection");
const summaryStats = document.getElementById("summaryStats");
const headerFieldsCard = document.getElementById("headerFieldsCard");
const headerFieldsGrid = document.getElementById("headerFieldsGrid");
const headerFieldCount = document.getElementById("headerFieldCount");
const lineItemsCard = document.getElementById("lineItemsCard");
const lineItemsContainer = document.getElementById("lineItemsContainer");
const lineItemCount = document.getElementById("lineItemCount");

// State
let extractionData = null;
let grpoValues = {}; // { fieldName: value }
let grpoLineItems = []; // [ { description, quantity, unitPrice, netAmount } ]

// Load extraction data from localStorage
function loadExtractionData() {
  const raw = localStorage.getItem(EXTRACTION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Initialize
function init() {
  extractionData = loadExtractionData();

  if (!extractionData || !extractionData.results || extractionData.results.length === 0) {
    noDataState.classList.remove("hidden");
    return;
  }

  noDataState.classList.add("hidden");
  legendSection.classList.remove("hidden");
  summaryStats.classList.remove("hidden");
  headerFieldsCard.classList.remove("hidden");
  lineItemsCard.classList.remove("hidden");

  // Use first successful result
  const successResult = extractionData.results.find(r => r.success);
  if (!successResult) {
    noDataState.classList.remove("hidden");
    return;
  }

  const extraction = successResult.data.extraction || successResult.data.extractionResult || successResult.data.document || successResult.data;

  // Parse header fields
  let headerArray = extraction.headerFields || extraction.header || [];
  let header = {};

  if (Array.isArray(headerArray)) {
    headerArray.forEach(field => {
      if (field.name && (field.value !== undefined || field.rawValue !== undefined)) {
        header[field.name] = {
          value: field.value !== undefined ? field.value : field.rawValue,
          confidence: field.confidence || 0
        };
      }
    });
  } else if (typeof headerArray === 'object') {
    header = headerArray;
  }

  // Parse line items
  let linesArray = extraction.lineItemFields || extraction.lineItems || extraction.lineItem || [];
  let lines = [];

  if (Array.isArray(linesArray)) {
    if (linesArray.length > 0 && Array.isArray(linesArray[0])) {
      lines = linesArray.map(row => {
        const lineObj = {};
        row.forEach(field => {
          if (field.name) {
            lineObj[field.name] = {
              value: field.value !== undefined ? field.value : field.rawValue,
              confidence: field.confidence || 0
            };
          }
        });
        return lineObj;
      });
    } else {
      lines = linesArray;
    }
  }

  // Initialize GRPO line items with empty values
  grpoLineItems = lines.map(() => ({
    description: "",
    quantity: "",
    unitPrice: "",
    netAmount: ""
  }));

  renderHeaderFields(header);
  renderLineItems(lines);
  renderSummaryStats(header);
  renderClearButton(header, lines);
}

// Render Summary Stats
function renderSummaryStats(header) {
  const totalFields = Object.keys(header).length;
  const matchedCount = countMatches(header);
  const mismatchedCount = totalFields - matchedCount;

  // Average confidence
  const confs = Object.values(header).map(obj => {
    const conf = obj && typeof obj === "object" && "confidence" in obj ? obj.confidence : 0;
    return conf;
  });
  const avgConf = confs.length > 0 ? Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 100) : 0;

  summaryStats.innerHTML = `
    <div class="fd-card stat-card-sap"><div class="fd-card__content" style="text-align: center; padding: 1.25rem;">
      <div class="stat-value-sap">${totalFields}</div>
      <div class="stat-label-sap">Total Fields</div>
    </div></div>
    <div class="fd-card stat-card-sap"><div class="fd-card__content" style="text-align: center; padding: 1.25rem;">
      <div class="stat-value-sap" id="matchedCount" style="color: var(--sapPositiveColor, #188918);">${matchedCount}</div>
      <div class="stat-label-sap">Matched</div>
    </div></div>
    <div class="fd-card stat-card-sap"><div class="fd-card__content" style="text-align: center; padding: 1.25rem;">
      <div class="stat-value-sap" id="mismatchedCount" style="color: var(--sapNegativeColor, #bb0000);">${mismatchedCount}</div>
      <div class="stat-label-sap">Mismatched</div>
    </div></div>
    <div class="fd-card stat-card-sap"><div class="fd-card__content" style="text-align: center; padding: 1.25rem;">
      <div class="stat-value-sap" style="color: var(--sapCriticalColor, #df6e0c);">${avgConf}%</div>
      <div class="stat-label-sap">Avg Confidence</div>
    </div></div>
  `;
}

function countMatches(header) {
  let matched = 0;
  Object.entries(header).forEach(([key, obj]) => {
    const aiValue = obj && typeof obj === "object" && "value" in obj ? String(obj.value) : String(obj);
    const grpoVal = grpoValues[key] || "";
    if (grpoVal === "") return; // don't count empty as match
    if (normalizeForCompare(grpoVal) === normalizeForCompare(aiValue)) {
      matched++;
    }
  });
  return matched;
}

function normalizeForCompare(val) {
  if (val == null) return "";
  return String(val).trim().toLowerCase().replace(/[,\s]+/g, ' ');
}

// Render Header Fields
function renderHeaderFields(header) {
  const entries = Object.entries(header);
  headerFieldCount.textContent = entries.length;

  headerFieldsGrid.innerHTML = entries.map(([key, obj]) => {
    const value = obj && typeof obj === "object" && "value" in obj ? obj.value : obj;
    const confidence = obj && typeof obj === "object" && "confidence" in obj ? obj.confidence : null;
    const confPct = confidence !== null ? Math.round(confidence * 100) : null;
    const confClass = confPct === null ? 'confidence-none' : confPct >= 80 ? 'confidence-high' : confPct >= 50 ? 'confidence-medium' : 'confidence-low';

    const grpoVal = grpoValues[key] || "";
    const aiStr = formatValue(value);
    const matchStatus = getMatchStatus(grpoVal, aiStr);
    const cardClass = matchStatus === 'match' ? 'matched' : matchStatus === 'mismatch' ? 'mismatched' : '';

    return `
      <div class="zocr-field-card ${cardClass}" data-field="${key}">
        <div class="zocr-field-top">
          <span class="zocr-field-name">${key}</span>
          ${confPct !== null ? `<span class="confidence-badge ${confClass}" title="Confidence: ${confPct}%">${confPct}%</span>` : ''}
        </div>
        <div class="zocr-value-row">
          <div class="value-source-label grpo">GRPO Value</div>
          <input class="grpo-input" data-field="${key}" value="${escapeAttr(grpoVal)}" placeholder="Enter GRPO value..." />
        </div>
        <div class="zocr-value-row">
          <div class="value-source-label ai-ocr">AI OCR Value</div>
          <div class="ai-ocr-value">${aiStr}</div>
        </div>
        <div class="match-indicator ${matchStatus}">
          ${matchStatus === 'match' ? '✓ Match' : matchStatus === 'mismatch' ? '✗ Mismatch' : '— Enter GRPO value'}
        </div>
      </div>
    `;
  }).join("");

  // Attach input listeners
  headerFieldsGrid.querySelectorAll(".grpo-input").forEach(input => {
    input.addEventListener("input", (e) => {
      const fieldName = e.target.dataset.field;
      grpoValues[fieldName] = e.target.value;

      // Re-evaluate card status
      const card = e.target.closest(".zocr-field-card");
      const aiValueEl = card.querySelector(".ai-ocr-value");
      const aiStr = aiValueEl.textContent;
      const matchStatus = getMatchStatus(e.target.value, aiStr);

      card.className = `zocr-field-card ${matchStatus === 'match' ? 'matched' : matchStatus === 'mismatch' ? 'mismatched' : ''}`;

      const indicator = card.querySelector(".match-indicator");
      indicator.className = `match-indicator ${matchStatus}`;
      indicator.textContent = matchStatus === 'match' ? '✓ Match' : matchStatus === 'mismatch' ? '✗ Mismatch' : '— Enter GRPO value';

      // Update summary stats
      updateSummaryStats(header);
    });
  });
}

function updateSummaryStats(header) {
  const totalFields = Object.keys(header).length;
  const filledCount = Object.keys(header).filter(k => grpoValues[k] && grpoValues[k].trim() !== "").length;
  const matchedCount = countMatches(header);
  const mismatchedCount = filledCount - matchedCount;

  const matchedEl = document.getElementById("matchedCount");
  const mismatchedEl = document.getElementById("mismatchedCount");
  if (matchedEl) matchedEl.textContent = matchedCount;
  if (mismatchedEl) mismatchedEl.textContent = mismatchedCount;
}

// Render Line Items
function renderLineItems(lines) {
  lineItemCount.textContent = lines.length;

  if (lines.length === 0) {
    lineItemsContainer.innerHTML = '<p style="color: var(--sapContent_LabelColor); padding: 1rem;">No line items found in extraction.</p>';
    return;
  }

  lineItemsContainer.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th colspan="4" class="col-group-header grpo-group">GRPO VALUES</th>
          <th colspan="4" class="col-group-header ai-group">AI OCR EXTRACTED</th>
          <th rowspan="2" style="background: var(--sapList_HeaderBackground, #f5f6f7); vertical-align: bottom; text-align: center; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--sapContent_LabelColor); font-weight:600; padding:0.5rem;">Conf.</th>
        </tr>
        <tr>
          <th class="grpo-col">Description</th>
          <th class="grpo-col">Qty</th>
          <th class="grpo-col">Unit Price</th>
          <th class="grpo-col">Net Amount</th>
          <th class="ai-col">Description</th>
          <th class="ai-col">Qty</th>
          <th class="ai-col">Unit Price</th>
          <th class="ai-col">Net Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map((item, idx) => {
          const desc = item.description?.value ?? item.description ?? "";
          const qty = item.quantity?.value ?? item.quantity ?? "";
          const unitP = item.unitPrice?.value ?? item.unitPrice ?? "";
          const netA = item.netAmount?.value ?? item.netAmount ?? "";

          // Average confidence
          const confs = [item.description?.confidence, item.quantity?.confidence, item.unitPrice?.confidence, item.netAmount?.confidence].filter(c => c !== undefined);
          const avgConf = confs.length > 0 ? Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 100) : null;
          const confClass = avgConf === null ? 'confidence-none' : avgConf >= 80 ? 'confidence-high' : avgConf >= 50 ? 'confidence-medium' : 'confidence-low';

          return `
            <tr>
              <td class="grpo-cell"><input class="grpo-table-input" data-row="${idx}" data-col="description" value="${escapeAttr(grpoLineItems[idx]?.description || '')}" placeholder="—" /></td>
              <td class="grpo-cell"><input class="grpo-table-input" data-row="${idx}" data-col="quantity" value="${escapeAttr(grpoLineItems[idx]?.quantity || '')}" placeholder="—" style="width:60px" /></td>
              <td class="grpo-cell"><input class="grpo-table-input" data-row="${idx}" data-col="unitPrice" value="${escapeAttr(grpoLineItems[idx]?.unitPrice || '')}" placeholder="—" style="width:80px" /></td>
              <td class="grpo-cell"><input class="grpo-table-input" data-row="${idx}" data-col="netAmount" value="${escapeAttr(grpoLineItems[idx]?.netAmount || '')}" placeholder="—" style="width:80px" /></td>
              <td class="ai-cell">${formatValue(desc)}</td>
              <td class="ai-cell">${formatValue(qty)}</td>
              <td class="ai-cell">${formatValue(unitP)}</td>
              <td class="ai-cell">${formatValue(netA)}</td>
              <td style="text-align:center">
              ${(() => {
                const pct = rowMatchPercent(grpoLineItems[idx] || {}, item);
                if (pct === null) {
                  const confs = ['description','quantity','unitPrice','netAmount'].map(c => item[c]?.confidence).filter(c => c !== undefined);
                  const aiPct = confs.length > 0 ? Math.round(confs.reduce((a,b)=>a+b,0)/confs.length*100) : null;
                  const cls = aiPct === null ? 'confidence-none' : aiPct >= 80 ? 'confidence-high' : aiPct >= 50 ? 'confidence-medium' : 'confidence-low';
                  return aiPct !== null ? `<span class="confidence-badge ${cls}" title="AI confidence: ${aiPct}%">${aiPct}%</span>` : '<span>—</span>';
                }
                const cls = confClassFromPct(pct);
                return `<span class="confidence-badge ${cls}" title="Match: ${pct}%">${pct}%</span>`;
              })()}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;

  // Attach listeners for line item GRPO inputs
  lineItemsContainer.querySelectorAll(".grpo-table-input").forEach(input => {
    input.addEventListener("input", (e) => {
      const row = parseInt(e.target.dataset.row);
      const col = e.target.dataset.col;
      if (grpoLineItems[row]) {
        grpoLineItems[row][col] = e.target.value;
      }
      // Update just this row's confidence cell without re-rendering
      const tr = e.target.closest('tr');
      if (tr) {
        const pct = rowMatchPercent(grpoLineItems[row] || {}, lines[row]);
        const confTd = tr.querySelector('td:last-child');
        if (confTd) {
          if (pct === null) {
            const confs = ['description','quantity','unitPrice','netAmount'].map(c => lines[row]?.[c]?.confidence).filter(c => c !== undefined);
            const aiPct = confs.length > 0 ? Math.round(confs.reduce((a,b)=>a+b,0)/confs.length*100) : null;
            const cls = aiPct === null ? 'confidence-none' : aiPct >= 80 ? 'confidence-high' : aiPct >= 50 ? 'confidence-medium' : 'confidence-low';
            confTd.innerHTML = aiPct !== null ? `<span class="confidence-badge ${cls}" title="AI confidence: ${aiPct}%">${aiPct}%</span>` : '<span>—</span>';
          } else {
            const cls = confClassFromPct(pct);
            confTd.innerHTML = `<span class="confidence-badge ${cls}" title="Match: ${pct}%">${pct}%</span>`;
          }
        }
      }
    });
  });
}

// Helpers
function getMatchStatus(grpoVal, aiVal) {
  if (!grpoVal || grpoVal.trim() === "") return "empty";
  return normalizeForCompare(grpoVal) === normalizeForCompare(aiVal) ? "match" : "mismatch";
}

function formatValue(val) {
  if (val == null) return "—";
  if (typeof val === "object") return JSON.stringify(val);
  if (typeof val === "number") return val.toFixed(3);
  return String(val);
}


function parseNum(v) {
  if (v == null) return NaN;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function lineMatchPercent(grpo, ocr, col) {
  const isNum = ['quantity','unitPrice','netAmount'].includes(col);
  if (isNum) {
    const g = parseNum(grpo), o = parseNum(ocr);
    if (!Number.isFinite(g) || !Number.isFinite(o)) return 0;
    if (o === 0 && g === 0) return 100;
    if (o === 0) return 0;
    const pct = 100 - (Math.abs(g - o) / Math.abs(o)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }
  const a = normalizeForCompare(grpo), b = normalizeForCompare(ocr);
  return a && b && a === b ? 100 : 0;
}

function rowMatchPercent(grpoRow, aiRow) {
  const cols = ['description','quantity','unitPrice','netAmount'];
  const filled = cols.filter(c => grpoRow?.[c] != null && String(grpoRow[c]).trim() !== '');
  if (filled.length === 0) return null; // no GRPO data entered
  const vals = filled.map(c => lineMatchPercent(grpoRow[c], aiRow?.[c]?.value ?? aiRow?.[c], c));
  return Math.round(vals.reduce((x,y)=>x+y,0) / vals.length);
}

function confClassFromPct(p) {
  if (p >= 80) return 'confidence-high';
  if (p >= 50) return 'confidence-medium';
  return 'confidence-low';
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Clear Button
function renderClearButton(header, lines) {
  let btn = document.getElementById("clearGrpoBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "clearGrpoBtn";
    btn.textContent = "Clear GRPO Values";
    btn.style.cssText = "margin: 1rem auto; display: block; padding: 0.5rem 1.5rem; background: var(--sapNegativeColor, #bb0000); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;";
    const card = document.getElementById("lineItemsCard");
    if (card) card.after(btn);
  }
  btn.onclick = () => {
    if (!confirm("Clear all GRPO values?")) return;
    grpoValues = {};
    grpoLineItems = grpoLineItems.map(() => ({ description: "", quantity: "", unitPrice: "", netAmount: "" }));
    renderHeaderFields(header);
    renderLineItems(lines);
    renderSummaryStats(header);
    renderClearButton(header, lines);
  };
}

// Auto-refresh when new extraction is saved from Extract tab
window.addEventListener("storage", (e) => {
  if (e.key === "documentAI_lastExtraction" && e.newValue) {
    grpoValues = {};
    grpoLineItems = [];
    init();
  }
});

// Boot
init();
