import { forwardRef, useRef, useImperativeHandle, useState } from "react";

import styles from "./LevelSettingsDialog.module.css";
import { fetchJiraMetadata } from "../redux/slices/jiraMetadata";
import { useDispatch } from "react-redux";

const LevelSettingsDialog = forwardRef(({ onApply }, ref) => {
    const dispatch = useDispatch();
    const dialogRef = useRef(null);
    const [dialogData, setDialogData] = useState(null);

    // Передаем методы showModal и close в родительский компонент
    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            setDialogData(data);
            dispatch(fetchJiraMetadata());
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
        // Передаем данные обратно в родительский обработчик «Да»
        onApply(dialogData);
        dialogRef.current?.close();
        setDialogData(null);
    };

    const changeFilterButtonOnClick = (event) => {
        switch (event.target.id) {
            case "changeTypeFilterButton":
                break;
            case "changeStatusFilterButton":
                break;
            case "changeSprintFilterButton":
                break;
            case "changeCreatorFilterButton":
                break;
            case "changeAssigneeFilterButton":
                break;
            case "changeReporterFilterButton":
                break;
            case "changeLinkTypeFilterButton":
                break;
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            <div className={styles.gridContainer}>
                <div className={styles.level_filters_label}>
                    {dialogData
                        ? `Настройки фильтра ${dialogData.levelIndex + 1}-ого уровня`
                        : ""}
                </div>
                <div className={styles.summary_label}>Название:</div>
                <div>
                    <textarea
                        id="SummaryTextarea"
                        className={styles.summary_textarea}
                    ></textarea>
                </div>
                <div className={styles.type_label}>Тип:</div>
                <div>
                    <textarea
                        id="TypeTextarea"
                        className={styles.type_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeTypeFilterButton"
                        className={styles.type_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.status_label}>Статус:</div>
                <div>
                    <textarea
                        id="StatusTextarea"
                        className={styles.status_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeStatusFilterButton"
                        className={styles.status_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.sprint_label}>Спринт:</div>
                <div>
                    <textarea
                        id="SprintTextarea"
                        className={styles.sprint_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeSprintFilterButton"
                        className={styles.sprint_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.creator_label}>Создатель:</div>
                <div>
                    <textarea
                        id="CreatorTextarea"
                        className={styles.creator_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeCreatorFilterButton"
                        className={styles.creator_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.assignee_label}>Исполнитель:</div>
                <div>
                    <textarea
                        id="AssigneeTextarea"
                        className={styles.assignee_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeAssigneeFilterButton"
                        className={styles.assignee_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.reporter_label}>Ответственный:</div>
                <div>
                    <textarea
                        id="ReporterTextarea"
                        className={styles.reporter_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeReporterFilterButton"
                        className={styles.reporter_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.link_types_label}>Связана:</div>
                <div>
                    <textarea
                        id="LinkTypesTextarea"
                        className={styles.link_types_textarea}
                        readOnly
                    ></textarea>
                </div>
                <div>
                    <button
                        id="changeLinkTypesFilterButton"
                        className={styles.link_types_change_button}
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
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

LevelSettingsDialog.displayName = "LevelSettingsDialog";

export default LevelSettingsDialog;
