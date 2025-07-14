/**
 * UTC 시간 문자열을 사용자의 로컬 시간대로 변환하여 "YYYY-MM-DD HH:mm:ss" 형식으로 반환합니다.
 * @param dateString - 변환할 UTC 시간 문자열 (ISO 8601 형식)
 * @returns 변환된 로컬 시간 문자열
 */
export const formatDateToLocal = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Intl.DateTimeFormat을 사용하여 사용자의 시간대에서 날짜와 시간을 포맷합니다.
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24시간 형식
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 브라우저의 시간대 사용
    });

    // 포맷된 각 부분을 추출합니다.
    const parts = formatter.formatToParts(date);
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    // "YYYY-MM-DD HH:mm:ss" 형식으로 조합합니다.
    return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;

  } catch (error) {
    console.error('날짜 포맷팅 중 오류 발생:', error);
    return '유효하지 않은 날짜'; // 오류 발생 시 대체 텍스트
  }
};
