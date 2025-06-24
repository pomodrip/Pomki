import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import '../assets/fonts/fonts.css'

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          WebkitTapHighlightColor: 'transparent', // 모바일 터치 하이라이트 제거
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          width: '100%',
          height: '100%',
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
      })}
    />
  );
};

export default GlobalStyles;