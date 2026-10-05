import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import styles from "./MultipleSelectDialog.module.css";

const MultipleSelectDialog = forwardRef(({ onApply }, ref) => {
    const dialogRef = useRef(null);
    const [dialogData, setDialogData] = useState(null);

    // Передаем методы showModal и close в родительский компонент
    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            console.log(
                `MultipleSelectDialog.showModal(${JSON.stringify(data)}) executed`,
            );
            setDialogData(data);
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null);
        },
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
    };

    const handleConfirm = () => {
        if (!dialogData) {
            dialogRef.current?.close();
            return;
        }

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
            <div>
                <div className={styles.dialog_header}>
                    {dialogData ? dialogData.dialogHeader : ""}
                </div>
                <div>Выберите элементы (Ctrl - снять выбор)</div>
                <div>
                    <select name="options" id="options" className={styles.select} multiple size="5">
                    </select>
                </div>
            </div>
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

MultipleSelectDialog.displayName = "MultipleSelectDialog";

export default MultipleSelectDialog;
