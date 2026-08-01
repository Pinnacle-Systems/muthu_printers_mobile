import { useState, useCallback } from 'react';

/**
 * useAppModal
 * Returns:
 *  modalProps   - spread directly into <AppWarningModal {...modalProps} />
 *  showModal    - showModal({ title, message, type, confirmLabel, cancelLabel, onConfirm })
 *  hideModal    - hides the modal
 */
const useAppModal = () => {
  const [state, setState] = useState({
    visible:      false,
    title:        '',
    message:      '',
    type:         'warning',
    confirmLabel: 'OK',
    cancelLabel:  'Cancel',
    onConfirm:    null,
  });

  const showModal = useCallback(({
    title        = '',
    message      = '',
    type         = 'warning',
    confirmLabel = 'OK',
    cancelLabel  = 'Cancel',
    onConfirm    = null,
  } = {}) => {
    setState({
      visible: true,
      title,
      message,
      type,
      confirmLabel,
      cancelLabel,
      onConfirm,
    });
  }, []);

  const hideModal = useCallback(() => {
    setState(prev => ({ ...prev, visible: false, onConfirm: null }));
  }, []);

  // shortcuts
  const showWarning = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'warning', ...opts }), [showModal]);

  const showError = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'error', ...opts }), [showModal]);

  const showSuccess = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'success', ...opts }), [showModal]);

  const showInfo = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'info', ...opts }), [showModal]);

  return {
    modalProps: {
      visible:      state.visible,
      title:        state.title,
      message:      state.message,
      type:         state.type,
      confirmLabel: state.confirmLabel,
      cancelLabel:  state.cancelLabel,
      onConfirm:    state.onConfirm,
      onClose:      hideModal,
    },
    showModal,
    hideModal,
    showWarning,
    showError,
    showSuccess,
    showInfo,
  };
};

export default useAppModal;