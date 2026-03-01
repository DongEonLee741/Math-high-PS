$ErrorActionPreference = "Stop"
$srcPath = "C:\Users\82104\OneDrive\교과 운영 관련\2026\작업공간\확률과 통계\1단원\학습지\3차시_backup.html"
$dstPath = "C:\Users\82104\OneDrive\교과 운영 관련\2026\작업공간\확률과 통계\1단원\학습지\3차시_같은것이있는순열_슬라이드.html"

# Read ALL lines
$lines = [System.IO.File]::ReadAllLines($srcPath, [System.Text.Encoding]::UTF8)
Write-Host "Total lines read: $($lines.Count)"

# Build output as a list of strings
$out = New-Object System.Collections.Generic.List[string]

# === Part 1: Lines 1-6 (index 0-5) unchanged ===
for ($i = 0; $i -le 5; $i++) {
    $out.Add($lines[$i])
}

# === Fix title (line 7 = index 6) ===
$out.Add('    <title>같은 것이 있는 순열 — 수업 슬라이드</title>')

# === Lines 8-942 (index 7 to 941) unchanged ===
for ($i = 7; $i -le 941; $i++) {
    $out.Add($lines[$i])
}

# === Insert slide CSS before </style> on line 943 (index 942) ===
$slideCss = @'

