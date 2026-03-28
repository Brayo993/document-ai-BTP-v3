from pathlib import Path

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# 1. Insert helper functions before escapeAttr
helpers = """
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
  const vals = cols.map(c => lineMatchPercent(grpoRow?.[c], aiRow?.[c]?.value ?? aiRow?.[c], c));
  return Math.round(vals.reduce((x,y)=>x+y,0) / vals.length);
}

function confClassFromPct(p) {
  if (p >= 80) return 'confidence-high';
  if (p >= 50) return 'confidence-medium';
  return 'confidence-low';
}
"""

if "function lineMatchPercent(" not in s:
    s = s.replace("function escapeAttr(str) {", helpers + "\nfunction escapeAttr(str) {")
    print("Inserted helper functions")
else:
    print("Helpers already present, skipping")

# 2. Replace the static confidence cell with dynamic match %
old_cell = """<td style="text-align:center"><span class="confidence-badge ${confClass}" title="Avg confidence: ${avgConf}%">${avgConf !== null ? avgConf + '%' : '\u2014'}</span></td>"""

new_cell = """<td style="text-align:center">
              ${(() => {
                const pct = rowMatchPercent(grpoLineItems[idx] || {}, item);
                const cls = confClassFromPct(pct);
                return `<span class="confidence-badge ${cls}" title="Match: ${pct}%">${pct}%</span>`;
              })()}
              </td>"""

if old_cell in s:
    s = s.replace(old_cell, new_cell)
    print("Replaced confidence cell")
else:
    print("ERROR: confidence cell not found - check exact string")

# 3. Refresh row on input change
old_listener = """      if (grpoLineItems[row]) {
        grpoLineItems[row][col] = e.target.value;
      }
    });"""
new_listener = """      if (grpoLineItems[row]) {
        grpoLineItems[row][col] = e.target.value;
      }
      renderLineItems(lines);
    });"""

if old_listener in s:
    s = s.replace(old_listener, new_listener)
    print("Updated input listener")
else:
    print("WARNING: input listener not found")

p.write_text(s, encoding="utf-8")
print("Done writing webapp/zocr-match.js")
