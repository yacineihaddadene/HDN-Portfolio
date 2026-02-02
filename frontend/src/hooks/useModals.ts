'use client';

import { useState } from 'react';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info' | 'success';
}

interface ToastState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useConfirmModal() {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'warning'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const hideConfirm = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  return {
    confirmModal,
    showConfirm,
    hideConfirm,
  };
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isOpen: false });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
