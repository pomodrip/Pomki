import { useState } from "react";
import Button from "../../components/ui/Button";
import { Box, Chip, Container, Typography, Paper } from "@mui/material";

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
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: { xs: '24px 8px', sm: '32px 16px' },
        mt: 2,
      }}>
      <Paper
        elevation={3}
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h1" sx={{ mb: 8, textAlign: 'center' }}>학습 목표 설정</Typography>
        <Box sx={{ display: 'flex',
                   flexDirection: 'row',
                   flexWrap: 'wrap', gap: 2,
                   alignItems: 'flex-start',
                   width: '80%',
                   margin: '0 auto',
                   marginBottom: 4

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
        <Button variant="contained" color="primary" fullWidth style={{ marginBottom: 32, marginTop: 32 }}>설정 완료</Button>
        <Button variant="text" color="secondary" fullWidth style={{ marginBottom: 32 }}>나중에</Button>
      </Paper>
    </Container>
  );
};

export default SetGoalPage;
