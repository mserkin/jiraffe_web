import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import styles from './ConfirmationDialog.module.css';
import { getEntriesWithValuesStr } from '../modules/utils';

const ConfirmationDialog = forwardRef(({ onConfirm, onReject }, ref) => {
    const dialogRef = useRef(null);
    // Локальное состояние диалога для хранения динамических данных
    const [dialogData, setDialogData] = useState(null);

    useImperativeHandle(ref, () => ({
        // Используемые поля data:
        // message - текст сообщения
        // question - вопрос
        // confirmButtonText - текст на кнопке подтверждения
        // rejectButtonText - текст на кнопке отказа
        
        showModal: (data) => {
            console.log(`showModal(${getEntriesWithValuesStr(data)}) executed`);
            setDialogData(data); // Сохраняем переданные данные
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null); // Очищаем данные при закрытии
        }
    }));

    const handleReject = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
        onReject();
    };

    const handleConfirm = () => {
        // Передаем данные обратно в родительский обработчик «Да»
        onConfirm(dialogData); 
        dialogRef.current?.close();
        setDialogData(null);
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            {dialogData?.message || ''}
            <br />
            {dialogData?.question || ''}
            <div className={styles.dialog_buttons}>
                <button type="button" onClick={handleConfirm}>
                    {dialogData?.confirmButtonText || 'Да'}
                </button>
                <button type="button" onClick={handleReject}>
                    {dialogData?.rejectButtonText || 'Нет'}
                </button>
            </div>
        </dialog>
    );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';
export default ConfirmationDialog;