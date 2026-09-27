import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import styles from './DiscardChangesDialog.module.css';

const DiscardChangesDialog = forwardRef(({ onDiscard, onClose }, ref) => {
    const dialogRef = useRef(null);
    // Локальное состояние диалога для хранения динамических данных
    const [dialogData, setDialogData] = useState(null);

    useImperativeHandle(ref, () => ({
        // Теперь метод принимает данные из любого места, где вызывается
        showModal: (data) => {
            console.log(data);
            setDialogData(data); // Сохраняем переданные данные
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null); // Очищаем данные при закрытии
        }
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
        onClose();
    };

    const handleConfirm = () => {
        // Передаем данные обратно в родительский обработчик «Да»
        onDiscard(dialogData); 
        dialogRef.current?.close();
        setDialogData(null);
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            {/* Используем данные, если они пришли, или выводим дефолтный текст */}
            В текущий запрос '{dialogData?.requestName || ''}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. 
            Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.
            <br />
            Отменить изменения?
            
            <div className={styles.dialog_buttons}>
                <button type="button" onClick={handleConfirm}>
                    Да
                </button>
                <button type="button" onClick={handleDialogClose}>
                    Нет
                </button>
            </div>
        </dialog>
    );
});

DiscardChangesDialog.displayName = 'DiscardChangesDialog';
export default DiscardChangesDialog;