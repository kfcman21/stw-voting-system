# 개념기반 탐구학습 S-T-W 실시간 투표 시스템

개념기반 탐구학습 영상에 대한 S-T-W(SEE-THINK-WONDER) 활동의 실시간 투표 시스템입니다.

## 기능

- **실시간 투표**: Firebase Realtime Database를 통한 실시간 투표 결과 확인
- **순위별 투표**: 각 답변에 대해 1순위, 2순위, 3순위 투표 가능
- **실시간 결과 표시**: 투표 결과를 실시간으로 테이블 형태로 표시
- **관리자 기능**: 비밀번호(1004)로 관리자 로그인 후 투표 초기화 가능
- **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능

## Firebase 설정 방법

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "stw-voting-system")
4. Google Analytics 설정 (선택사항)
5. "프로젝트 만들기" 클릭

### 2. Realtime Database 설정

1. Firebase Console에서 "Realtime Database" 선택
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 선택: "테스트 모드에서 시작" 선택
4. 데이터베이스 위치 선택 (가까운 지역 선택)

### 3. 웹 앱 추가

1. Firebase Console에서 "프로젝트 개요" 옆의 설정 아이콘 클릭
2. "프로젝트 설정" 선택
3. "일반" 탭에서 "웹 앱 추가" 클릭
4. 앱 닉네임 입력 (예: "stw-voting-web")
5. "앱 등록" 클릭

### 4. 설정 정보 복사

Firebase 설정 정보를 복사하여 `script.js` 파일의 `firebaseConfig` 객체를 업데이트하세요:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 5. 보안 규칙 설정

Realtime Database의 "규칙" 탭에서 다음 규칙을 설정하세요:

```json
{
  "rules": {
    "votes": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 사용 방법

### 투표하기

1. 각 섹션(SEE, THINK, WONDER)에서 원하는 답변을 선택
2. 1순위, 2순위, 3순위 버튼 중 하나를 클릭하여 투표
3. 투표 결과는 실시간으로 하단에 표시됩니다

### 관리자 기능

1. 상단의 비밀번호 입력란에 "1004" 입력
2. "관리자 로그인" 버튼 클릭
3. "투표 초기화" 버튼이 나타나면 클릭하여 모든 투표 초기화

## 파일 구조

```
STW1/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일 파일
├── script.js           # JavaScript 로직 파일
└── README.md           # 이 파일
```

## 투표 시스템 구조

### 데이터 구조

```javascript
{
  "votes": {
    "see": {
      "1_1": 5,    // 1번 답변 1순위 5표
      "1_2": 3,    // 1번 답변 2순위 3표
      "1_3": 2,    // 1번 답변 3순위 2표
      // ... 기타 투표 데이터
    },
    "think": {
      // THINK 섹션 투표 데이터
    },
    "wonder": {
      // WONDER 섹션 투표 데이터
    }
  }
}
```

### 점수 계산 방식

- 1순위: 3점
- 2순위: 2점  
- 3순위: 1점

총점 = (1순위 투표수 × 3) + (2순위 투표수 × 2) + (3순위 투표수 × 1)

## 배포 방법

### 로컬 테스트

1. 모든 파일을 웹 서버에 업로드
2. 또는 로컬에서 Live Server 등의 도구 사용

### Firebase Hosting (권장)

1. Firebase CLI 설치:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase 로그인:
   ```bash
   firebase login
   ```

3. 프로젝트 초기화:
   ```bash
   firebase init hosting
   ```

4. 배포:
   ```bash
   firebase deploy
   ```

## 주의사항

- Firebase 설정 정보는 보안을 위해 환경 변수로 관리하는 것을 권장합니다
- 실제 운영 환경에서는 적절한 인증 및 권한 관리가 필요합니다
- 투표 데이터는 실시간으로 저장되므로 네트워크 연결이 필요합니다

## 기술 스택

- HTML5
- CSS3 (반응형 디자인)
- JavaScript (ES6+)
- Firebase Realtime Database
- Firebase Hosting (선택사항) 