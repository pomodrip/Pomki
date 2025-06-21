import React from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Text } from '../ui';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { closeDialog, selectDialog } from '../../store/slices/dialogSlice';

const ConfirmDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, title, content, onConfirm } = useAppSelector(selectDialog);

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const actions = (
    <>
      <Button onClick={handleClose} variant="outlined">
        Cancel
      </Button>
      <Button onClick={handleConfirm} variant="contained" color="error">
        Confirm
      </Button>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={title}
      actions={actions}
    >
      <Text sx={{ color: 'text.secondary' }}>
        {content}
      </Text>
    </Modal>
  );
};

export default ConfirmDialog;
