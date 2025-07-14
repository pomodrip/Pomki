/**
 * UTC 시간 문자열을 사용자의 로컬 시간대로 변환하여 "YYYY-MM-DD HH:mm:ss" 형식으로 반환합니다.
 * @param dateString - 변환할 UTC 시간 문자열 (ISO 8601 형식)
 * @returns 변환된 로컬 시간 문자열
 */
export const formatDateToLocal = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, 
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 브라우저의 시간대 사용
    });

    const parts = formatter.formatToParts(date);
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    return `${partMap.year}. ${partMap.month}. ${partMap.day}. ${partMap.hour}:${partMap.minute}:${partMap.second}`;

  } catch (error) {
    console.error('날짜 포맷팅 중 오류 발생:', error);
    return '유효하지 않은 날짜'; // 오류 발생 시 대체 텍스트
  }
};

/**
 * UTC 시간 문자열을 사용자의 로컬 시간대로 변환하여 "YYYY-MM-DD" 형식으로 반환합니다.
 * @param dateString - 변환할 UTC 시간 문자열 (ISO 8601 형식)
 * @returns 변환된 로컬 날짜 문자열
 */
export const formatDateToLocalDateString = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const parts = formatter.formatToParts(date);
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    return `${partMap.year}. ${partMap.month}. ${partMap.day}.`;

  } catch (error) {
    console.error('날짜 포맷팅 중 오류 발생:', error);
    return '유효하지 않은 날짜';
  }
};
