import { Button, Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 2
        }}>
            <Typography variant="h1">🍅</Typography>
            <Typography variant="h4">404 Not Found</Typography>
            <Typography variant="body1">존재하지 않는 페이지입니다.</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                홈으로 이동
            </Button>
        </Box>
    );
};

export default NotFoundPage;