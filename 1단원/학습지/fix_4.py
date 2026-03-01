import os

path = r'C:\Users\82104\OneDrive\교과 운영 관련\2026\작업공간\확률과 통계\1단원\학습지\4차시_스스로확인하기_학습지.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# === 1. Fix problem headers: merge number + text into badge format ===
replacements = [
    # Problem 1
    ('<div class="problem-label">1</div>\n'
     '            <p>3\uac1c\uc758 \uc22b\uc790 0, 1, 2\uc5d0\uc11c \uc911\ubcf5\uc744 \ud5c8\uc6a9\ud558\uc5ec \ub9cc\ub4e4 \uc218 \uc788\ub294 \ub124 \uc790\ub9ac \uc790\uc5f0\uc218\uc758 \uac1c\uc218\ub97c \uad6c\ud558\uc2dc\uc624.</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 1</span> 3\uac1c\uc758 \uc22b\uc790 0, 1, 2\uc5d0\uc11c \uc911\ubcf5\uc744 \ud5c8\uc6a9\ud558\uc5ec \ub9cc\ub4e4 \uc218 \uc788\ub294 \ub124 \uc790\ub9ac \uc790\uc5f0\uc218\uc758 \uac1c\uc218\ub97c \uad6c\ud558\uc2dc\uc624.</div>'),
    # Problem 2
    ('<div class="problem-label">2</div>\n'
     '            <p>6\uba85\uc758 \ud559\uc0dd\uc774 \ucf54\ubbf8\ub514, \uc561\uc158, \uc2a4\ud3ec\uce20 \uc601\ud654 \uc911 \ud558\ub098\ub97c \uc120\ud0dd\ud558\uc5ec \uad00\ub78c\ud560 \ub54c, \uc601\ud654\ub97c \uc120\ud0dd\ud558\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624.</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 2</span> 6\uba85\uc758 \ud559\uc0dd\uc774 \ucf54\ubbf8\ub514, \uc561\uc158, \uc2a4\ud3ec\uce20 \uc601\ud654 \uc911 \ud558\ub098\ub97c \uc120\ud0dd\ud558\uc5ec \uad00\ub78c\ud560 \ub54c, \uc601\ud654\ub97c \uc120\ud0dd\ud558\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624.</div>'),
    # Problem 3
    ('<div class="problem-label">3</div>\n'
     '            <p>success\uc758 7\uac1c\uc758 \ubb38\uc790\ub97c \ubaa8\ub450 \uc77c\ub834\ub85c \ub098\uc5f4\ud560 \ub54c, \uc591 \ub05d\uc5d0 u\uc640 e\uac00 \uc624\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624.</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 3</span> success\uc758 7\uac1c\uc758 \ubb38\uc790\ub97c \ubaa8\ub450 \uc77c\ub834\ub85c \ub098\uc5f4\ud560 \ub54c, \uc591 \ub05d\uc5d0 u\uc640 e\uac00 \uc624\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624.</div>'),
    # Problem 4
    ('<div class="problem-label">4</div>\n'
     '            <p>\ub2e4\uc74c \uadf8\ub9bc\uacfc \uac19\uc774 A \uc9c0\uc810\uc5d0\uc11c B \uc9c0\uc810\uae4c\uc9c0 \ucd5c\ub2e8 \uac70\ub9ac\ub85c \uac00\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624. (\ub2e8, P, Q \uc9c0\uc810\uc744 \ubc18\ub4dc\uc2dc \uc9c0\ub09c\ub2e4.)</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 4</span> \ub2e4\uc74c \uadf8\ub9bc\uacfc \uac19\uc774 A \uc9c0\uc810\uc5d0\uc11c B \uc9c0\uc810\uae4c\uc9c0 \ucd5c\ub2e8 \uac70\ub9ac\ub85c \uac00\ub294 \uacbd\uc6b0\uc758 \uc218\ub97c \uad6c\ud558\uc2dc\uc624. (\ub2e8, P, Q \uc9c0\uc810\uc744 \ubc18\ub4dc\uc2dc \uc9c0\ub09c\ub2e4.)</div>'),
    # Problem 5 - has KaTeX inline
    ('<div class="problem-label">5</div>\n'
     '            <p>\\(X = \\{1, 2, 3\\}\\)\uc5d0\uc11c \\(Y = \\{a, b, c, d\\}\\)\ub85c\uc758 \ud568\uc218 \uc911 \ub2e4\uc74c\uc744 \uad6c\ud558\uc2dc\uc624.</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 5</span> \\(X = \\{1, 2, 3\\}\\)\uc5d0\uc11c \\(Y = \\{a, b, c, d\\}\\)\ub85c\uc758 \ud568\uc218 \uc911 \ub2e4\uc74c\uc744 \uad6c\ud558\uc2dc\uc624.</div>'),
    # Problem 6
    ('<div class="problem-label">6</div>\n'
     '            <p>\uc608\ub098\uc640 \uc218\ud638 \uc911 \ub204\uad6c\uc758 \ud480\uc774\uac00 \uc62e\uc740\uc9c0 \ud310\ub2e8\ud558\uace0, \uadf8 \uc774\uc720\ub97c \uc124\uba85\ud558\uc2dc\uc624.</p>',
     '<div class="problem-label"><span class="p-num">\ubb38\uc81c 6</span> \uc608\ub098\uc640 \uc218\ud638 \uc911 \ub204\uad6c\uc758 \ud480\uc774\uac00 \uc62e\uc740\uc9c0 \ud310\ub2e8\ud558\uace0, \uadf8 \uc774\uc720\ub97c \uc124\uba85\ud558\uc2dc\uc624.</div>'),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        num = new.split('</span>')[0].split('>')[-1]
        print(f"Fixed: {num}")
    else:
        num = old.split('>')[1].split('<')[0]
        print(f"NOT FOUND: problem {num}")

# === 2. Fix sub-problem numbers ===
# Replace wrong circled numbers
content = content.replace('\u2478', '\u2474')  # ⑱ -> ⑴
content = content.replace('\u2479', '\u2475')  # ⑲ -> ⑵
print(f"Fixed sub-problem numbers")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Done! Size: {os.path.getsize(path)}")
