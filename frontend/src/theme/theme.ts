import { createTheme, responsiveFontSizes, darken } from '@mui/material/styles';

// design.md를 기반으로 한 디자인 토큰 정의
let theme = createTheme({
  // I.A. 색상 (Palette) 
  palette: {
    primary: {
      main: '#2979FF', // 1. Primary Main
      light: '#E3F2FD', // 2. Primary Light
    },
    secondary: {
      main: '#6C757D', // 3. Secondary Main
    },
    error: {
      main: '#D9534F', // 4. Error Main
    },
    success: {
      main: '#4CAF50', // 5. Success Main
    },
    text: {
      primary: '#212121', // 6. Text Primary
      secondary: '#757575', // 7. Text Secondary
    },
    background: {
      paper: '#FFFFFF', // 8. Background Paper
      default: '#F5F5F7', // 9. Background Default
    },
    divider: 'rgba(0, 0, 0, 0.12)', // 10. Divider
    grey: {
      '100': '#F5F5F5', // 11. Grey 100
      '300': '#E0E0E0', // 12. Grey 300
    },
    action: {
      hover: darken('#2979FF', 0.1), // 33. Contained Button (Hover)
      disabledBackground: '#E0E0E0', // 34. Contained Button (Disabled)
      disabled: '#757575',
    },
  },

  // I.B. 타이포그래피 (Typography)
  typography: {
    fontFamily: "'KoddiUD', 'Noto Sans KR', 'Arial', sans-serif", // 13. Global Font Family
    htmlFontSize: 16, // 14. Global htmlFontSize
    h1: { fontSize: '1.75rem', fontWeight: 700 }, // 15. h1 (28px)
    h2: { fontSize: '1.5rem', fontWeight: 700 }, // 16. h2 (24px)
    h3: { fontSize: '1.25rem', fontWeight: 700 }, // 17. h3 (20px)
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }, // 18. body1 (16px)
    body2: { fontSize: '0.875rem', fontWeight: 400, color: '#757575' }, // 19. body2 (14px)
    subtitle1: { fontSize: '0.875rem', fontWeight: 500 }, // 20. subtitle1 (14px)
    caption: { fontSize: '0.75rem', fontWeight: 400 }, // 21. caption (12px)
    button: {
      fontSize: '0.9375rem', // 22. button (15px)
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  // I.C. 간격 및 레이아웃 (Spacing & Layout)
  spacing: 8, // 23. Base Spacing Unit

  // I.D. 형태 및 그림자 (Shape & Shadow)
  shape: {
    borderRadius: 12, // 28. Global Border Radius
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.08)', // 30. Shadow 1 (기본 그림자)
    '0px 4px 16px rgba(0, 0, 0, 0.12)', // 31. Shadow 2 (강조 그림자)
    'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none'
  ],

  // II. 공통 컴포넌트 가이드 (MUI 컴포넌트 기본 스타일 오버라이드)
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12, // 28. Global Border Radius
          padding: '12px 24px', // 37, 38. Button Padding
        },
        containedPrimary: {
          boxShadow: 'none', // 32. Contained Button
          '&:hover': {
            backgroundColor: darken('#2979FF', 0.1), // 33. Contained Button (Hover)
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16, // 50. Card Border Radius
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', // 51. Card Box Shadow
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5', // 41. Input Field Background
          borderRadius: 12, // 28. Global Border Radius
          '&.MuiOutlinedInput-notchedOutline': {
            border: '1px solid black', // 42. Input Field Border
          },
          '&:hover.MuiOutlinedInput-notchedOutline': {
            border: '1px solid black',
          },
          '&.Mui-focused.MuiOutlinedInput-notchedOutline': {
            border: '1px solid #2979FF', // 43. Input Field Border (Focus)
          },
        },
        input: {
          padding: '12px', // 44. Input Field Padding
          fontSize: '1rem', // 45. Input Field Font Size
          '&::placeholder': {
            color: '#757575', // 46. Input Field Placeholder Color
            opacity: 1,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16, // 62. Modal/Dialog borderRadius
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: '64px', // 54. Bottom Navigation Height
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#757575', // 57. Inactive Icon Color
          '&.Mui-selected': {
            color: '#2979FF', // 56. Active Icon Color
          },
        },
      },
    },
  },
});

// 반응형 폰트 사이즈 자동 적용 [7, 8]
theme = responsiveFontSizes(theme);

export default theme;