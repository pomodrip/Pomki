import { createTheme } from '@mui/material/styles';

// design.md의 내용을 여기에 채워나갈 예정입니다.
// 우선은 기본 테마로 시작합니다.
const theme = createTheme({
  palette: {
    primary: {
      main: '#2979FF',
    },
  },
  typography: {
    fontFamily: "'KoddiUD', 'NanumSquareOTF', 'NanumSquareNeo', sans-serif",
  }
});

export default theme;