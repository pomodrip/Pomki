import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDialog } from './useDialog';
import { requestPermissionAndGetToken, deleteToken } from '@/utils/fcmUtils';
import { selectFcmToken, selectPermissionStatus, setFcmToken, setPermissionStatus } from '@/store/slices/notificationSlice';
import { AppDispatch } from '@/store/store';
import { useNotifications } from './useUI';

export const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showConfirmDialog } = useDialog();
  const permissionStatus = useSelector(selectPermissionStatus);
  const fcmToken = useSelector(selectFcmToken);
  const { success } = useNotifications();   

  const requestPermission = useCallback(async () => {
    const confirmed = await showConfirmDialog({
      title: '알림 수신 동의',
      message: 'Pomki의 학습 관련 주요 알림을 받으시겠습니까?',
    });

    if (confirmed) {
      await requestPermissionAndGetToken(dispatch);
      success('알림 수신이 허용되었습니다.');
    }
  }, [dispatch, showConfirmDialog]);

  const disableNotifications = useCallback(async () => {
    try {
      await deleteToken();
      dispatch(setFcmToken(null));
      dispatch(setPermissionStatus('denied'));
      success('알림 수신이 해제되었습니다.');
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
    }
  }, [dispatch, success]);

  return {
    permissionStatus,
    fcmToken,
    requestPermission,
    disableNotifications,
  };
};