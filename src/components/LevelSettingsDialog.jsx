import { forwardRef, useRef, useImperativeHandle, useState } from "react";

import styles from "./LevelSettingsDialog.module.css";
import {
    fetchJiraMetadata,
    selectIssueTypes,
    selectSprints,
} from "../redux/slices/jiraMetadata";
import { useDispatch, useSelector } from "react-redux";
import MultipleSelectDialog from "./MultipleSelectDialog";

const LevelSettingsDialog = forwardRef(({ onApply }, ref) => {
    const dispatch = useDispatch();
    const dialogRef = useRef(null);
    const multipleSelectDialogRef = useRef(null);
    const [dialogData, setDialogData] = useState(null);
    const issueTypes = useSelector(selectIssueTypes);
    const sprints = useSelector(selectSprints);

    // Передаем методы showModal и close в родительский компонент
    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            console.log(
                `LevelSettingsDialog.showModal(${JSON.stringify(data)}) executed`,
            );
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
        if (!dialogData) {
            dialogRef.current?.close();
            return;
        }

        onApply(dialogData);
        dialogRef.current?.close();
        setDialogData(null);
    };

    const handleMultipleSelectApply = (data) => {
        console.log(`handleMultipleSelectApply(${JSON.stringify(data)})`);
        setDialogData((prev) => {
            if (!prev) {
                return prev;
            }

            switch (data.mode) {
                case "selectIssueTypes":
                    return {
                        ...prev,
                        levelFilters: {
                            ...(prev.levelFilters ?? {}),
                            issueTypeFilter: data.selectedOptions,
                        },
                    };
                case "selectStatuses":
                    const newVal = {
                        ...prev,
                        levelFilters: {
                            ...(prev.levelFilters ?? {}),
                            statusFilter: data.selectedOptions.map((s) =>
                                (([issueType, statusId]) => ({
                                    issueType,
                                    statusId,
                                }))(s.split("$")),
                            ),
                        },
                    };
                    console.log(`newVal=${JSON.stringify(newVal)}`);
                    return newVal;
                case "selectSprints":
                    const newSprints = {
                        ...prev,
                        levelFilters: {
                            ...(prev.levelFilters ?? {}),
                            sprintFilter: data.selectedOptions.map(spid => parseInt(spid)),
                        },
                    };
                    console.log(`newSprints=${newSprints}`)
                    return newSprints;
            }
        });
    };

    const changeFilterButtonOnClick = (event) => {
        console.log(`event.target.id=${event.target.id}`);
        switch (event.target.id) {
            case "changeTypeFilterButton":
                console.log(`changeTypeFilterButton clicked`);
                const data = {
                    mode: "selectIssueTypes",
                    dialogHeader: "Фильтр по типам задач",
                    levelIndex: dialogData?.levelIndex,
                    options: issueTypes.map((it) => {
                        return { id: it.id, name: it.name };
                    }),
                    selectedOptions:
                        dialogData?.levelFilters?.issueTypeFilter ?? [],
                };
                console.log(`data=${JSON.stringify(data)}`);
                multipleSelectDialogRef.current?.showModal(data);
                break;
            case "changeStatusFilterButton":
                console.log(`changeTypeFilterButton clicked`);
                const data2 = {
                    mode: "selectStatuses",
                    dialogHeader: "Фильтр по статусам",
                    levelIndex: dialogData?.levelIndex,
                    options: issueTypes
                        .filter((it) =>
                            dialogData?.levelFilters?.issueTypeFilter.includes(
                                it.id,
                            ),
                        )
                        .map((it) =>
                            it.statuses.map((st) => {
                                return {
                                    id: it.id + "$" + st.id,
                                    name: it.name + " - " + st.name,
                                };
                            }),
                        )
                        .flat(),
                    selectedOptions: (
                        dialogData?.levelFilters?.statusFilter ?? []
                    ).map((st) => st.issueType + "$" + st.statusId),
                };
                console.log(`data2=${JSON.stringify(data2)}`);
                multipleSelectDialogRef.current?.showModal(data2);
                break;
            case "changeSprintFilterButton":
                console.log(`changeSprintFilterButton clicked`);
                const data3 = {
                    mode: "selectSprints",
                    dialogHeader: "Фильтр по спринтам",
                    levelIndex: dialogData?.levelIndex,
                    options: sprints.map((sp) => {
                        return { id: sp.id, name: sp.name };
                    }),
                    selectedOptions:
                        dialogData?.levelFilters?.sprintFilter ?? [],
                };
                console.log(`data=${JSON.stringify(data3)}`);
                multipleSelectDialogRef.current?.showModal(data3);
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

    function getStatusDisplayList() {
        console.log("getStatusDisplayList executed");
        return (dialogData?.levelFilters?.statusFilter ?? [])
            .map(
                (st) =>
                    (issueTypes.find((t) => t.id === st.issueType)?.name ??
                        "") +
                        " - " +
                        issueTypes
                            .find((t) => t.id === st.issueType)
                            ?.statuses.find((s) => s.id === st.statusId)
                            ?.name ?? "",
            )
            .filter((n) => !!n)
            .join(", ");
    }

    function getSprintDisplayList() {
        console.log("getSprintDisplayList executed");
        return (dialogData?.levelFilters?.sprintFilter ?? [])
            .map((sp) => sprints.find((s) => s.id === sp)?.name ?? "")
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
                        <textarea
                            id="statusTextarea"
                            value={getStatusDisplayList()}
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
                            id="sprintTextarea"
                            value={getSprintDisplayList()}
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
