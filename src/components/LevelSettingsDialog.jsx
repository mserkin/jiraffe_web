import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import styles from './LevelSettingsDialog.module.css'; 

const LevelSettingsDialog = forwardRef(({ onApply }, ref) => {
    const dialogRef = useRef(null);
    const [dialogData, setDialogData] = useState(null);
    
    // Передаем методы showModal и close в родительский компонент
    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            setDialogData(data);
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null);
        }
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
    };

    const handleConfirm = () => {
        // Передаем данные обратно в родительский обработчик «Да»
        onApply(dialogData); 
        dialogRef.current?.close();
        setDialogData(null);
    };


    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            Пока это пустышка, но тут будет окно с настройками уровня
            <br />
            <div className={styles.dialog_buttons}>
                <button type="button" onClick={handleConfirm}>
                    Ok
                </button>
                <button type="button" onClick={handleDialogClose}>
                    Cancel
                </button>
            </div>
        </dialog>
    );
});

LevelSettingsDialog.displayName = 'LevelSettingsDialog';

export default LevelSettingsDialog;
