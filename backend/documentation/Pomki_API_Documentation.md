# Pomki Backend API 문서

## 🍅 프로젝트 개요

**Pomki**는 포모도로 기법과 AI 기술을 결합한 스마트 학습 플랫폼입니다.

### 주요 기능
- 🍅 **포모도로 타이머**: 집중 세션과 휴식 관리
- 📝 **스마트 노트**: AI 기반 노트 정리 및 요약
- 🤖 **AI 연동**: 실시간 메모 → AI 요약 → 자동 노트 생성
- 📊 **학습 통계**: 학습 시간 및 성과 추적
- 🔄 **통합 워크플로우**: 포모도로 → 메모 → AI 정리 → 노트

---

## 🔧 기술 스택

- **Backend**: Spring Boot 3.x, Java 17
- **Database**: H2 (개발), MariaDB (운영)
- **Authentication**: JWT, OAuth2 (Google, Kakao)
- **AI Integration**: OpenAI GPT API
- **Cache**: Redis
- **Documentation**: Swagger/OpenAPI

---

## 🌐 Base URL

```
Development: http://localhost:8080/api
Production: https://api.pomki.io/api
```

---

## 🔐 인증 방식

### JWT Bearer Token
```http
Authorization: Bearer {accessToken}
```

### 토큰 획득
1. **일반 로그인**: `/auth/login`
2. **OAuth2 로그인**: `/auth/oauth2/{provider}`

---

## 📋 API 엔드포인트

### 1. 인증 관리 (Authentication)

#### POST /auth/signup
**일반 회원가입**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "학습자"
}
```

**Response:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다"
}
```

---

#### POST /auth/login
**로그인**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

### 2. 노트 관리 (Notes)

#### POST /notes
**노트 생성**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "noteTitle": "Spring Boot 학습 노트",
  "noteContent": "오늘 학습한 내용:\n- 자동 설정\n- REST API\n- JPA 연동"
}
```

**Response:**
```json
{
  "noteId": "uuid-string",
  "noteTitle": "Spring Boot 학습 노트",
  "noteContent": "오늘 학습한 내용:\n- 자동 설정\n- REST API\n- JPA 연동",
  "aiEnhanced": false,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

---

#### GET /notes
**노트 목록 조회**

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int): 페이지 번호 (기본값: 0)
- `size` (int): 페이지 크기 (기본값: 20)

**Response:**
```json
{
  "content": [
    {
      "noteId": "uuid-string",
      "noteTitle": "Spring Boot 학습 노트",
      "noteContent": "...",
      "aiEnhanced": false,
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 5,
  "totalPages": 1
}
```

---

#### GET /notes/{noteId}
**노트 상세 조회**

**Headers:** `Authorization: Bearer {token}`

**Response:** 단일 노트 객체

---

#### PUT /notes/{noteId}
**노트 수정**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "noteTitle": "Spring Boot 학습 노트 (수정됨)",
  "noteContent": "수정된 내용..."
}
```

---

#### DELETE /notes/{noteId}
**노트 삭제** (논리적 삭제)

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "노트가 삭제되었습니다"
}
```

---

### 3. AI 기능 (AI Services)

#### GET /ai/status
**AI 서비스 상태 확인**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "available": true,
  "message": "AI 기능이 사용 가능합니다"
}
```

---

#### POST /ai/polish-note
**노트 AI 폴리싱**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "noteId": "uuid-string",
  "style": "summary",
  "customPrompt": ""
}
```

**Style Options:**
- `summary`: 요약 정리
- `detail`: 상세 설명 추가
- `concept`: 핵심 개념 정리
- `clean`: 문법 교정

**Response:**
```json
{
  "noteId": "uuid-string",
  "originalContent": "원본 내용...",
  "polishedContent": "AI가 정리한 내용...",
  "style": "summary",
  "success": true,
  "message": "노트 폴리싱이 완료되었습니다"
}
```

---

#### POST /ai/apply-polish/{noteId}
**폴리싱 결과 적용**

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (폴리싱된 내용)
```json
"AI가 정리한 내용..."
```

---

### 4. 포모도로 타이머 (Pomodoro)

#### POST /pomodoro/quick-start
**빠른 포모도로 시작**

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `duration` (int): 시간(분) (기본값: 25)
- `goal` (string): 목표 (기본값: "집중 세션")

**Response:**
```json
{
  "sessionId": "uuid-string",
  "sessionType": "FOCUS",
  "plannedDuration": 25,
  "sessionStatus": "RUNNING",
  "sessionGoal": "Java 학습",
  "startedAt": "2024-01-15T10:30:00"
}
```

---

#### POST /pomodoro/sessions
**포모도로 세션 생성**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "sessionType": "FOCUS",
  "plannedDuration": 25,
  "sessionGoal": "Spring Boot 학습"
}
```

**Session Types:**
- `FOCUS`: 집중 세션
- `SHORT_BREAK`: 짧은 휴식 (5분)
- `LONG_BREAK`: 긴 휴식 (15분)

---

#### GET /pomodoro/current
**현재 진행 중인 세션 조회**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "sessionId": "uuid-string",
  "status": "RUNNING",
  "sessionType": "FOCUS",
  "plannedDuration": 25,
  "remainingTime": 1200,
  "startedAt": "2024-01-15T10:30:00",
  "sessionGoal": "Java 학습",
  "canAddNotes": true
}
```

