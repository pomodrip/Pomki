import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

interface EmailVerificationTimerProps {
    onExpire?: () => void;
}

const EmailVerificationTimer = ({ onExpire }: EmailVerificationTimerProps) => {
    const MINUTES_IN_MS = 4 * 60 * 1000;
    const INTERVAL = 1000;
    const [timeLeft, setTimeLeft] = useState<number>(MINUTES_IN_MS);
    
    useEffect(() => {
        if (timeLeft <= 0) {
            if (onExpire) onExpire();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - INTERVAL);
        }, INTERVAL);

        return () => {
            clearInterval(timer);
        };
    }, [timeLeft, onExpire]);
    
    const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(2, '0');
    const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, '0');

    return (
        <Typography variant="body1" color="primary.main">
            {minutes}:{second}
        </Typography>
    );
}

export default EmailVerificationTimer;
