import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import styles from "./TextInputDialog.module.css";

const TextInputDialog = forwardRef(({ onOk, onCancel }, ref) => {
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
        },
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
        onCancel();
    };

    const handleConfirm = () => {
        // Передаем данные обратно в родительский обработчик «Да»
        onOk(dialogData);
        dialogRef.current?.close();
        setDialogData(null);
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            <p>{dialogData?.prompt || ""}</p>
            <input
                type="text"
                value={dialogData?.requestName || ""}
                className={styles.query_name_input}
                onChange={(event) => setDialogData({...dialogData, requestName: event.target.value})}
                autoFocus
            />
            <div className={styles.dialog_buttons}>
                <button type="button" onClick={handleConfirm}>
                    Ok
                </button>
                <button type="button" onClick={handleDialogClose}>
                    Отмена
                </button>
            </div>
        </dialog>
    );
});

TextInputDialog.displayName = "TextInputDialog";
export default TextInputDialog;
