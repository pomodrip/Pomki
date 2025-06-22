# 🍅 Pomki Backend

**포모도로 기법과 AI 기술을 결합한 스마트 학습 플랫폼**

---

## 🎯 프로젝트 개요

Pomki는 전통적인 포모도로 기법에 AI 기술을 결합하여 학습 효율을 극대화하는 혁신적인 플랫폼입니다.

### 핵심 가치
- ⏰ **효과적인 시간 관리**: 검증된 포모도로 기법으로 집중력 향상
- 🤖 **AI 기반 학습 지원**: 실시간 메모를 정리된 노트로 자동 변환
- 📊 **데이터 기반 인사이트**: 학습 패턴 분석 및 개선 방향 제시
- 🔄 **매끄러운 워크플로우**: 집중 → 메모 → AI 정리 → 노트의 완전 자동화

---

## ✨ 주요 기능

### 🍅 스마트 포모도로 타이머
- **다양한 세션 타입**: 집중(25분), 짧은 휴식(5분), 긴 휴식(15분)
- **실시간 메모 작성**: 집중 중 떠오르는 아이디어 즉시 기록
- **지능형 사이클 권장**: 완료 패턴에 따른 최적 다음 세션 추천
- **빠른 시작**: 원클릭으로 즉시 포모도로 시작

### 📝 AI 기반 노트 관리
- **자동 노트 생성**: 포모도로 세션의 메모를 AI가 정리된 노트로 변환
- **스타일별 폴리싱**: 요약, 상세설명, 핵심개념, 문법교정 등 4가지 스타일
- **노트 CRUD**: 생성, 조회, 수정, 삭제의 완전한 노트 관리
- **AI 강화 표시**: AI로 개선된 노트 구분

### 📊 학습 분석 대시보드
- **실시간 통계**: 오늘, 이번 주, 전체 기간 학습 데이터
- **포모도로 분석**: 완료율, 집중 시간, 세션 패턴 분석
- **학습 진도 추적**: 노트 생성량, AI 활용도 등 종합 지표

### 🔐 사용자 관리
- **다중 로그인**: 일반 로그인 + OAuth2 (Google, Kakao)
- **JWT 인증**: 보안이 강화된 토큰 기반 인증
- **개인화**: 사용자별 독립적인 데이터 관리

---

## 🏗️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Security**: Spring Security + JWT
- **Database**: H2 (개발) / MariaDB (운영)
- **Cache**: Redis
- **AI Integration**: OpenAI GPT API

### Documentation & Testing
- **API Docs**: Swagger/OpenAPI 3
- **Testing**: JUnit 5 + Mockito
- **Monitoring**: Spring Boot Actuator

---

## 🚀 빠른 시작

### 사전 요구사항
- Java 17 이상
- Git

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-repo/pomki-backend.git
cd pomki-backend/backend
```

### 2. 환경 설정
```bash
# application.yml 파일 확인 (이미 H2로 설정됨)
# OpenAI API 키가 있다면 설정 (선택사항)
```

### 3. 애플리케이션 실행
```bash
./gradlew bootRun
```

### 4. 접속 확인
- **API 서버**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 콘솔**: http://localhost:8080/h2-console

---

## 📋 API 엔드포인트

### 인증 (Authentication)
```
POST /api/auth/signup     # 회원가입
POST /api/auth/login      # 로그인
```

### 노트 관리 (Notes)
```
GET    /api/notes         # 노트 목록 조회
POST   /api/notes         # 노트 생성
GET    /api/notes/{id}    # 노트 상세 조회
PUT    /api/notes/{id}    # 노트 수정
DELETE /api/notes/{id}    # 노트 삭제
```

### AI 기능 (AI Services)
```
GET  /api/ai/status              # AI 서비스 상태
POST /api/ai/polish-note         # 노트 AI 폴리싱
POST /api/ai/apply-polish/{id}   # 폴리싱 결과 적용
```

### 포모도로 타이머 (Pomodoro)
```
POST /api/pomodoro/quick-start                    # 빠른 시작
POST /api/pomodoro/sessions                       # 세션 생성
GET  /api/pomodoro/current                        # 현재 세션 조회
PUT  /api/pomodoro/sessions/{id}/notes           # 실시간 메모
POST /api/pomodoro/sessions/{id}/complete        # 세션 완료
POST /api/pomodoro/sessions/{id}/generate-note   # 노트 자동 생성
GET  /api/pomodoro/stats                         # 포모도로 통계
GET  /api/pomodoro/cycle-suggestion              # 사이클 권장
```

### 통계 (Statistics)
```
GET /api/simple-stats     # 통합 학습 통계
```

---

## 🔄 완전한 학습 워크플로우

### 1. 포모도로 시작
```bash
curl -X POST "http://localhost:8080/api/pomodoro/quick-start?duration=25&goal=Java학습" \
  -H "Authorization: Bearer {your-token}"
