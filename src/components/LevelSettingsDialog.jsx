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
            console.log(`LevelSettingsDialog.showModal(${JSON.stringify(data)}) executed`)
            setDialogData(data);
            console.log(`dialogData=${dialogData}`)
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
                <div className={styles.summary_textarea}>
                    <textarea
                        id="SummaryTextarea"
                        value={dialogData ? dialogData.levelFilters.summaryFilter : ""}
                        onChange={(event) => {dispatch(setDialogData({
                            ...dialogData,
                            levelFilters: {
                                ...dialogData.levelFilters,
                                summaryFilter: event.target.value
                            }
                        }));}}
                    ></textarea>
                </div>
                <div className={styles.type_label}>Тип:</div>
                <div className={styles.type_textarea}>
                    <textarea
                        id="TypeTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.type_change_button}>
                    <button
                        id="changeTypeFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.status_label}>Статус:</div>
                <div className={styles.status_textarea}>
                    <textarea
                        id="StatusTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.status_change_button}>
                    <button
                        id="changeStatusFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.sprint_label}>Спринт:</div>
                <div className={styles.sprint_textarea}>
                    <textarea
                        id="SprintTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.sprint_change_button}>
                    <button
                        id="changeSprintFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.creator_label}>Создатель:</div>
                <div className={styles.creator_textarea}    >
                    <textarea
                        id="CreatorTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.creator_change_button}>
                    <button
                        id="changeCreatorFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.assignee_label}>Исполнитель:</div>
                <div className={styles.assignee_textarea}>
                    <textarea
                        id="AssigneeTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.assignee_change_button}>
                    <button
                        id="changeAssigneeFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.reporter_label}>Ответственный:</div>
                <div className={styles.reporter_textarea}>
                    <textarea
                        id="ReporterTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.reporter_change_button}>
                    <button
                        id="changeReporterFilterButton"
                        onClick={changeFilterButtonOnClick}
                    >
                        Изменить
                    </button>
                </div>
                <div className={styles.link_types_label}>Связана:</div>
                <div className={styles.link_types_textarea}>
                    <textarea
                        id="LinkTypesTextarea"
                        readOnly
                    ></textarea>
                </div>
                <div className={styles.link_types_change_button}>
                    <button
                        id="changeLinkTypesFilterButton"
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
