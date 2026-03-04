# 확률과 통계 웹앱 — 작업 계획서

> **작성일**: 2026-03-03
> **기준 문서**: `업무_인수_인계서.md` (2026-03-03)
> **사이트**: https://math-class.it.kr/
> **저장소**: https://github.com/DongEonLee741/Math-high-PS

---

## 0. 현재 상태 분석 (코드 리뷰 결과)

### 0.1 완료 확인된 구현 사항

| 항목 | 파일 | 상태 |
|------|------|------|
| Firebase Auth 로그인 오버레이 | `index.html` (L302~L314) | 구현 완료 |
| 이메일 기반 역할 판별 | `index.html` L473~L475 (`TEACHER_EMAILS`) | 구현 완료 |
| CSS 기반 역할별 UI | `index.html` L186~L193 | 구현 완료 |
| Drive OAuth 체인 (Firebase → Apps Script redirect) | `index.html` L531~L534 | 구현 완료 |
| sessionStorage 세션 관리 | `index.html` L454~L461 | 구현 완료 |
| 학습지 링크에 driveEmail/class 전달 | `index.html` L612~L627 | 구현 완료 |
| Code.gs 계층 폴더 구조 | `plan/apps-script/Code.gs` L25~L56 | 코드 작성 완료 |
| 6개 학습지에 getDriveKey() 추가 | 각 학습지 HTML | 구현 완료 |
| 6개 학습지에 DriveSync 모듈 내장 | 각 학습지 HTML (L1658~) | 구현 완료 |
| Firebase Hosting 배포 | 커밋 `06a4ed0` | 배포 완료 |
| authDomain 수정 | `firebaseapp.com` 사용 | 수정 완료 |

### 0.2 발견된 문제점 및 불일치

#### P1. Code.gs 배포 상태 불확실 (심각)
- `plan/apps-script/Code.gs`에는 계층 폴더 코드 (`parseKey`, `getOrCreateFolderByPath`)가 작성됨
- 그러나 이 코드가 **실제 Apps Script 프로젝트에 반영되었는지 확인 불가**
- 현재 APPS_SCRIPT_URL (`AKfycbx4a...`)이 가리키는 배포 버전이 구 버전(단일 폴더)인지 신 버전(계층 폴더)인지 불명
- Login.html, Callback.html도 실제 Apps Script 프로젝트에 추가되었는지 확인 필요

#### P2. 로그인 및 인증 흐름 미테스트 (심각)
- Firebase Auth 로그인이 실제 사이트에서 동작하는지 한 번도 확인되지 않음
- `redirect_uri_mismatch` 오류 발생 가능성 존재
  - Google Cloud Console에서 승인된 JS 원본에 `https://math-class.it.kr` 누락 가능
  - 승인된 리디렉션 URI 확인 필요
- Drive OAuth 체인 (Firebase Auth → Apps Script → 복귀) 전체 흐름 미검증

#### P3. plan.md와 Code.gs 버전 불일치
- 기존 `plan.md`(현재 파일 이전 버전)의 Code.gs는 **구 버전** (단일 폴더 `getOrCreateFolder`)
- `plan/apps-script/Code.gs`는 **신 버전** (계층 폴더 `parseKey` + `getOrCreateFolderByPath`)
- 학습지의 DriveSync 모듈은 이미 `getDriveKey()`를 사용하므로 신 버전 Code.gs가 배포되어야 정상 동작

#### P4. Git 커밋 상태 불완전
- `1단원/콘텐츠 라이브러리/` 파일 3개가 삭제(D) 상태이나 커밋 안 됨
- `plan/` 디렉토리의 여러 파일이 untracked 상태 (plan.md, 업무_인수_인계서.md, Login.html, Callback.html 등)
- 교과 진도표 xlsx, 지도서 PDF 등도 untracked

#### P5. 슬라이드 파일 경로 오류 가능성
- `index.html`의 슬라이드 링크가 `1단원/학습지/` 폴더를 가리킴 (예: `1단원/학습지/2차시_중복순열_슬라이드.html`)
- 인수인계서에는 `1단원/슬라이드/` 경로로 기술되어 있으나, 실제 파일 시스템에서는 `1단원/학습지/` 폴더 안에 슬라이드 파일이 함께 존재
- 실제 배포 시 링크가 정상 동작하는지 확인 필요

---

## 1. 작업 우선순위

### Phase 1: 핵심 기능 검증 (즉시 필요)

