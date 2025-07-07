import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { deleteUserAccount } from '../../store/slices/authSlice'; // This will be created
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useDialog } from '../../hooks/useDialog';
import { useSnackbar } from '../../hooks/useSnackbar';

const WithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [confirmText, setConfirmText] = useState('');
  const [agree, setAgree] = useState(false);
  const { openDialog } = useDialog();
  const showSnackbar = useSnackbar();

  const isButtonDisabled = confirmText !== '탈퇴합니다' || !agree;

  const handleWithdrawal = async () => {
    try {
      await dispatch(deleteUserAccount()).unwrap(); // This will be created.
      showSnackbar('회원 탈퇴 완료', 'success');
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      showSnackbar(`회원 탈퇴 실패: ${errorMessage}`, 'error');
    }
  };

  const openConfirmationDialog = () => {
    openDialog({
      title: '정말로 탈퇴하시겠습니까?',
      content: '이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.',
      onConfirm: handleWithdrawal,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <Typography variant="h1" gutterBottom>
          회원 탈퇴
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          회원 탈퇴를 진행하기 전에 아래 내용을 반드시 확인해주세요. 탈퇴 시 모든
          학습 기록, 카드, 덱이 영구적으로 삭제되며 복구할 수 없습니다.
        </Typography>

        <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, backgroundColor: 'rgba(255, 165, 0, 0.1)' }}>
          <Typography variant="h4" color="warning.dark" gutterBottom>
            주의사항
          </Typography>
          <ul style={{ paddingLeft: 20 }}>
            <li>모든 학습 데이터(카드, 덱, 통계)가 영구적으로 삭제됩니다.</li>
            <li>프리미엄 멤버십이 있는 경우, 남은 기간은 환불되지 않습니다.</li>
            <li>동일한 이메일로 재가입 시 기존 데이터는 복구되지 않습니다.</li>
          </ul>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
          label="위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다."
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ mb: 1 }}>
          탈퇴를 확정하려면 아래에 "탈퇴합니다"라고 입력해주세요.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="탈퇴합니다"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="error"
          disabled={isButtonDisabled}
          onClick={openConfirmationDialog}
        >
          회원 탈퇴
        </Button>
      </Card>
      <ConfirmDialog />
    </Container>
  );
};

export default WithdrawalPage; 