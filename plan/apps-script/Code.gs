/**
 * 확률과통계 학습지 — Google Drive 저장/불러오기 웹앱
 *
 * ═══════════════════════════════════════════════════════
 *  배포 설정 (반드시 아래대로 설정!)
 *    - 실행 주체 : "웹앱에 액세스하는 사용자"
 *    - 액세스   : "Google 계정이 있는 모든 사용자"
 * ═══════════════════════════════════════════════════════
 */

// ===== 설정 =====
var LEGACY_FOLDER_NAME = '확률과통계_학습지';  // 이전 버전 호환

// ===== 유틸리티 =====

/**
 * key를 경로 세그먼트와 파일명으로 파싱
 *
 * 새 형식: "확률과통계/1단원_순열과조합/2차시_중복순열"
 *   → folderPath: ["확률과통계", "1단원_순열과조합"], fileName: "2차시_중복순열"
 *
 * 구 형식: "worksheet_PS_2차시_중복순열"
 *   → folderPath: ["확률과통계_학습지"], fileName: "worksheet_PS_2차시_중복순열"
 */
function parseKey(key) {
  var parts = key.split('/');
  if (parts.length >= 2) {
    return {
      folderPath: parts.slice(0, -1),
      fileName: parts[parts.length - 1]
    };
  }
  // 구 형식 — 이전 단일 폴더에 저장
  return {
    folderPath: [LEGACY_FOLDER_NAME],
    fileName: key
  };
}

/**
 * 경로 배열을 따라 하위 폴더를 생성/탐색
 * 예: ["확률과통계", "1단원_순열과조합"] → Drive에 중첩 폴더 생성
 */
function getOrCreateFolderByPath(pathParts) {
  var current = DriveApp.getRootFolder();
  for (var i = 0; i < pathParts.length; i++) {
    var name = pathParts[i];
    var folders = current.getFoldersByName(name);
    if (folders.hasNext()) {
      current = folders.next();
    } else {
      current = current.createFolder(name);
    }
  }
  return current;
}

/**
 * (이전 호환) 학습지 전용 폴더를 가져오거나 없으면 생성
 */
function getOrCreateFolder() {
  return getOrCreateFolderByPath([LEGACY_FOLDER_NAME]);
}

/**
 * 폴더 내에서 파일명으로 파일 검색
 */
function findFileInFolder(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  }
  return null;
}

/**
 * JSON 응답 생성
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== GET 요청 처리 =====

/**
 * GET 요청 처리
 *
 * ?action=login                              → 로그인 페이지 (HTML)
 * ?action=login&returnUrl=...                → 로그인 후 돌아갈 URL
 * ?action=profile                            → 로그인한 사용자 정보 (JSON)
 * ?action=list                               → 저장된 학습지 목록 (JSON)
 * ?action=load&key=worksheet_PS_2차시_중복순열 → 특정 학습지 불러오기 (JSON)
 * ?action=callback                           → postMessage 콜백 페이지 (HTML)
 */
function doGet(e) {
  try {
    var action = e.parameter.action || '';

    // ── 로그인 페이지 ──
    if (action === 'login') {
      var template = HtmlService.createTemplateFromFile('Login');
      template.returnUrl = e.parameter.returnUrl || '';
      template.userEmail = Session.getActiveUser().getEmail() || '';
      return template.evaluate()
        .setTitle('학습지 로그인')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }

    // ── 콜백 페이지 (iframe/팝업용) ──
    if (action === 'callback') {
      var template = HtmlService.createTemplateFromFile('Callback');
      template.userEmail = Session.getActiveUser().getEmail() || '';
      return template.evaluate()
        .setTitle('로그인 완료')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // ── 사용자 프로필 조회 ──
    if (action === 'profile') {
      var email = Session.getActiveUser().getEmail();
      if (!email) {
        return createJsonResponse({ success: false, error: '로그인이 필요합니다' });
      }
      return createJsonResponse({
        success: true,
        email: email,
        name: email.split('@')[0]
      });
    }

    // ── 저장된 파일 목록 ──
    if (action === 'list') {
      var email = Session.getActiveUser().getEmail();
      if (!email) {
        return createJsonResponse({ success: false, error: '로그인이 필요합니다' });
      }

      // path 파라미터가 있으면 해당 경로 탐색, 없으면 레거시 폴더
      var pathParam = e.parameter.path;
      var folder;
      if (pathParam) {
        var pathParts = pathParam.split('/');
        folder = getOrCreateFolderByPath(pathParts);
      } else {
        folder = getOrCreateFolder();
      }

      var files = folder.getFiles();
      var fileList = [];

      while (files.hasNext()) {
        var file = files.next();
        var name = file.getName();
        if (name.indexOf('.json') === -1) continue;
        fileList.push({
          name: name.replace('.json', ''),
          lastUpdated: file.getLastUpdated().toISOString(),
          size: file.getSize()
        });
      }

      return createJsonResponse({ success: true, files: fileList });
    }

    // ── 특정 학습지 데이터 불러오기 ──
    if (action === 'load') {
      var email = Session.getActiveUser().getEmail();
      if (!email) {
        return createJsonResponse({ success: false, error: '로그인이 필요합니다' });
      }

      var key = e.parameter.key;
      if (!key) {
        return createJsonResponse({ success: false, error: 'key 파라미터가 필요합니다' });
      }

      var parsed = parseKey(key);
      var folder = getOrCreateFolderByPath(parsed.folderPath);
      var file = findFileInFolder(folder, parsed.fileName + '.json');

      if (!file) {
        return createJsonResponse({ success: false, error: '저장된 데이터가 없습니다' });
      }

      var content = file.getBlob().getDataAsString();
      return createJsonResponse({
        success: true,
        data: JSON.parse(content)
      });
    }

    // ── 알 수 없는 action ──
    return createJsonResponse({
      success: false,
      error: '알 수 없는 요청입니다. action: ' + action
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || String(error)
    });
  }
}

// ===== POST 요청 처리 =====

/**
 * POST 요청 처리
 *
 * Body (JSON):
 *   { "action": "save", "key": "worksheet_PS_2차시_중복순열", "data": { ... } }
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'save') {
      var email = Session.getActiveUser().getEmail();
      if (!email) {
        return createJsonResponse({ success: false, error: '로그인이 필요합니다' });
      }

      var key = body.key;
      var data = body.data;

      if (!key || !data) {
        return createJsonResponse({ success: false, error: 'key와 data가 필요합니다' });
      }

      var parsed = parseKey(key);
      var folder = getOrCreateFolderByPath(parsed.folderPath);
      var fileName = parsed.fileName + '.json';
      var content = JSON.stringify(data);

      // 기존 파일이 있으면 업데이트, 없으면 생성
      var existingFile = findFileInFolder(folder, fileName);
      if (existingFile) {
        existingFile.setContent(content);
      } else {
        folder.createFile(fileName, content, 'application/json');
      }

      return createJsonResponse({
        success: true,
        message: '저장 완료',
        fileName: fileName,
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      success: false,
      error: '알 수 없는 action: ' + action
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || String(error)
    });
  }
}