#### 1-1. 라이브 사이트 접속 및 로그인 테스트
- [ ] https://math-class.it.kr/ 접속하여 페이지 로드 확인
- [ ] 로그인 오버레이가 정상 표시되는지 확인
- [ ] Google 로그인 버튼 클릭 → Firebase Auth 팝업 동작 확인
- [ ] `redirect_uri_mismatch` 오류 발생 시 대응 방안:
  - Google Cloud Console → API 및 서비스 → 사용자 인증 정보
  - "Web client (auto created by Google Service)" 클릭
  - 승인된 JS 원본에 `https://math-class.it.kr` 추가
  - 승인된 리디렉션 URI에 `https://math-class.it.kr/__/auth/handler` 확인

#### 1-2. 역할 기반 UI 테스트
- [ ] `roal2745@gmail.com`으로 로그인 → "교사" 뱃지 + 슬라이드 링크 표시 확인
- [ ] 다른 계정으로 로그인 → "학생" 뱃지 + 학습지만 표시 확인
- [ ] 로그아웃 → 로그인 오버레이 재표시 확인

#### 1-3. Drive OAuth 체인 테스트
- [ ] Firebase 로그인 성공 후 → Apps Script URL로 자동 redirect 되는지 확인
- [ ] Apps Script Login.html 페이지가 표시되는지 확인
  - 만약 표시되지 않으면: Code.gs에 Login.html이 배포되지 않은 것 → P1 문제
- [ ] "학습지로 돌아가기" 클릭 → index.html로 복귀 + `?driveEmail=` 파라미터 전달 확인
- [ ] sessionStorage에 `driveSync_email` 값이 저장되었는지 확인

### Phase 2: Apps Script 배포 확인/재배포

