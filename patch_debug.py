from pathlib import Path
import re

p = Path(r"webapp/zocr-match.js")
s = p.read_text(encoding="utf-8")

# Check what the confidence cell actually looks like in the file
import re
matches = re.findall(r'<td style="text-align:center">.*?</td>', s, re.DOTALL)
for i, m in enumerate(matches[:5]):
    print(f"--- Match {i} ---")
    print(repr(m[:300]))
