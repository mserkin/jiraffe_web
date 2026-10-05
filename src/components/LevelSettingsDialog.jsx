import { forwardRef, useRef, useImperativeHandle, useState } from "react";

import styles from "./LevelSettingsDialog.module.css";
import {
    fetchJiraMetadata,
    selectIssueTypes,
} from "../redux/slices/jiraMetadata";
import { useDispatch, useSelector } from "react-redux";
import MultipleSelectDialog from "./MultipleSelectDialog";

const LevelSettingsDialog = forwardRef(({ onApply }, ref) => {
    const dispatch = useDispatch();
    const dialogRef = useRef(null);
    const multipleSelectDialogRef = useRef(null);
    const [dialogData, setDialogData] = useState(null);
    const issueTypes = useSelector(selectIssueTypes);

    // Передаем методы showModal и close в родительский компонент
    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            console.log(
                `LevelSettingsDialog.showModal(${JSON.stringify(data)}) executed`,
            );
            setDialogData(data);
            console.log(`dialogData=${dialogData}`);
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
        if (!dialogData) {
            dialogRef.current?.close();
            return;
        }

        onApply(dialogData);
        dialogRef.current?.close();
        setDialogData(null);
    };

    const handleMultipleSelectApply = (selectedIssueTypes) => {
        setDialogData((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                levelFilters: {
                    ...(prev.levelFilters ?? {}),
                    issueTypeFilter: selectedIssueTypes,
                },
            };
        });
    };

    const changeFilterButtonOnClick = (event) => {
        console.log(`event.target.id=${event.target.id}`);
        switch (event.target.id) {
            case "changeTypeFilterButton":
                console.log(`changeTypeFilterButton clicked`);
                const newDialogData = {
                    dialogHeader: "Фильтр по типам задач",
                    levelIndex: dialogData?.levelIndex,
                    selectedIssueTypes: dialogData?.levelFilters?.issueTypeFilter ?? [],
                };
                console.log(`newDialogData=${JSON.stringify(newDialogData)}`);
                multipleSelectDialogRef.current?.showModal(newDialogData);
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

    function getIssueTypeDisplayList() {
        return (dialogData?.levelFilters?.issueTypeFilter ?? [])
            .map((it) => issueTypes.find((t) => t.id === it)?.name ?? "")
            .filter((n) => !!n)
            .join(", ");
    }

    return (
        <>
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
                            id="summaryTextarea"
                            value={
                                dialogData?.levelFilters?.summaryFilter ?? ""
                            }
                            onChange={(event) => {
                                setDialogData((prev) => {
                                    if (!prev) {
                                        return prev;
                                    }

                                    return {
                                        ...prev,
                                        levelFilters: {
                                            ...(prev.levelFilters ?? {}),
                                            summaryFilter: event.target.value,
                                        },
                                    };
                                });
                            }}
                        ></textarea>
                    </div>
                    <div className={styles.type_label}>Тип:</div>
                    <div className={styles.type_textarea}>
                        <textarea
                            id="typeTextarea"
                            value={getIssueTypeDisplayList()}
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
                        <textarea id="statusTextarea" readOnly></textarea>
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
                        <textarea id="sprintTextarea" readOnly></textarea>
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
                    <div className={styles.creator_textarea}>
                        <textarea id="creatorTextarea" readOnly></textarea>
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
                        <textarea id="assigneeTextarea" readOnly></textarea>
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
                        <textarea id="reporterTextarea" readOnly></textarea>
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
                        <textarea id="linkTypesTextarea" readOnly></textarea>
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
            <MultipleSelectDialog
                ref={multipleSelectDialogRef}
                onApply={handleMultipleSelectApply}
            />
        </>
    );
});

LevelSettingsDialog.displayName = "LevelSettingsDialog";

export default LevelSettingsDialog;
