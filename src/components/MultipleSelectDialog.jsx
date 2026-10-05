import { forwardRef, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import styles from "./MultipleSelectDialog.module.css";

const MultipleSelectDialog = forwardRef(({ onApply }, ref) => {
    const dispatch = useDispatch();
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
                    <select name="fruits" id="fruits" multiple size="5">
                        <option value="apple">Яблоко</option>
                        <option value="banana">Банан</option>
                        <option value="orange">Апельсин</option>
                        <option value="cherry">Вишня</option>
                        <option value="kiwi">Киви</option>
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
