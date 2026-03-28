from pathlib import Path

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# Find and print the lineMatchPercent function
start = s.find("function lineMatchPercent(")
if start == -1:
    print("NOT FOUND")
else:
    print(s[start:start+500])
