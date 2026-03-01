import os, re

path = r'C:\Users\82104\OneDrive\교과 운영 관련\2026\작업공간\확률과 통계\1단원\학습지\2차시_중복순열_학습지.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# === 1. Fix StepSimulation: const -> var ===
old = 'const simRepPerm = new StepSimulation'
new = 'var simRepPerm = new StepSimulation'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("[1] StepSimulation const->var OK")

# === 2. Fix Problem headers ===
problems = [
    ('1', '다음 중복순열의 수를 구하시오.'),
    ('2', '바이올린과 피아노 중 하나를 택하여 매일 하나의 악기만 연습하기로 할 때, 7일 동안의 연습 계획을 세우는 경우의 수를 구하시오.'),
    ('3', '0부터 9까지의 숫자를 사용하여 네 자리 비밀번호를 만들려고 한다.'),
    ('4', '5명의 학생이 방송반 또는 댄스반 중 하나에 가입하려고 한다.'),
]

for num, text in problems:
    old_block = (
        '<div class="problem-number">' + num + '</div>\n'
        '            <div class="problem-content">\n'
        '                <p>' + text + '</p>'
    )
    new_block = (
        '<div class="problem-label"><span class="p-num">\xeb\xac\xb8\xec\xa0\x9c '.encode().decode('utf-8', errors='replace')
    )
    # Use proper Korean
    new_block = '<div class="problem-label"><span class="p-num">\ubb38\uc81c ' + num + '</span> ' + text + '</div>'
    if old_block in content:
        content = content.replace(old_block, new_block)
        changes += 1
        print(f"[2] Problem {num} header OK")
    else:
        print(f"[2] Problem {num} header NOT FOUND")

# === 3. Fix sub-problems ===
for num_char in ['\u2474', '\u2475', '\u2476']:  # ⑴⑵⑶
    old_p = '<p style="margin-top:8px;">' + num_char + ' '
    new_div = '<div class="sub-problem"><span class="num">' + num_char + '</span> '
    count = content.count(old_p)
    if count > 0:
        content = content.replace(old_p, new_div)
        changes += count
        print(f"[3] Sub-problem {num_char} x{count} OK")

# Fix closing </p> for sub-problems that are now <div>
# Pattern: <div class="sub-problem">...</p>  ->  <div class="sub-problem">...</div>
content = re.sub(
    r'(<div class="sub-problem"><span class="num">.*?</span>[^<]*(?:<[^/][^>]*>[^<]*)*)</p>',
    r'\1</div>',
    content
)
print("[3] Sub-problem closing tags fixed")

# === 4. Remove .problem-content closing </div> ===
# After removing <div class="problem-content">, there are orphan </div> tags.
# They appear as the line "            </div>" just before "        </div>" (.problem close)
# Strategy: find each .problem closing pattern

# Count remaining problem-content opens (should be 0)
print(f"  .problem-content remaining: {content.count('<div class=' + chr(34) + 'problem-content' + chr(34) + '>')}")

# The orphan </div> is at 12-space indent, before 8-space indent .problem close
# Pattern: \n            </div>\n        </div>\n
# We need to selectively remove only the ones that were problem-content
# Since we removed 4 <div class="problem-content"> tags, there are 4 orphan </div>

# Better approach: remove "            </div>\n        </div>" and replace with "        </div>"
# But only for problem blocks.

# Let's look for the pattern after the last answer-reveal in each problem
# Pattern: ...answer-reveal close...</div>\n            </div>\n        </div>
# The answer-reveal close is "                </div>\n            </div>"
# Then orphan: "\n            </div>"
# Then .problem close: "\n        </div>"

# So the full pattern is: "</div>\n            </div>\n            </div>\n        </div>"
# (answer-content close, answer-reveal close, orphan problem-content close, problem close)
# Should become: "</div>\n            </div>\n        </div>"

orphan_pattern = '</div>\n            </div>\n            </div>\n        </div>'
fixed_pattern = '</div>\n            </div>\n        </div>'
orphan_count = content.count(orphan_pattern)
print(f"  Orphan pattern found: {orphan_count}")

if orphan_count > 0:
    content = content.replace(orphan_pattern, fixed_pattern)
    print(f"[4] Removed {orphan_count} orphan closing divs")

# Check if there are still orphans (different indentation)
# For problem 2 which has no sub-problems, the pattern might be different
orphan2 = '</div>\n                </div>\n            </div>\n        </div>'
# Hmm, let me just verify by looking at remaining div balance

# === 5. Remove Card 3 (FormulaFlipGrid) ===
card3_marker = '<div class="section-number">3</div>\n            <h2>'
card3_idx = content.find(card3_marker)
if card3_idx >= 0:
    # Find the start of the card div (go back to find <div class="card">)
    card_start = content.rfind('<div class="card">', 0, card3_idx)
    # Find the end of the card div (next </div> that closes the card)
    # The card structure is: <div class="card">...content...</div>
    # After the flip grid, the card closes with "    </div>"
    # Then comes the footer or next card

    # Find the closing </div> of the card
    # Look for "    </div>" after the formula-flip-grid
    flip_end = content.find('</div>\n    </div>', card3_idx)
    if flip_end >= 0:
        card_end = flip_end + len('</div>\n    </div>')
        removed = content[card_start:card_end]
        content = content[:card_start] + content[card_end:]
        print(f"[5] Card 3 removed ({len(removed)} chars)")
    else:
        print("[5] Card 3 end not found")
else:
    print("[5] Card 3 marker not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone! Changes: {changes}. Size: {os.path.getsize(path)}")