---

#### PUT /pomodoro/sessions/{sessionId}/notes
**세션 메모 실시간 업데이트**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "sessionNotes": "학습 중인 내용:\n- Spring Boot 기초\n- REST API 설계\n- 데이터베이스 연동"
}
```

---

#### POST /pomodoro/sessions/{sessionId}/complete
**세션 완료**

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "actualDuration": 25,
  "sessionNotes": "오늘 학습한 내용...",
  "generateAiSummary": true
}
```

**Response:**
```json
{
  "sessionId": "uuid-string",
  "sessionStatus": "COMPLETED",
  "actualDuration": 25,
  "aiSummary": "AI가 생성한 요약...",
  "completedAt": "2024-01-15T10:55:00"
}
```

---

#### POST /pomodoro/sessions/{sessionId}/generate-note
**세션에서 노트 자동 생성**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "noteId": "new-uuid-string",
  "success": true,
  "message": "포모도로 세션에서 노트가 생성되었습니다"
}
```

---

#### GET /pomodoro/stats
**포모도로 통계**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "totalSessions": 15,
  "completedSessions": 12,
  "totalFocusTime": 300,
  "totalBreakTime": 45,
  "completionRate": 80.0,
  "todaySessions": 3,
  "todayFocusTime": 75
}
```

---

#### GET /pomodoro/cycle-suggestion
**다음 사이클 권장**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "recommendedType": "SHORT_BREAK",
  "recommendedDuration": 5,
  "message": "집중 세션을 완료했습니다! 5분 짧은 휴식을 권장합니다.",
  "todayCompletedSessions": 2,
  "todayFocusTime": 50
}
```

---

### 5. 학습 통계 (Statistics)

#### GET /simple-stats
**통합 학습 통계**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "todayStudy": {
    "focusTime": 75,
    "notesCreated": 2,
    "pomodoroSessions": 3
  },
  "weeklyStats": {
    "totalFocusTime": 420,
    "averageDailyFocus": 60,
    "notesCreated": 8
  },
  "totalStats": {
    "totalNotes": 25,
    "totalFocusTime": 1800,
    "totalSessions": 45
  }
}
```

---

## 🔄 통합 워크플로우

### 완전한 학습 세션 플로우

1. **포모도로 시작**
   ```http
   POST /pomodoro/quick-start?duration=25&goal=Java 학습
   ```

2. **실시간 메모 작성**
   ```http
   PUT /pomodoro/sessions/{sessionId}/notes
   ```

3. **세션 완료 (AI 요약 포함)**
   ```http
   POST /pomodoro/sessions/{sessionId}/complete
   ```

4. **AI 요약으로 노트 생성**
   ```http
   POST /pomodoro/sessions/{sessionId}/generate-note
   ```

5. **생성된 노트 확인**
   ```http
   GET /notes/{noteId}
   ```

6. **통계 확인**
   ```http
   GET /pomodoro/stats
   GET /simple-stats
   ```

---

## 🚨 오류 코드

### HTTP 상태 코드

| 코드 | 설명 | 예시 |
|------|------|------|
| 200 | 성공 | 정상 조회/수정 |
| 201 | 생성 성공 | 노트/세션 생성 |
| 400 | 잘못된 요청 | 유효성 검증 실패 |
| 401 | 인증 실패 | 토큰 없음/만료 |
| 403 | 권한 없음 | 다른 사용자 리소스 접근 |
| 404 | 리소스 없음 | 존재하지 않는 노트/세션 |
| 409 | 충돌 | 이미 진행 중인 세션 존재 |
| 500 | 서버 오류 | AI 서비스 장애 등 |

### 오류 응답 형식

```json
{
  "success": false,
  "message": "이미 진행 중인 세션이 있습니다",
  "errorCode": "ACTIVE_SESSION_EXISTS",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 🎯 성능 기준

### 응답 시간
- **일반 API**: 500ms 이내
- **AI 기능**: 5초 이내
- **대용량 조회**: 2초 이내

### 처리량
- **동시 접속**: 1000명
- **API 호출**: 초당 100회
- **데이터베이스**: 초당 500 쿼리

---

## 🔧 개발자 가이드

### 환경 설정

```yaml
# application.yml
spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:pomki
  jpa:
    hibernate:
      ddl-auto: create-drop

ai:
  openai:
    api-key: your-openai-api-key
    model: gpt-3.5-turbo

jwt:
  secret-key: your-secret-key
  access-token-expiration: 3600000
```

### 로컬 개발

1. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun
   ```

2. **H2 콘솔 접속**
   ```
   http://localhost:8080/h2-console
   ```

3. **API 테스트**
   ```
   http://localhost:8080/api
   ```

---

## 📚 추가 리소스

- **Swagger UI**: `/swagger-ui.html`
- **API Docs**: `/v3/api-docs`
- **Health Check**: `/actuator/health`
- **Metrics**: `/actuator/metrics`

---

## 🚀 배포 가이드

### Docker 실행
```bash
docker run -p 8080:8080 pomki-backend:latest
```

### 환경 변수
```bash
AI_OPENAI_API_KEY=your-api-key
JWT_SECRET_KEY=your-secret-key
SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3306/pomki
```

---

*이 문서는 Pomki v1.0.0 기준으로 작성되었습니다.* 