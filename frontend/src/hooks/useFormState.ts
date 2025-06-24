import { useState, useCallback } from 'react';

// 폼 상태 인터페이스
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 유효성 검사 함수 타입
type ValidationRule<T> = (values: T) => Partial<Record<keyof T, string>>;

// 폼 상태 관리 훅
export function useFormState<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules?: ValidationRule<T>
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  // 값 변경 처리
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const errors = validationRules ? validationRules(newValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors,
        touched: { ...prev.touched, [name]: true },
        isValid,
      };
    });
  }, [validationRules]);

  // 다중 값 변경 처리
  const setValues = useCallback((newValues: Partial<T>) => {
    setState(prev => {
      const updatedValues = { ...prev.values, ...newValues };
      const errors = validationRules ? validationRules(updatedValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        ...prev,
        values: updatedValues,
        errors,
        isValid,
      };
    });
  }, [validationRules]);

  // 에러 설정
  const setError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  // 에러 제거
  const clearError = useCallback((name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  // 모든 에러 제거
  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  // 터치 상태 설정
  const setTouched = useCallback((name: keyof T, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  // 제출 상태 설정
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  // 유효성 검사 실행
  const validate = useCallback(() => {
    if (!validationRules) return true;

    const errors = validationRules(state.values);
    const isValid = Object.keys(errors).length === 0;

    setState(prev => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [validationRules, state.values]);

  // 입력 필드용 헬퍼
  const getFieldProps = useCallback((name: keyof T) => ({
    value: state.values[name],
    onChange: (value: T[keyof T]) => setValue(name, value),
    onBlur: () => setTouched(name, true),
    error: state.touched[name] ? state.errors[name] : undefined,
  }), [state.values, state.touched, state.errors, setValue, setTouched]);

  return {
    ...state,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    setTouched,
    setSubmitting,
    resetForm,
    validate,
    getFieldProps,
  };
} 