from pathlib import Path

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# Replace the Clear button with a proper refresh on storage change
old_boot = """// Boot
init();"""

new_boot = """// Auto-refresh when new extraction is saved from Extract tab
window.addEventListener("storage", (e) => {
  if (e.key === "documentAI_lastExtraction" && e.newValue) {
    grpoValues = {};
    grpoLineItems = [];
    init();
  }
});

// Boot
init();"""

if old_boot in s:
    s = s.replace(old_boot, new_boot)
    print("Added storage event listener for auto-refresh")
else:
    print("ERROR: Boot comment not found")

p.write_text(s, encoding="utf-8")
print("Done")
