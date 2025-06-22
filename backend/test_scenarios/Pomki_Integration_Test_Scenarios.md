# Pomki Backend API 통합 테스트 시나리오

## 🎯 테스트 목표

포모도로 기법 + AI 기반 학습 플랫폼의 핵심 워크플로우가 정상적으로 작동하는지 검증

---

## 📋 테스트 시나리오

### 시나리오 1: 기본 사용자 플로우 ✅

**목표**: 신규 사용자가 회원가입부터 첫 포모도로 세션까지 완료하는 플로우

**단계**:
1. **회원가입**: `POST /api/auth/signup`
   - 이메일, 비밀번호, 닉네임으로 회원가입
   - 응답: 성공 메시지

2. **로그인**: `POST /api/auth/login`
   - 이메일, 비밀번호로 로그인
   - 응답: accessToken, refreshToken

3. **포모도로 빠른 시작**: `POST /api/pomodoro/quick-start`
   - 25분 집중 세션 자동 생성 및 시작
   - 응답: 세션 정보 (sessionId, 상태, 남은 시간)

4. **현재 세션 조회**: `GET /api/pomodoro/current`
   - 진행 중인 세션 상태 확인
   - 응답: 타이머 상태, 남은 시간

**예상 결과**: 모든 API가 정상 응답하며, 사용자가 즉시 포모도로를 시작할 수 있음

---

### 시나리오 2: 포모도로 + AI 노트 생성 플로우 🍅🤖

**목표**: 포모도로 세션 → AI 요약 → 자동 노트 생성의 전체 플로우 검증

**단계**:
1. **포모도로 세션 생성**: `POST /api/pomodoro/sessions`
   ```json
   {
     "sessionType": "FOCUS",
     "plannedDuration": 25,
     "sessionGoal": "Java Spring Boot 학습"
   }
   ```

2. **세션 시작**: `POST /api/pomodoro/sessions/{sessionId}/start`

3. **실시간 메모 작성**: `PUT /api/pomodoro/sessions/{sessionId}/notes`
   ```json
   {
     "sessionNotes": "오늘 학습한 내용:\n- Spring Boot 자동 설정\n- REST API 개발\n- JPA 연동 방법\n\n어려웠던 점:\n- 연관관계 매핑\n\n내일 더 공부할 것:\n- Spring Security"
   }
   ```

4. **세션 완료 (AI 요약 포함)**: `POST /api/pomodoro/sessions/{sessionId}/complete`
   ```json
   {
     "actualDuration": 25,
     "sessionNotes": "...",
     "generateAiSummary": true
   }
   ```

5. **AI 요약으로 노트 생성**: `POST /api/pomodoro/sessions/{sessionId}/generate-note`

6. **생성된 노트 확인**: `GET /api/notes/{noteId}`

**예상 결과**: 
- 포모도로 세션이 정상 완료됨
- AI가 세션 메모를 요약함
- 요약된 내용이 정리된 노트로 자동 생성됨

---

### 시나리오 3: AI 노트 폴리싱 플로우 📝✨

**목표**: 기존 노트를 AI로 개선하는 기능 검증

**단계**:
1. **노트 생성**: `POST /api/notes`
   ```json
   {
     "noteTitle": "JavaScript 학습 노트",
     "noteContent": "오늘은 자바스크립트 기초를 배웠다. 변수 선언, 함수, 객체 등을 공부했고 DOM 조작도 해봤다. 내일은 비동기 처리를 공부할 예정이다."
   }
   ```

2. **AI 기능 상태 확인**: `GET /api/ai/status`

3. **노트 AI 폴리싱**: `POST /api/ai/polish-note`
   ```json
   {
     "noteId": "{noteId}",
     "style": "summary",
     "customPrompt": ""
   }
   ```

4. **폴리싱 결과 확인**: 응답에서 `polishedContent` 확인

5. **폴리싱 결과 적용**: `POST /api/ai/apply-polish/{noteId}`

6. **업데이트된 노트 확인**: `GET /api/notes/{noteId}`

**예상 결과**:
- 원본 노트 내용이 AI에 의해 정리됨
- 가독성과 구조가 개선된 노트가 생성됨

---

### 시나리오 4: 포모도로 사이클 완주 🔄

