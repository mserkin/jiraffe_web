import React from "react";
import { useRef } from "react";
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

const QueryForm = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const levelFilters = useSelector(selectLevelFilters);
    const levelSettingsDialogRef = useRef(null);

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleSetupLevelClick = (levelIndex) => {
        console.log("handleSetupLevelClick");
        console.log(`levelIndex: ${levelIndex}`)
        const dialogData = {
            levelIndex,
            levelFilters: levelFilters[levelIndex],
        }
        console.log(`dialogData=${JSON.stringify(dialogData)}`)
        levelSettingsDialogRef.current?.showModal(dialogData);
    };

    const handleAddLevelClick = () => {
        console.log("handleAddLevelClick");
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
        console.log(`handleLevelSettingsApply(${JSON.stringify(dialogData)}) executed` );
        dispatch(setLevelFilters(dialogData.levelFilters));
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
                    {levelFilters ? levelFilters.map((filters, index) => (
                        <React.Fragment key={`level-${index}`}>
                            <div
                                className={`${styles.item} ${styles.level_label}`}
                            >
                                Уровень {index}
                            </div>
                            <div
                                className={`${styles.item} ${styles.level_settings}`}
                            >
                                <textarea 
                                    id={"level_settings-"+index}
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
                    )) : ''}
                    <div className={`${styles.item} ${styles.add_level_btn}`}>
                        <button
                            id="add_level_btn"
                            type="button"
                            className={styles.addLevelButton}
                            onClick={handleAddLevelClick}
                        >
                            Добавить уровень
                        </button>
                    </div>
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
