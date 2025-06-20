// 이메일 유효성 검사
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 유효성 검사 (최소 8자 이상)
export const validatePassword = (password: string): boolean => {
    return password.trim().length > 0;
};

// 필수 필드 검사
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// 이메일 검증 에러 메시지
export const getEmailValidationMessage = (email: string): string | null => {
  if (!validateRequired(email)) {
    return '이메일을 입력해주세요.';
  }
  if (!validateEmail(email)) {
    return '올바른 이메일 형식을 입력해주세요.';
  }
  return null;
};

// 비밀번호 검증 에러 메시지
export const getPasswordValidationMessage = (password: string): string | null => {
  if (!validateRequired(password)) {
    return '비밀번호를 입력해주세요.';
  }
  if (!validatePassword(password)) {
    return '비밀번호를 입력해주세요.';
  }
  return null;
};
