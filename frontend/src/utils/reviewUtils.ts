export type ReviewDifficulty = 'easy' | 'confusing' | 'hard';

export interface ReviewScheduleEntry {
  cardId: string;
  difficulty: ReviewDifficulty;
  scheduledAt: string; // ISO string of next review date
}

const STORAGE_KEY = 'reviewSchedule';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function differenceInCalendarDays(a: Date, b: Date): number {
  const diff = getStartOfDay(a).getTime() - getStartOfDay(b).getTime();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

export function getNextReviewDate(difficulty: ReviewDifficulty, baseDate: Date = new Date()): Date {
  switch (difficulty) {
    case 'hard':
      return addHours(baseDate, 3);
    case 'confusing':
      return addDays(baseDate, 2);
    case 'easy':
    default:
      return addDays(baseDate, 7);
  }
}

export function loadReviewSchedule(): Record<string, ReviewScheduleEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 리뷰 일정이 변했음을 알리는 커스텀 이벤트 헬퍼
function notifyScheduleChange() {
  // 같은 탭에서도 대시보드가 변화를 감지하도록 커스텀 이벤트를 발행
  try {
    window.dispatchEvent(new Event('reviewScheduleUpdated'));
  } catch {
    /* window 가 없는 실행 환경(SSR 등)에서는 무시 */
  }
}

export function saveReviewEntry(cardId: string, difficulty: ReviewDifficulty): void {
  const schedule = loadReviewSchedule();
  schedule[cardId] = {
    cardId,
    difficulty,
    scheduledAt: getNextReviewDate(difficulty).toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  notifyScheduleChange();
}

export function removeReviewEntry(cardId: string): void {
  const schedule = loadReviewSchedule();
  if (schedule[cardId]) {
    delete schedule[cardId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    notifyScheduleChange();
  }
}

export function calculateReviewCounts(baseDate: Date = new Date()): {
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
} {
  const schedule = loadReviewSchedule();
  let todayCount = 0;
  let upcomingCount = 0;
  let overdueCount = 0;
  const todayStart = getStartOfDay(baseDate);
  Object.values(schedule).forEach(({ scheduledAt }) => {
    const scheduledDate = new Date(scheduledAt);
    const diffDays = differenceInCalendarDays(scheduledDate, todayStart);
    if (diffDays === 0) {
      todayCount += 1;
    } else if (diffDays > 0 && diffDays <= 3) {
      upcomingCount += 1;
    } else if (diffDays < 0) {
      overdueCount += 1;
    }
  });
  return { todayCount, upcomingCount, overdueCount };
} 