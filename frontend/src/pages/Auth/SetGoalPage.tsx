import React, { useState } from "react";
import styled from "styled-components";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Box, Checkbox, Chip, Container, Typography } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';

const goalOptions = [
  "자격증 준비",
  "외국어 학습",
  "취업 준비",
  "집중력 향상",
  "기타",
];

const SetGoalPage = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleChipClick = (label: string) => {
    setSelectedGoals((prev) =>
      prev.includes(label)
        ? prev.filter((goal) => goal !== label)
        : [...prev, label]
    );
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        marginTop: '10vh',
        marginBottom: '20vh',
        minHeight: '60vh',
        padding: { xs: '24px 8px', sm: '32px 16px' },
      }}>
        <Typography variant="h1" sx={{ mb: 8 }} style={{ textAlign: 'left' }}>학습 목표 설정</Typography>
        <Box sx={{ display: 'flex',
                   flexDirection: 'row',
                   flexWrap: 'wrap', gap: 2,
                   alignItems: 'flex-start',
                   width: '80%',
                   margin: '0 auto',
                }}>
            {goalOptions.map((label) => (
              <Chip
                key={label}
                label={label}
                clickable
                color={selectedGoals.includes(label) ? "primary" : "default"}
                variant={selectedGoals.includes(label) ? "filled" : "outlined"}
                onClick={() => handleChipClick(label)}
              />
            ))}
        </Box>
        <Button variant="contained" color="primary" fullWidth style={{ marginBottom: 32, marginTop: 'auto' }}>설정 완료</Button>
        <Button variant="text" color="secondary" fullWidth style={{ marginBottom: 32 }}>나중에</Button>
    </Container>
  );
};

export default SetGoalPage;
