import React, { createContext, useContext, useState, useCallback } from 'react';
import AppWarningModal from '../../components/AppWarningModal';


const AppModalContext = createContext(null);

export const AppModalProvider = ({ children }) => {
  const [state, setState] = useState({
    visible:      false,
    title:        '',
    message:      '',
    type:         'warning',
    confirmLabel: 'OK',
    cancelLabel:  null,
    onConfirm:    null,
  });

  const showModal = useCallback(({
    title        = '',
    message      = '',
    type         = 'warning',
    confirmLabel = 'OK',
    cancelLabel  = null,
    onConfirm    = null,
  } = {}) => {
    setState({ visible: true, title, message, type, confirmLabel, cancelLabel, onConfirm });
  }, []);

  const hideModal = useCallback(() => {
    setState(prev => ({ ...prev, visible: false, onConfirm: null }));
  }, []);

  const showWarning = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'warning', ...opts }), [showModal]);

  const showError = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'error', ...opts }), [showModal]);

  const showSuccess = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'success', ...opts }), [showModal]);

  const showInfo = useCallback((title, message, opts) =>
    showModal({ title, message, type: 'info', ...opts }), [showModal]);

  return (
    <AppModalContext.Provider value={{
      showModal,
      hideModal,
      showWarning,
      showError,
      showSuccess,
      showInfo,
    }}>
      {children}

      <AppWarningModal
        visible={state.visible}
        onClose={hideModal}
        onConfirm={state.onConfirm}
        type={state.type}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
      />
    </AppModalContext.Provider>
  );
};


export const useAppModal = () => {
  const ctx = useContext(AppModalContext);
  if (!ctx) throw new Error('useAppModal must be used inside AppModalProvider');
  return ctx;
};