**목표**: 표준 포모도로 사이클 (25분 집중 → 5분 휴식 → 25분 집중 → 15분 긴 휴식) 검증

**단계**:
1. **사이클 권장 확인**: `GET /api/pomodoro/cycle-suggestion`
   - 첫 번째 세션: FOCUS 25분 권장

2. **1차 집중 세션**: 25분 집중 세션 생성 → 시작 → 완료

3. **사이클 권장 재확인**: `GET /api/pomodoro/cycle-suggestion`
   - 두 번째 세션: SHORT_BREAK 5분 권장

4. **휴식 세션**: 5분 휴식 세션 생성 → 시작 → 완료

5. **2차 집중 세션**: 25분 집중 세션 생성 → 시작 → 완료

6. **통계 확인**: `GET /api/pomodoro/stats`
   - 완료된 세션 수, 집중 시간 등 확인

**예상 결과**:
- 각 세션이 순서대로 정상 진행됨
- 시스템이 적절한 다음 세션을 권장함
- 통계가 정확히 누적됨

---

### 시나리오 5: 학습 데이터 통합 📊

**목표**: 모든 학습 활동이 통계에 정확히 반영되는지 검증

**단계**:
1. **다양한 학습 활동 수행**:
   - 노트 3개 생성
   - 포모도로 세션 5개 완료 (집중 4개, 휴식 1개)
   - AI 폴리싱 2회 사용

2. **통합 통계 조회**: `GET /api/simple-stats`

3. **포모도로 전용 통계**: `GET /api/pomodoro/stats`

4. **데이터 검증**:
   - 총 노트 수: 3개 이상 (포모도로에서 생성된 것 포함)
   - 총 포모도로 세션: 5개
   - 총 집중 시간: 100분 이상
   - 완료율 계산 정확성

**예상 결과**:
- 모든 활동이 정확히 통계에 반영됨
- 서로 다른 API의 통계가 일관성 있음

---

## 🔧 테스트 환경 설정

### 필요한 도구
- **Postman**: API 테스트
- **H2 Database**: 인메모리 테스트 DB
- **Spring Boot Test**: 자동화된 테스트

### 환경 변수
```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
  h2:
    console:
      enabled: true

ai:
  openai:
    api-key: test-key-or-empty
    model: gpt-3.5-turbo
```

---

## ✅ 성공 기준

### 응답 시간
- 모든 API: 2초 이내
- AI 기능: 10초 이내

### 응답 코드
- 정상 요청: 200 OK
- 생성 요청: 201 Created
- 인증 오류: 401 Unauthorized
- 리소스 없음: 404 Not Found

### 데이터 일관성
- 생성된 데이터가 조회 API에서 확인됨
- 통계 데이터가 실제 활동과 일치
- AI 기능 실패 시 원본 데이터 보존

---

## 🚨 오류 시나리오

### 인증 오류
- 토큰 없이 보호된 API 호출
- 만료된 토큰으로 API 호출

### 데이터 유효성 오류
- 필수 필드 누락
- 잘못된 데이터 타입
- 길이 제한 초과

### 비즈니스 로직 오류
- 이미 진행 중인 포모도로 세션이 있을 때 새 세션 생성
- 완료된 세션을 다시 시작하려고 시도
- 존재하지 않는 리소스에 대한 작업

**예상 결과**: 적절한 오류 메시지와 HTTP 상태 코드 반환

---

## 📝 테스트 실행 순서

1. **환경 준비**: 애플리케이션 실행, DB 초기화
2. **기본 플로우**: 시나리오 1 실행
3. **핵심 기능**: 시나리오 2, 3 실행
4. **고급 기능**: 시나리오 4, 5 실행
5. **오류 처리**: 각종 오류 시나리오 실행
6. **성능 테스트**: 동시 요청, 대용량 데이터 처리

---

## 🎯 최종 검증 포인트

✅ **기능성**: 모든 핵심 기능이 예상대로 작동  
✅ **안정성**: 오류 상황에서도 시스템이 안정적으로 동작  
✅ **일관성**: 데이터가 모든 API에서 일관되게 조회됨  
✅ **성능**: 합리적인 응답 시간 내에 처리  
✅ **사용성**: 실제 사용자 시나리오가 원활하게 진행됨 