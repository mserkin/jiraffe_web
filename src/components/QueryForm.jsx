import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";

import { setIsQueryChanged } from "../redux/slices/statusSlice";
import styles from "./QueryForm.module.css";
import QueryToolBar from "./QueryToolBar";
import {
    selectOpenQuery,
    setQueryText,
    setEpicViewType,
    setLevelFilters,
} from "../redux/slices/openQuerySlice";
import LevelSettingsDialog from "./LevelSettingsDialog";

const QueryForm = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const levelSettingsDialogRef = useRef(null);

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleSetupLevelClick = (event) => {
        console.log("handleSetupLevelClick");
        event.preventDefault();
        event.stopPropagation();

        // Метод вызовется точно так же, как и раньше
        levelSettingsDialogRef.current?.showModal();
    };

    const handleAddLevelClick = () => {
        console.log("handleAddLevelClick");
        dispatch(setIsQueryChanged(true));
    };

    const handleLevelSettingsChanged = () => {
        console.log("handleLevelSettingsChanged");
        dispatch(setIsQueryChanged(true));
    };

    const handleEpicChoiceChanged = () => {
        console.log("handleEpicChoiceChanged");
        dispatch(setEpicViewType(document.getElementById("epic_choice").value));
        dispatch(setIsQueryChanged(true));
    };

    const handleQueryTextChanged = () => {
        console.log("handleQueryChanged");
        dispatch(setQueryText(document.getElementById("query_input").value));
        dispatch(setIsQueryChanged(true));
    };

    const handleLevelSettingsApply = () => {
        // Ваша логика сброса изменений
        levelSettingsDialogRef.current?.close();
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
                    <div className={`${styles.item} ${styles.level_label}`}>
                        Уровень 1
                    </div>
                    <div className={`${styles.item} ${styles.level_settings}`}>
                        <textarea
                            id="level_settings"
                            onChange={handleLevelSettingsChanged}
                        ></textarea>
                    </div>
                    <div className={`${styles.item} ${styles.level_setup_btn}`}>
                        <button
                            id="level_setup_btn"
                            type="button"
                            onClick={handleSetupLevelClick}
                        >
                            Настроить
                        </button>
                    </div>
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
