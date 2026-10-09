import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setIsQueryChanged } from "../redux/slices/statusSlice";
import styles from "./QueryForm.module.css";
import QueryToolBar from "./QueryToolBar";
import {
    selectOpenQuery,
    setQueryText,
    setEpicViewType,
    selectLevelFilters,
    setLevelFilters,
} from "../redux/slices/openQuerySlice";
import LevelSettingsDialog from "./LevelSettingsDialog";
import {
    fetchJiraMetadata,
    selectIssueTypes,
    selectLinkTypes,
    selectSprints,
} from "../redux/slices/jiraMetadata";
import { BACKEND_URI, SETTINGS_PATH_PART } from "../modules/const";
import {
    fetchSettings,
    selectTeamMembers,
} from "../redux/slices/settingsSlice";

const QueryForm = () => {
    const dispatch = useDispatch();
    const metadataFetchStarted = useRef(false);
    const openQuery = useSelector(selectOpenQuery);
    const levelFilters = useSelector(selectLevelFilters);
    const levelFiltersList = Array.isArray(levelFilters) ? levelFilters : [];
    const levelSettingsDialogRef = useRef(null);
    const issueTypes = useSelector(selectIssueTypes);
    const linkTypes = useSelector(selectLinkTypes);
    const teamMembers = useSelector(selectTeamMembers);
    const sprints = useSelector(selectSprints);
    const ROLE_DISPLAY_NAME = {
        creator: "созд.",
        assignee: "исполн.",
        reporter: "отв.",
    };

    useEffect(() => {
        if (metadataFetchStarted.current) return;

        metadataFetchStarted.current = true;
        dispatch(fetchJiraMetadata());
        dispatch(fetchSettings({ url: BACKEND_URI + SETTINGS_PATH_PART }));
    }, [dispatch]);

    function getSummaryFilterDisplayString(index) {
        const summary = levelFilters?.[index]?.summaryFilter;
        if (!summary) return "";
        return `имя ~ ${summary}`;
    }
    function getIssueTypeFilterDisplayString(index) {
        const types = levelFilters?.[index]?.issueTypeFilter ?? [];
        return types.length > 0
            ? `тип: ${types
                  .map((it) => issueTypes.find((t) => t.id === it)?.name ?? "")
                  .filter((t) => !!t)
                  .join(", ")}`
            : "";
    }

    function getStatusFilterDisplayString(index) {
        const statuses = levelFilters?.[index]?.statusFilter ?? [];
        return statuses.length > 0
            ? `статус: ${statuses
                  .map(
                      (st) =>
                          (issueTypes.find((t) => t.id === st.issueType)
                              ?.name ?? "") +
                              " - " +
                              issueTypes
                                  .find((t) => t.id === st.issueType)
                                  ?.statuses.find((s) => s.id === st.statusId)
                                  ?.name ?? "",
                  )
                  .join(", ")}`
            : "";
    }

    function getSprintFilterDisplayString(index) {
        const sprints_filter = levelFilters?.[index]?.sprintFilter ?? [];
        return sprints_filter.length > 0
            ? `спринт: ${sprints_filter
                  .map((sp) => sprints.find((s) => s.id === sp)?.name ?? "")
                  .filter((t) => !!t)
                  .join(", ")}`
            : "";
    }

    function getTeamMemberFilterDisplayString(role, index) {
        const propName = `${role}LoginFilter`;
        console.log(`propName=${propName}`);
        const members = levelFilters?.[index]?.[propName] ?? [];
        return members.length > 0
            ? `${ROLE_DISPLAY_NAME[role]}: ${(members ?? [])
                  .map(
                      (tmid) =>
                          teamMembers.find((s) => s.login === tmid)?.name ?? "",
                  )
                  .filter((t) => !!t)
                  .join(", ")}`
            : "";
    }

    function getLintTypeFilterDisplayString(index) {
        const types = levelFilters?.[index]?.linkTypeFilter ?? [];
        return types.length > 0
            ? `связаны: ${types
                  .map((lt) => linkTypes.find((s) => s.id === lt)?.name ?? "")
                  .filter((t) => !!t)
                  .join(", ")}`
            : "";
    }

    const getFilterDisplayString = (index) =>
        [
            getSummaryFilterDisplayString(index),
            getIssueTypeFilterDisplayString(index),
            getStatusFilterDisplayString(index),
            getSprintFilterDisplayString(index),
            getTeamMemberFilterDisplayString("creator", index),
            getTeamMemberFilterDisplayString("assignee", index),
            getTeamMemberFilterDisplayString("reporter", index),
            index > 0 ? getLintTypeFilterDisplayString(index) : "",
        ]
            .filter((s) => !!s)
            .join("; ");

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleSetupLevelClick = (levelIndex) => {
        console.log("handleSetupLevelClick");
        console.log(`levelIndex: ${levelIndex}`);
        const dialogData = {
            levelIndex,
            levelFilters: levelFiltersList[levelIndex] ?? {},
        };
        console.log(`dialogData=${JSON.stringify(dialogData)}`);
        levelSettingsDialogRef.current?.showModal(dialogData);
    };

    const handleAddLevelClick = () => {
        console.log("handleAddLevelClick");
        dispatch(setLevelFilters([...levelFiltersList, {}]));
        dispatch(setIsQueryChanged(true));
    };

    const handleLevelSettingsChanged = () => {
        console.log("handleLevelSettingsChanged");
        dispatch(setIsQueryChanged(true));
    };

    const handleEpicChoiceChanged = (event) => {
        console.log("handleEpicChoiceChanged");
        dispatch(setEpicViewType(event.target.value));
        dispatch(setIsQueryChanged(true));
    };

    const handleQueryTextChanged = (event) => {
        console.log("handleQueryChanged");
        dispatch(setQueryText(event.target.value));
        dispatch(setIsQueryChanged(true));
    };

    const handleLevelSettingsApply = (dialogData) => {
        if (!dialogData || dialogData.levelIndex === undefined) {
            return;
        }

        const nextLevelFilters = [...levelFiltersList];
        nextLevelFilters[dialogData.levelIndex] = dialogData.levelFilters ?? {};

        console.log(
            `handleLevelSettingsApply(${JSON.stringify(dialogData)}) executed`,
        );
        dispatch(setLevelFilters(nextLevelFilters));
        console.log(`levelFilters have been set`);
        dispatch(setIsQueryChanged(true));
    };

    return (
        <>
            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <QueryToolBar />
                <div className={styles.gridContainer}>
                    <div className={`${styles.item} ${styles.query_label}`}>
                        Запрос:
                    </div>
                    <div className={`${styles.item} ${styles.query}`}>
                        <input
                            id="query_input"
                            type="text"
                            placeholder="Текст запроса"
                            value={
                                openQuery.queryText ? openQuery.queryText : ""
                            }
                            onChange={handleQueryTextChanged}
                        />
                    </div>
                    <div className={`${styles.item} ${styles.epic_label}`}>
                        У эпиков показывать
                    </div>
                    <div className={`${styles.item} ${styles.epic_choice}`}>
                        <select
                            id="epic_choice"
                            name="select"
                            value={
                                openQuery.epicViewType
                                    ? openQuery.epicViewType
                                    : "linkedAndChildren"
                            }
                            onChange={handleEpicChoiceChanged}
                        >
                            <option value="linkedOnly">Только связанные</option>
                            <option value="childrenOnly">
                                Только принадлежащие
                            </option>
                            <option value="linkedAndChildren">
                                И связанные и принадлежащие
                            </option>
                        </select>
                    </div>
                    {levelFiltersList.map((filters, index) => (
                        <React.Fragment key={`level-${index}`}>
                            <div
                                className={`${styles.item} ${styles.level_label}`}
                            >
                                Уровень {index + 1}
                            </div>
                            <div
                                className={`${styles.item} ${styles.level_settings}`}
                            >
                                <textarea
                                    id={"level_settings-" + index}
                                    value={getFilterDisplayString(index)}
                                    onChange={handleLevelSettingsChanged}
                                ></textarea>
                            </div>
                            <div
                                className={`${styles.item} ${styles.level_setup_btn}`}
                            >
                                <button
                                    id={"level_setup_btn-" + (index + 1)}
                                    type="button"
                                    onClick={() => handleSetupLevelClick(index)}
                                >
                                    Настроить
                                </button>
                            </div>
                        </React.Fragment>
                    ))}
                    {levelFiltersList.length < 4 && (
                        <div
                            className={`${styles.item} ${styles.add_level_btn}`}
                        >
                            <button
                                id="add_level_btn"
                                type="button"
                                className={styles.addLevelButton}
                                onClick={handleAddLevelClick}
                            >
                                Добавить уровень
                            </button>
                        </div>
                    )}
                </div>
            </form>
            <LevelSettingsDialog
                ref={levelSettingsDialogRef}
                onApply={handleLevelSettingsApply}
            />
        </>
    );
};

export default QueryForm;
