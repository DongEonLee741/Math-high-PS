/**
 * 확률과통계 학습지 — Google Drive 저장/불러오기 웹앱 (v2)
 *
 * ═══════════════════════════════════════════════════════
 *  배포 설정 (반드시 아래대로 설정!)
 *    - 실행 주체 : "나" (스크립트 소유자)
 *    - 액세스   : "모든 사용자" (Google 로그인 없이)
 * ═══════════════════════════════════════════════════════
 *
 * v2 변경사항:
 *   - "Execute as: Me" 배포로 CORS 문제 해결
 *   - Session.getActiveUser() 대신 userEmail 파라미터로 학생 식별
 *   - 폴더 구조: 확률과통계/students/{email}/{단원}/{학습지}.json
 *   - Login.html, Callback.html 불필요 (Firebase Auth로 인증)
 */

// ===== 설정 =====
var ROOT_FOLDER_NAME = '확률과통계';
var STUDENTS_FOLDER_NAME = 'students';
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
  return {
    folderPath: [LEGACY_FOLDER_NAME],
    fileName: key
  };
}

/**
 * userEmail을 경로에 삽입하여 학생별 폴더 구조 생성
 *
 * 원래: ["확률과통계", "1단원_순열과조합"]
 * 변환: ["확률과통계", "students", "user@email.com", "1단원_순열과조합"]
 */
function parseKeyWithUser(key, userEmail) {
  var parsed = parseKey(key);
  if (parsed.folderPath.length >= 1 && parsed.folderPath[0] !== LEGACY_FOLDER_NAME) {
    var root = parsed.folderPath[0];
    var rest = parsed.folderPath.slice(1);
    parsed.folderPath = [root, STUDENTS_FOLDER_NAME, userEmail].concat(rest);
  } else {
    parsed.folderPath = [LEGACY_FOLDER_NAME, STUDENTS_FOLDER_NAME, userEmail];
  }
  return parsed;
}

/**
 * 경로 배열을 따라 하위 폴더를 생성/탐색
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

/**
 * 이메일 형식 기본 검증
 */
function isValidEmail(email) {
  return email && email.indexOf('@') > 0 && email.indexOf('.') > 0;
}

// ===== GET 요청 처리 =====

/**
 * GET 요청 처리
 *
 * ?action=profile&userEmail=...     → 사용자 정보 확인 (JSON)
 * ?action=list&userEmail=...        → 저장된 학습지 목록 (JSON)
 * ?action=load&key=...&userEmail=...→ 특정 학습지 불러오기 (JSON)
 */
function doGet(e) {
  try {
    var action = e.parameter.action || '';
    var userEmail = e.parameter.userEmail || '';

    // ── 사용자 프로필 확인 ──
    if (action === 'profile') {
      if (!isValidEmail(userEmail)) {
        return createJsonResponse({ success: false, error: 'userEmail 파라미터가 필요합니다' });
      }
      return createJsonResponse({
        success: true,
        email: userEmail,
        name: userEmail.split('@')[0]
      });
    }

    // ── 저장된 파일 목록 ──
    if (action === 'list') {
      if (!isValidEmail(userEmail)) {
        return createJsonResponse({ success: false, error: 'userEmail 파라미터가 필요합니다' });
      }

      var pathParam = e.parameter.path;
      var folder;
      if (pathParam) {
        var parsed = parseKeyWithUser(pathParam + '/_dummy', userEmail);
        folder = getOrCreateFolderByPath(parsed.folderPath);
      } else {
        folder = getOrCreateFolderByPath([ROOT_FOLDER_NAME, STUDENTS_FOLDER_NAME, userEmail]);
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
      if (!isValidEmail(userEmail)) {
        return createJsonResponse({ success: false, error: 'userEmail 파라미터가 필요합니다' });
      }

      var key = e.parameter.key;
      if (!key) {
        return createJsonResponse({ success: false, error: 'key 파라미터가 필요합니다' });
      }

      var parsed = parseKeyWithUser(key, userEmail);
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
 *   { "action": "save", "key": "확률과통계/1단원_순열과조합/2차시_중복순열", "userEmail": "student@email.com", "data": { ... } }
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'save') {
      var userEmail = body.userEmail;
      if (!isValidEmail(userEmail)) {
        return createJsonResponse({ success: false, error: 'userEmail이 필요합니다' });
      }

      var key = body.key;
      var data = body.data;

      if (!key || !data) {
        return createJsonResponse({ success: false, error: 'key와 data가 필요합니다' });
      }

      var parsed = parseKeyWithUser(key, userEmail);
      var folder = getOrCreateFolderByPath(parsed.folderPath);
      var fileName = parsed.fileName + '.json';
      var content = JSON.stringify(data);

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
        userEmail: userEmail,
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
