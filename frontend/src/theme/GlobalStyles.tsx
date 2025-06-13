import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={{
      body: {
        margin: 0,
        padding: 0,
        backgroundColor: '#F5F5F7', // design.md의 Background Default 색상
        boxSizing: 'border-box',
      },
      '*': {
        boxSizing: 'inherit',
      },
      // 여기에 @font-face 등 다른 전역 스타일을 추가할 수 있습니다.
    }}
  />
);

export default GlobalStyles;