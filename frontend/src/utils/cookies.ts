// 쿠키 관리 유틸리티 함수들

export const cookies = {
  // 쿠키 가져오기
  get: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  // 쿠키 설정
  set: (name: string, value: string, days = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  },

  // 쿠키 삭제
  remove: (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict;Secure`;
  },

  // refreshToken 쿠키 확인 (서버에서 설정되므로 읽기만)
  hasRefreshToken: (): boolean => {
    return cookies.get('refresh_token') !== null;
  },

  // 모든 인증 관련 쿠키 삭제 (로그아웃시 사용)
  clearAuthCookies: (): void => {
    cookies.remove('refresh_token');
    // 다른 인증 관련 쿠키가 있다면 여기에 추가
  }
};

export default cookies; 