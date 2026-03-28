from pathlib import Path

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# Add Clear All button after renderLineItems and renderSummaryStats calls in init()
old_init_end = """  renderHeaderFields(header);
  renderLineItems(lines);
  renderSummaryStats(header);
}"""

new_init_end = """  renderHeaderFields(header);
  renderLineItems(lines);
  renderSummaryStats(header);
  renderClearButton(header, lines);
}"""

if old_init_end in s:
    s = s.replace(old_init_end, new_init_end)
    print("Updated init()")
else:
    print("ERROR: init() end not found")

# Add renderClearButton function before the Boot comment
old_boot = """// Boot
init();"""

new_boot = """// Clear Button
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

// Boot
init();"""

if old_boot in s:
    s = s.replace(old_boot, new_boot)
    print("Added renderClearButton function")
else:
    print("ERROR: Boot comment not found")

p.write_text(s, encoding="utf-8")
print("Done")