```

### 2. 실시간 메모 작성 (집중 세션 중)
```bash
curl -X PUT "http://localhost:8080/api/pomodoro/sessions/{sessionId}/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{"sessionNotes": "Spring Boot 자동 설정에 대해 학습중..."}'
```

### 3. 세션 완료 (AI 요약 포함)
```bash
curl -X POST "http://localhost:8080/api/pomodoro/sessions/{sessionId}/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{"actualDuration": 25, "generateAiSummary": true}'
```

### 4. AI 요약으로 노트 자동 생성
```bash
curl -X POST "http://localhost:8080/api/pomodoro/sessions/{sessionId}/generate-note" \
  -H "Authorization: Bearer {your-token}"
```

### 5. 생성된 노트 확인
```bash
curl -X GET "http://localhost:8080/api/notes/{noteId}" \
  -H "Authorization: Bearer {your-token}"
```

---

## 🧪 테스트 방법

### 1. Postman 컬렉션 사용
```bash
# postman/ 디렉토리의 컬렉션 파일 임포트
# 환경 변수 설정: baseUrl=http://localhost:8080/api
```

### 2. 통합 테스트 시나리오
```bash
# test_scenarios/ 디렉토리의 시나리오 문서 참조
# 5가지 주요 시나리오 + 오류 처리 테스트
```

### 3. 체크리스트 활용
```bash
# test_checklist/ 디렉토리의 체크리스트 사용
# 120개 항목의 종합적인 테스트 가이드
```

---

## 📂 프로젝트 구조

```
backend/
├── src/main/java/com/cooltomato/pomki/
│   ├── ai/                 # AI 기능 (노트 폴리싱)
│   ├── auth/               # 인증 & 권한
│   ├── member/             # 사용자 관리
│   ├── note/               # 노트 관리
│   ├── pomodoro/           # 포모도로 타이머
│   ├── global/             # 공통 설정 & 예외처리
│   └── PomkiApplication.java
├── src/main/resources/
│   ├── application.yml     # 메인 설정
│   └── config/
├── documentation/          # API 문서
├── postman/               # Postman 컬렉션
├── test_scenarios/        # 테스트 시나리오
└── test_checklist/        # 테스트 체크리스트
```

---

## ⚙️ 환경 설정

### 개발 환경 (기본값)
```yaml
spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:pomki
  jpa:
    hibernate:
      ddl-auto: create-drop
  h2:
    console:
      enabled: true
```

### AI 기능 활성화 (선택사항)
```yaml
ai:
  openai:
    api-key: your-openai-api-key
    model: gpt-3.5-turbo
    enabled: true
```

### 운영 환경 (MariaDB)
```yaml
spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/pomki
    username: your-username
    password: your-password
  jpa:
    hibernate:
      ddl-auto: validate
```

---

## 🛠️ 개발 가이드

### 새로운 기능 추가
1. **엔티티 생성**: JPA 엔티티 정의
2. **리포지토리**: Spring Data JPA 인터페이스
3. **서비스**: 비즈니스 로직 구현
4. **컨트롤러**: REST API 엔드포인트
5. **DTO**: 요청/응답 객체 정의
6. **테스트**: 단위/통합 테스트 작성

### 코드 스타일
- **Naming**: camelCase (Java), snake_case (DB)
- **Annotation**: Lombok 적극 활용
- **Exception**: 글로벌 예외 처리기 사용
- **Validation**: Bean Validation 활용

---

## 🔍 모니터링 & 디버깅

### Actuator 엔드포인트
```
GET /actuator/health        # 헬스체크
GET /actuator/metrics       # 메트릭
GET /actuator/info          # 애플리케이션 정보
```

### 로그 설정
```yaml
logging:
  level:
    com.cooltomato.pomki: DEBUG
    org.springframework.security: DEBUG
```

### H2 데이터베이스 콘솔
```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:pomki
Username: sa
Password: (빈 문자열)
```

---

## 🚀 배포

### Docker 배포
```bash
# Dockerfile 빌드
docker build -t pomki-backend .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e AI_OPENAI_API_KEY=your-key \
  -e SPRING_PROFILES_ACTIVE=prod \
  pomki-backend
```

### JAR 배포
```bash
# JAR 파일 빌드
./gradlew build

# 실행
java -jar build/libs/pomki-backend-1.0.0.jar \
  --spring.profiles.active=prod \
  --ai.openai.api-key=your-key
```

---

## 🤝 기여하기

### 개발 환경 설정
1. Fork & Clone
2. 브랜치 생성: `git checkout -b feature/new-feature`
3. 개발 & 테스트
4. 커밋: `git commit -m "Add new feature"`
5. 푸시: `git push origin feature/new-feature`
6. Pull Request 생성

### 코드 리뷰 체크리스트
- [ ] 테스트 코드 포함
- [ ] API 문서 업데이트
- [ ] 예외 처리 구현
- [ ] 로그 추가
- [ ] 성능 영향 검토

---

## 📞 지원 & 문의

- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **보안 취약점**: security@pomki.io

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🎯 로드맵

### v1.1 (예정)
- [ ] 모바일 앱 지원
- [ ] 팀 협업 기능
- [ ] 더 많은 AI 모델 지원

### v1.2 (예정)
- [ ] 캘린더 연동
- [ ] 음성 메모 지원
- [ ] 학습 목표 설정

---

**Made with ❤️ for better learning**

*Pomki v1.0.0 - 당신의 학습을 더 스마트하게* 