#### 2-1. 현재 Apps Script 배포 상태 확인
- [ ] Apps Script 에디터 열기 (https://script.google.com)
- [ ] 프로젝트 "확률과통계 학습지 Drive 연동" 찾기
- [ ] 현재 Code.gs 내용이 구 버전(단일 폴더)인지 신 버전(계층 폴더)인지 확인
- [ ] Login.html, Callback.html 파일이 존재하는지 확인

#### 2-2. Code.gs 재배포 (필요 시)
- [ ] `plan/apps-script/Code.gs` 내용을 실제 Apps Script 프로젝트에 복사
- [ ] `plan/apps-script/Login.html` 내용 복사 (없다면 새 HTML 파일 생성)
- [ ] `plan/apps-script/Callback.html` 내용 복사 (없다면 새 HTML 파일 생성)
- [ ] 새 배포 생성 (웹 앱, 실행 주체: 웹앱에 액세스하는 사용자)
- [ ] ⚠️ 배포 URL이 변경되면:
  - `index.html`의 `APPS_SCRIPT_URL` 업데이트
  - 6개 학습지 HTML의 `APPS_SCRIPT_URL` 업데이트
  - git commit + push (자동 배포 트리거)

### Phase 3: 학습지 DriveSync 통합 테스트

#### 3-1. 학습지 진입 및 DriveSync 테스트
- [ ] index.html에서 학습지 카드 클릭 → 학습지 페이지 진입
- [ ] URL에 `?driveEmail=` 파라미터가 전달되었는지 확인
- [ ] DriveSync 모듈이 초기화되고 로그인 상태를 올바르게 감지하는지 확인
- [ ] 학습지 필기 후 저장 → localStorage + Drive 이중 저장 동작 확인
- [ ] Drive에서 불러오기 → 캔버스 데이터 복원 확인
- [ ] 학생의 Google Drive에 `확률과통계/1단원_순열과조합/` 폴더가 생성되었는지 확인

#### 3-2. 6개 학습지 전체 테스트
- [ ] 2차시_중복순열_학습지.html — DriveSync 동작
- [ ] 3차시_같은것이있는순열_학습지.html — DriveSync 동작
- [ ] 4차시_스스로확인하기_학습지.html — DriveSync 동작
- [ ] 6차시_중복조합_학습지.html — DriveSync 동작
- [ ] 7차시_스스로확인하기_중복조합_학습지.html — DriveSync 동작
- [ ] 9차시_이항정리_학습지.html — DriveSync 동작

### Phase 4: iPad Safari 호환성 테스트

#### 4-1. iPad 환경 테스트
- [ ] iPad Safari에서 로그인 팝업 차단 시 redirect fallback 동작 확인
- [ ] 3자 쿠키 차단(ITP)으로 인한 Apps Script 세션 유지 문제 확인
- [ ] 학습지 필기(Apple Pencil + Canvas) 정상 동작 확인
- [ ] Drive 저장/불러오기가 iPad에서도 동작하는지 확인

### Phase 5: 코드 정리 및 Git 관리

#### 5-1. 불필요 파일 정리
- [ ] `1단원/콘텐츠 라이브러리/` 삭제 상태를 커밋에 반영할지 판단
- [ ] `1단원/학습지/3차시_backup.html` — 백업 파일 제거 여부 판단
- [ ] `1단원/학습지/fix_2.py`, `fix_4.py`, `transform_slide.ps1` — 유틸리티 스크립트 정리

#### 5-2. plan 파일 정리
- [ ] 기존 plan.md (구 버전 — 975줄) 대체 완료 (이 파일)
- [ ] 업무_인수_인계서.md 보존 (세션 간 인수인계 문서)
- [ ] apps-script/ 디렉토리 유지 (배포 참조용)

#### 5-3. Git 커밋 정리
- [ ] 변경 사항 리뷰 후 의미 있는 단위로 커밋
- [ ] firebase.json의 ignore 규칙과 실제 파일 구조 일치 여부 확인

### Phase 6: 향후 과제 (이번 세션 범위 밖)

#### 6-1. 2단원/3단원 학습지 추가
- 현재 2단원, 3단원은 PDF 자료만 있음
- 학습지/슬라이드 HTML 제작 시 DriveSync 모듈 기본 포함

#### 6-2. 교사용 학생 현황 모니터링 강화
- Firestore 기반 실시간 현황 모니터링 (기존 기능)
- DriveSync 저장 현황과 연동 가능 여부 검토

---

## 2. 이번 세션에서 실행할 작업 (구체적 순서)

### Step 1: 라이브 사이트 기능 테스트
1. 브라우저에서 https://math-class.it.kr/ 접속
2. 개발자 도구 콘솔 확인 (에러 여부)
3. 로그인 버튼 동작 확인
4. 오류 발생 시 원인 분석 및 수정

### Step 2: Apps Script 배포 상태 확인
1. `APPS_SCRIPT_URL`에 직접 접속하여 응답 확인
   - `?action=profile` → 로그인 필요 응답 또는 로그인 유도
   - 404/오류 → 배포 문제
2. 필요 시 Code.gs + Login.html + Callback.html 재배포 안내

### Step 3: 발견된 버그 수정
1. 오류에 따라 `index.html` 수정
2. 학습지 HTML 수정 (필요 시)
3. git commit + push (자동 배포)

### Step 4: 전체 흐름 E2E 테스트
1. 로그인 → 역할 표시 → 학습지 진입 → 필기 → 저장 → 불러오기
2. 테스트 결과를 이 문서에 기록

---

## 3. 리스크 및 차단 요소

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| Google Cloud Console OAuth 설정 미비 | 높음 (로그인 불가) | 승인된 JS 원본/리디렉션 URI 추가 |
| Apps Script 미배포/구 버전 | 높음 (Drive 저장 불가) | Code.gs 재배포 (사용자가 수동 수행) |
| iPad Safari 팝업 차단 | 중간 | redirect fallback 이미 구현됨, 실제 테스트 필요 |
| Education 계정 관리자 제한 | 중간 | script.google.com 도메인 허용 요청 |
| ITP(3자 쿠키 차단)로 세션 유실 | 낮음 | 첫 방문 시 직접 Apps Script 웹앱 접속으로 1자 쿠키 생성 |

---

## 4. 테스트 결과 기록

### 4.1 라이브 사이트 테스트
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 페이지 로드 | | |
| 로그인 오버레이 표시 | | |
| Google 로그인 (팝업) | | |
| 교사 역할 표시 | | |
| 학생 역할 표시 | | |
| Drive OAuth 체인 | | |
| 학습지 링크 이동 | | |
| DriveSync 저장 | | |
| DriveSync 불러오기 | | |

### 4.2 발견된 버그
(테스트 후 기록)

### 4.3 수정 사항
(버그 수정 후 기록)

---

## 5. 참고: 핵심 설정값

| 항목 | 값 |
|------|---|
| Firebase 프로젝트 | `math-high-cm1` |
| authDomain | `math-class.it.kr` |
| 사이트 URL | `https://math-class.it.kr/` |
| Apps Script URL | `AKfycbx4a1O3vjFC1O4V0b-teADBC9SkNSB8nW2WyKxdoe-yODQW33M8l8IGi2o1qhAvPWnx` |
| 교사 이메일 | `roal2745@gmail.com` |
| GitHub Remote | `https://github.com/DongEonLee741/Math-high-PS.git` |
| 최신 커밋 | `06a4ed0` (authDomain 수정) |
