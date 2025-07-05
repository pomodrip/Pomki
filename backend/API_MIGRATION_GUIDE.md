# 📋 Pomki 백엔드 API 통합 가이드

## 🚨 중복 API 정리 및 마이그레이션 가이드

### 📊 **통계 관련 API 현황**

현재 **4개의 서로 다른 대시보드 API**와 **3개의 복습 통계 API**가 존재합니다. 이를 정리하여 **일관성 있는 API 구조**를 제공합니다.

---

## 🎯 **권장 사용 API (2024년 기준)**

### **1. 통계 및 대시보드**

#### **✅ 메인 통계 API - `/api/stats/`**
```http
# 종합 통계 조회 (권장)
GET /api/stats/summary
Response: {
  "success": true,
  "data": {
    "totalStudyMinutes": 1250,
    "totalStudyHours": 20.83,
    "totalStudyDays": 15,
    "currentStreak": 7,
    "maxStreak": 12,
    "totalCardsStudied": 156,
    "totalNotesCreated": 23,
    "averageStudyMinutesPerDay": 83.33,
    "studyLevel": "학습자",
    "isActiveStudier": true
  }
}

# 출석 기록
POST /api/stats/attendance
Response: {
  "success": true,
  "message": "출석이 기록되었습니다.",
  "isNewAttendance": true
}

# 학습시간 누적
POST /api/stats/study-time
Body: { "studyMinutes": 25 }
Response: {
  "success": true,
  "addedMinutes": 25,
  "totalMinutes": 1275
}

# 출석 여부 확인
GET /api/stats/attendance/today
Response: {
  "success": true,
  "isAttendedToday": true,
  "date": "2024-01-15"
}

# 총 학습시간 조회
GET /api/stats/study-time/total
Response: {
  "success": true,
  "totalStudyMinutes": 1250,
  "totalStudyHours": 20.83
}
```

#### **✅ 간단한 대시보드 - `/api/simple-stats/`** (7일 일정용)
```http
# 간단한 대시보드 (권장 - 프론트엔드 메인 화면용)
GET /api/simple-stats/dashboard

# 개별 조회
GET /api/simple-stats/today      # 오늘 통계만
GET /api/simple-stats/weekly     # 주간 통계만
GET /api/simple-stats/review     # 복습 통계만
GET /api/simple-stats/total      # 누적 통계만
```

### **2. 복습 관련 API**

#### **✅ 복습 API - `/api/reviews/`**
```http
# 복습 통계 조회 (권장)
GET /api/reviews/stats
Response: {
  "todayCards": 45,
  "todayCompleted": 12,
  "within3DaysCards": 23,
  "within7DaysCards": 67,
  "recommendedCardTitle": "복습할 카드가 있습니다"
}

# 오늘 복습할 카드 목록
GET /api/reviews/today

# 카드 복습 완료 (단순화된 버전 - 권장)
POST /api/reviews/complete-simple/{cardId}?difficulty=easy
# difficulty: hard(1일), confuse(3일), easy(5일)

# 일괄 복습 완료
POST /api/reviews/batch-complete
Body: [
  { "cardId": 1, "difficulty": "easy" },
  { "cardId": 2, "difficulty": "hard" }
]

# 최적화된 복습 카드 조회
GET /api/reviews/optimized?maxCards=20

# 학습 성과 분석
GET /api/reviews/analysis

# 취약한 카드 추천
GET /api/reviews/struggling?limit=10
```

#### **✅ 학습 주기 대시보드 - `/api/study-cycle/`**
```http
# 학습 주기별 카드 현황 (권장 - 복습 계획용)
GET /api/study-cycle/dashboard

# 개별 조회
GET /api/study-cycle/today-cards    # 오늘 학습할 카드만
GET /api/study-cycle/overdue-cards  # 지연된 카드만
GET /api/study-cycle/stats          # 학습 주기 통계만
```

---

## ❌ **Deprecated APIs (사용 중단 예정)**

### **🚫 StudyLogController - `/api/study-logs/`**
```http
# ❌ 사용하지 마세요
POST /api/study-logs/note-created
POST /api/study-logs/card-reviewed
POST /api/study-logs/pomodoro-completed

# ✅ 대신 사용하세요
POST /api/stats/attendance           # 출석은 자동 기록
POST /api/reviews/complete-simple/   # 카드 복습
# 포모도로는 새로운 API 개발 필요
```

### **⚠️ 제한적 사용 권장**