/* ═══════════ SLIDE LAYOUT ═══════════ */
body { font-size: 18px; overflow: hidden; height: 100vh; height: 100dvh; background: #f0f2f5; }
.container { display: none; }
.slide-deck { width: 100vw; height: 100vh; height: 100dvh; position: relative; }
.slide {
    display: none; position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    justify-content: center; align-items: center;
    padding: 40px 60px 80px 60px;
}
.slide.active { display: flex; }
.slide-content {
    max-width: 900px; width: 100%; max-height: 100%;
    overflow-y: auto; -webkit-overflow-scrolling: touch;
    background: #fff; border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    padding: 32px 36px;
}
.title-slide {
    text-align: center; display: flex; flex-direction: column;
    justify-content: center; align-items: center; min-height: 400px;
}
.title-unit { background: #2c3e50; color: #fff; padding: 6px 24px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-bottom: 20px; }
.title-main { font-size: 28px; font-weight: 800; color: #2c3e50; margin-bottom: 16px; line-height: 1.4; }
.title-meta span { background: #f0f0f0; padding: 4px 14px; border-radius: 6px; font-size: 14px; color: #555; }
.title-achievement { margin-top: 24px; background: #eef3f8; border-left: 4px solid #2c3e50; padding: 12px 18px; border-radius: 0 8px 8px 0; font-size: 16px; text-align: left; max-width: 600px; }
.section-header-slide {
    text-align: center; display: flex; flex-direction: column;
    justify-content: center; align-items: center; min-height: 300px;
}
.section-header-slide .section-number {
    background: #2c3e50; color: #fff; width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 24px; margin-bottom: 16px;
}
.section-header-slide h2 { font-size: 26px; font-weight: 700; color: #2c3e50; }
.slide-nav {
    position: fixed; bottom: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 16px;
    background: rgba(44,62,80,0.9); padding: 8px 20px; border-radius: 30px;
    z-index: 100; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
}
.nav-btn {
    background: none; border: none; color: #fff;
    font-size: 18px; cursor: pointer; padding: 6px 12px; border-radius: 6px;
}
.nav-btn:hover { background: rgba(255,255,255,0.15); }
.nav-btn:disabled { opacity: 0.3; }
.slide-counter { color: #fff; font-size: 14px; font-weight: 600; min-width: 60px; text-align: center; }
.nav-fs { font-size: 16px; margin-left: 8px; }
.slide-progress { position: fixed; top: 0; left: 0; width: 100%; height: 4px; background: rgba(0,0,0,0.05); z-index: 100; }
.slide-progress-bar { height: 100%; background: #4a90d9; transition: width 0.3s ease; width: 0%; }
.answer-content { max-height: none !important; padding: 12px 14px !important; background: #f0f7ff; border: 1.5px solid #b3d4f0; border-radius: 8px; margin-top: 8px; display: block !important; }
.answer-toggle { display: none !important; }
.writing-area, .canvas-toolbar { display: none !important; }
.student-info, .save-actions, .global-answer-btn, .records-overlay { display: none !important; }
@media (max-width: 768px) {
    .slide { padding: 20px 16px 70px 16px; }
    .slide-content { padding: 20px 18px; border-radius: 12px; }
    body { font-size: 16px; }
    .title-main { font-size: 22px; }
}
'@

$out.Add($slideCss)

# === Line 943 (index 942): the </style> tag ===
$out.Add($lines[942])

# === Lines 944-956 (index 943-955): KaTeX CSS/JS + </head> ===
for ($i = 943; $i -le 955; $i++) {
    $out.Add($lines[$i])
}

# === Now extract content blocks from lines 957-1284 ===
# GridPathSim: lines 991-1090 (index 990-1089)
$gridPathSim = ""
for ($i = 990; $i -le 1089; $i++) {
    $gridPathSim += $lines[$i] + "`n"
}

# simSamePerm: lines 1092-1118 (index 1091-1117)
$simSamePerm = ""
for ($i = 1091; $i -le 1117; $i++) {
    $simSamePerm += $lines[$i] + "`n"
}

# concept-box highlight: lines 1120-1124 (index 1119-1123)
$conceptBox = ""
for ($i = 1119; $i -le 1123; $i++) {
    $conceptBox += $lines[$i] + "`n"
}

# simVisual1122: lines 1126-1150 (index 1125-1149)
$simVisual1122 = ""
for ($i = 1125; $i -le 1149; $i++) {
    $simVisual1122 += $lines[$i] + "`n"
}

# Problem 5: lines 1159-1173 (index 1158-1172)
$problem5 = ""
for ($i = 1158; $i -le 1172; $i++) {
    $problem5 += $lines[$i] + "`n"
}

# Example-box: lines 1175-1194 (index 1174-1193)
$exampleBox = ""
for ($i = 1174; $i -le 1193; $i++) {
    $exampleBox += $lines[$i] + "`n"
}

# Solution: lines 1196-1203 (index 1195-1202)
$solution = ""
for ($i = 1195; $i -le 1202; $i++) {
    $solution += $lines[$i] + "`n"
}

# simGridPath: lines 1205-1245 (index 1204-1244)
$simGridPathBlock = ""
for ($i = 1204; $i -le 1244; $i++) {
    $simGridPathBlock += $lines[$i] + "`n"
}

# Problem 6: lines 1249-1264 (index 1248-1263)
$problem6 = ""
for ($i = 1248; $i -le 1263; $i++) {
    $problem6 += $lines[$i] + "`n"
}

# === Extract StepSimulation class: lines 1698-1728 (index 1697-1727) ===
$stepSimClass = ""
for ($i = 1697; $i -le 1727; $i++) {
    $stepSimClass += $lines[$i] + "`n"
}

# === Extract GridPathSim IIFE: lines 1799-1960 (index 1798-1959) ===
$gridPathSimIIFE = ""
for ($i = 1798; $i -le 1959; $i++) {
    $gridPathSimIIFE += $lines[$i] + "`n"
}

# === Build new body ===
$newBody = @"
<body>

<div class="slide-deck" id="slideDeck">

<!-- Slide 0: 표지 -->
<div class="slide active">
    <div class="slide-content title-slide">
        <div class="title-unit">Ⅰ. 경우의 수</div>
        <div class="title-main">1. 여러 가지 순열 — 같은 것이 있는 순열</div>
        <div class="title-meta"><span>교과서 14~15쪽</span></div>
        <div class="title-achievement">성취기준: 여러 가지 순열의 수를 구할 수 있다.</div>
    </div>
</div>

<!-- Slide 1: 섹션 헤더 -->
<div class="slide">
    <div class="slide-content section-header-slide">
        <div class="section-number">1</div>
        <h2>같은 것이 있는 순열의 수는 어떻게 구할까?</h2>
    </div>
</div>

<!-- Slide 2: 격자 경로 시뮬레이션 -->
<div class="slide">
    <div class="slide-content">
$gridPathSim
    </div>
</div>

<!-- Slide 3: simSamePerm -->
<div class="slide">
    <div class="slide-content">
$simSamePerm
    </div>
</div>

<!-- Slide 4: 개념 정리 -->
<div class="slide">
    <div class="slide-content">
$conceptBox
    </div>
</div>

<!-- Slide 5: simVisual1122 -->
<div class="slide">
    <div class="slide-content">
$simVisual1122
    </div>
</div>

<!-- Slide 6: 섹션 헤더 2 -->
<div class="slide">
    <div class="slide-content section-header-slide">
        <div class="section-number">2</div>
        <h2>같은 것이 있는 순열의 활용</h2>
    </div>
</div>

<!-- Slide 7: 문제 5 -->
<div class="slide">
    <div class="slide-content">
$problem5
    </div>
</div>

<!-- Slide 8: 예제 2 + 풀이 -->
<div class="slide">
    <div class="slide-content">
$exampleBox

$solution
    </div>
</div>

<!-- Slide 9: simGridPath -->
<div class="slide">
    <div class="slide-content">
$simGridPathBlock
    </div>
</div>

<!-- Slide 10: 문제 6 -->
<div class="slide">
    <div class="slide-content">
$problem6
    </div>
</div>

</div><!-- /slide-deck -->

<!-- 네비게이션 -->
<div class="slide-nav">
    <button class="nav-btn" id="navPrev">&#9664;</button>
    <span class="slide-counter" id="slideCounter">1 / 11</span>
    <button class="nav-btn" id="navNext">&#9654;</button>
    <button class="nav-btn nav-fs" id="navFS" title="전체 화면">&#9974;</button>
</div>

<!-- 프로그레스 바 -->
<div class="slide-progress">
    <div class="slide-progress-bar" id="progressBar"></div>
</div>

<script>
// ── StepSimulation 클래스 ──
$stepSimClass

// ── StepSimulation 초기화 ──
var simSamePerm = new StepSimulation('simSamePerm');
var simVisual1122 = new StepSimulation('simVisual1122');
var simGridPath = new StepSimulation('simGridPath');

// ── 격자 경로 시뮬레이션 ──
$gridPathSimIIFE

// ── 슬라이드 네비게이션 ──
(function() {
    var deck = document.getElementById('slideDeck');
    var slides = deck.querySelectorAll('.slide');
    var total = slides.length;
    var current = 0;
    var counter = document.getElementById('slideCounter');
    var bar = document.getElementById('progressBar');
    var btnP = document.getElementById('navPrev');
    var btnN = document.getElementById('navNext');

    function show(i) {
        if (i < 0 || i >= total) return;
        slides[current].classList.remove('active');
        current = i;
        slides[current].classList.add('active');
        update();
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(slides[current], {
                delimiters: [
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ], throwOnError: false
            });
        }
    }

    function update() {
        counter.textContent = (current + 1) + ' / ' + total;
        bar.style.width = ((current + 1) / total * 100) + '%';
        btnP.disabled = (current === 0);
        btnN.disabled = (current === total - 1);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') { e.preventDefault(); show(current + 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); show(current - 1); }
        else if (e.key === 'Home') { e.preventDefault(); show(0); }
        else if (e.key === 'End') { e.preventDefault(); show(total - 1); }
        else if (e.key === 'f' || e.key === 'F') {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function(){});
            else document.exitFullscreen();
        }
        else if (e.key === 'Escape') {
            if (document.fullscreenElement) document.exitFullscreen();
        }
    });

    var sx = 0, sy = 0;
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.grid-path-sim, .step-simulation')) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - sx;
        var dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) show(current + 1);
            else show(current - 1);
        }
    }, { passive: true });

    btnP.addEventListener('click', function() { show(current - 1); });
    btnN.addEventListener('click', function() { show(current + 1); });
    document.getElementById('navFS').addEventListener('click', function() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function(){});
        else document.exitFullscreen();
    });

    update();
})();

// ── 이벤트 위임 (슬라이드 버전) ──
document.addEventListener('click', function(e) {
    var simBtn = e.target.closest('.sim-btn');
    if (simBtn) {
        e.preventDefault();
        var simId = simBtn.dataset.sim;
        var dir = simBtn.dataset.dir;
        var simInstance = window[simId];
        if (simInstance) {
            if (dir === 'next') simInstance.next();
            else if (dir === 'prev') simInstance.prev();
        }
    }
});

// ── KaTeX auto-render ──
if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
        delimiters: [
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false
    });
}
</script>

</body>
</html>
"@

# Add body lines
foreach ($line in $newBody.Split("`n")) {
    $out.Add($line)
}

# Write output with UTF-8 BOM-less encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($dstPath, $out.ToArray(), $utf8NoBom)

Write-Host "Done! Output file written to: $dstPath"
Write-Host "Total output lines: $($out.Count)"
