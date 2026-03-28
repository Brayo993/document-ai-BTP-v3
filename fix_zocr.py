from pathlib import Path

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# Fix 1: When GRPO row is empty, show AI confidence instead of 0%
old_row_pct = """function rowMatchPercent(grpoRow, aiRow) {
  const cols = ['description','quantity','unitPrice','netAmount'];
  const vals = cols.map(c => lineMatchPercent(grpoRow?.[c], aiRow?.[c]?.value ?? aiRow?.[c], c));
  return Math.round(vals.reduce((x,y)=>x+y,0) / vals.length);
}"""

new_row_pct = """function rowMatchPercent(grpoRow, aiRow) {
  const cols = ['description','quantity','unitPrice','netAmount'];
  const filled = cols.filter(c => grpoRow?.[c] != null && String(grpoRow[c]).trim() !== '');
  if (filled.length === 0) return null; // no GRPO data entered
  const vals = filled.map(c => lineMatchPercent(grpoRow[c], aiRow?.[c]?.value ?? aiRow?.[c], c));
  return Math.round(vals.reduce((x,y)=>x+y,0) / vals.length);
}"""

if old_row_pct in s:
    s = s.replace(old_row_pct, new_row_pct)
    print("Fixed rowMatchPercent for empty rows")
else:
    print("ERROR: rowMatchPercent not found")

# Fix 2: When pct is null (no GRPO), show AI confidence badge instead
old_cell = """<td style="text-align:center">
              ${(() => {
                const pct = rowMatchPercent(grpoLineItems[idx] || {}, item);
                const cls = confClassFromPct(pct);
                return `<span class="confidence-badge ${cls}" title="Match: ${pct}%">${pct}%</span>`;
              })()}
              </td>"""

new_cell = """<td style="text-align:center">
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
              </td>"""

if old_cell in s:
    s = s.replace(old_cell, new_cell)
    print("Fixed confidence cell for empty rows")
else:
    print("ERROR: confidence cell not found")

# Fix 3: Don't re-render the whole table on input (preserves typing)
# Instead just update the single cell
old_listener = """      if (grpoLineItems[row]) {
        grpoLineItems[row][col] = e.target.value;
      }
      renderLineItems(lines);
    });"""

new_listener = """      if (grpoLineItems[row]) {
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
    });"""

if old_listener in s:
    s = s.replace(old_listener, new_listener)
    print("Fixed input listener - no more full re-render")
else:
    print("ERROR: input listener not found")

p.write_text(s, encoding="utf-8")
print("Done")