#### **StatsController - `/api/stats/dashboard`**
```http
# ⚠️ 특별한 경우에만 사용 (월별 캘린더용)
GET /api/stats/dashboard?year=2024&month=1
# 대신 /api/simple-stats/dashboard 사용 권장
```

---

## 🔄 **마이그레이션 가이드**

### **기존 코드 → 새로운 코드**

#### **1. 대시보드 통계 조회**
```javascript
// ❌ 기존 방식
const response = await fetch('/api/stats/dashboard?year=2024&month=1');

// ✅ 새로운 방식 (권장)
const response = await fetch('/api/simple-stats/dashboard');
// 또는 종합 통계
const summaryResponse = await fetch('/api/stats/summary');
```

#### **2. 복습 관련**
```javascript
// ❌ 기존 방식
const response = await fetch('/api/study-logs/card-reviewed', {
  method: 'POST',
  body: JSON.stringify({
    cardCount: 1,
    difficulty: 'easy',
    durationMinutes: 5
  })
});

// ✅ 새로운 방식 (권장)
const response = await fetch('/api/reviews/complete-simple/123?difficulty=easy', {
  method: 'POST'
});
```

#### **3. 출석 및 학습시간**
```javascript
// ❌ 기존 방식
const response = await fetch('/api/study-logs/note-created', {
  method: 'POST',
  body: JSON.stringify({
    noteTitle: '노트 제목',
    durationMinutes: 30
  })
});

// ✅ 새로운 방식 (권장)
// 1. 출석 기록
await fetch('/api/stats/attendance', { method: 'POST' });

// 2. 학습시간 기록
await fetch('/api/stats/study-time', {
  method: 'POST',
  body: JSON.stringify({ studyMinutes: 30 })
});
```

---

## 📈 **성능 최적화 가이드**

### **API 호출 최적화**

#### **✅ 권장 패턴**
```javascript
// 메인 화면 로딩시 - 한 번에 모든 정보 가져오기
const [dashboardStats, reviewStats] = await Promise.all([
  fetch('/api/simple-stats/dashboard'),
  fetch('/api/reviews/stats')
]);

// 개별 통계가 필요한 경우만 별도 호출
const summaryStats = await fetch('/api/stats/summary');
```

#### **❌ 비효율적 패턴**
```javascript
// 여러 번 호출하지 마세요
const todayStats = await fetch('/api/simple-stats/today');
const weeklyStats = await fetch('/api/simple-stats/weekly');
const reviewStats = await fetch('/api/simple-stats/review');
// 대신 /api/simple-stats/dashboard 한 번 호출
```

---

## 🛠️ **개발자를 위한 팁**

### **1. 응답 데이터 구조 통일**
모든 새로운 API는 다음 구조를 따릅니다:
```json
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "message": "성공 메시지"
}
```

### **2. 에러 처리**
```json
{
  "success": false,
  "message": "오류 메시지",
  "errorCode": "SPECIFIC_ERROR_CODE"
}
```

### **3. 날짜 형식**
- 모든 날짜는 ISO 8601 형식 사용
- 로컬 날짜: `"2024-01-15"`
- 날짜시간: `"2024-01-15T10:30:00"`

---

## 🗂️ **API 우선순위**

### **🥇 최우선 사용 (프론트엔드 메인)**
1. `GET /api/simple-stats/dashboard` - 메인 대시보드
2. `GET /api/stats/summary` - 종합 통계
3. `POST /api/stats/attendance` - 출석 기록
4. `GET /api/reviews/stats` - 복습 통계

### **🥈 보조 사용**
1. `GET /api/study-cycle/dashboard` - 복습 계획용
2. `POST /api/reviews/complete-simple/` - 카드 복습
3. `POST /api/stats/study-time` - 타이머 연동

### **🥉 특수 목적**
1. `GET /api/stats/dashboard` - 월별 캘린더
2. `GET /api/reviews/analysis` - 학습 분석
3. `GET /api/reviews/struggling` - 취약 카드 분석

---

## 📅 **로드맵**

### **Phase 1 (현재)**
- ✅ 새로운 통계 API 구현 완료
- ✅ 기존 API Deprecated 표시
- ✅ 마이그레이션 가이드 작성

### **Phase 2 (다음 업데이트)**
- 🔄 프론트엔드 마이그레이션
- 🔄 포모도로 새 API 개발
- 🔄 성능 모니터링

### **Phase 3 (향후)**
- 🗑️ Deprecated API 완전 제거
- 📊 고급 분석 기능 추가
- 🎯 개인화 추천 시스템

---

**📞 문의사항이 있으시면 개발팀에 연락주세요!** 