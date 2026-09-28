import React, { createContext, useContext, useRef } from 'react';
import ConfirmationDialog from './components/ConfirmationDialog';

const ConfirmationDialogContext = createContext(null);

export const ConfirmationDialogProvider = ({ children }) => {
    const dialogRef = useRef(null);
    const handlersRef = useRef({ onConfirm: () => {}, onReject: () => {} });

    const showModal = (data, onConfirm = () => {}, onReject = () => {}) => {
        handlersRef.current = { onConfirm, onReject };
        dialogRef.current?.showModal(data);
    };

    const close = () => {
        dialogRef.current?.close();
        handlersRef.current = { onConfirm: () => {}, onReject: () => {} };
    };

    const handleConfirm = (data) => {
        try {
            handlersRef.current.onConfirm(data);
        } finally {
            // close after invoking
            close();
        }
    };

    const handleReject = () => {
        try {
            handlersRef.current.onReject();
        } finally {
            close();
        }
    };

    return (
        <ConfirmationDialogContext.Provider value={{ showModal, close }}>
            {children}
            <ConfirmationDialog ref={dialogRef} onConfirm={handleConfirm} onReject={handleReject} />
        </ConfirmationDialogContext.Provider>
    );
};

export const useConfirmationDialog = () => {
    const ctx = useContext(ConfirmationDialogContext);
    if (!ctx) {
        throw new Error('useConfirmationDialog must be used within ConfirmationDialogProvider');
    }
    return ctx;
};

export default ConfirmationDialogContext;