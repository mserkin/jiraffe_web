import { useDispatch } from 'react-redux';
import { setIsQueryChanged } from '../redux/slices/statusSlice';
import styles from './QueryForm.module.css';
import QueryToolBar from './QueryToolBar';

const QueryForm = () => {
    const dispatch = useDispatch();

    const handleSubmit = (event) => {
        console.log(e);
        event.preventDefault();
    };

    const handleSetupLevelClick = () => {
        console.log("handleSetupLevelClick");
        dispatch(setIsQueryChanged(true));
    };

    const handleAddLevelClick = () => {
        console.log("handleAddLevelClick");
        dispatch(setIsQueryChanged(true));
    };
    
    const handleLevelSettingsChanged = () => {
        console.log("handleLevelSettingsChanged");
        dispatch(setIsQueryChanged(true));
    }

    const handleEpicChoiceChanged = () => {
        console.log("handleEpicChoiceChanged");
        dispatch(setIsQueryChanged(true));
    }

    const handleQueryChanged = () => {
        console.log("handleQueryChanged");
        dispatch(setIsQueryChanged(true));
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <QueryToolBar />
            <div className={styles.gridContainer}>
                <div className={`${styles.item} ${styles.query_label}`}>
                    Запрос:
                </div>
                <div className={`${styles.item} ${styles.query}`}>
                    <input id="query_input" type="text" placeholder="Текст запроса" onChange={handleQueryChanged}></input>
                </div>
                <div className={`${styles.item} ${styles.epic_label}`}>
                    У эпиков показывать
                </div>
                <div className={`${styles.item} ${styles.epic_choice}`}>
                    <select id="epic_choice" name="select" defaultValue="linkedAndChildren" onChange={handleEpicChoiceChanged}>
                        <option value="linkedOnly">Только связанные</option>
                        <option value="childrenOnly">Только принадлежащие</option>
                        <option value="linkedAndChildren">
                            И связанные и принадлежащие
                        </option>
                    </select>
                </div>
                <div className={`${styles.item} ${styles.level_label}`}>
                    Уровень 1
                </div>
                <div className={`${styles.item} ${styles.level_settings}`}>
                    <textarea id="level_settings" onChange={handleLevelSettingsChanged}></textarea>
                </div>
                <div className={`${styles.item} ${styles.level_setup_btn}`}>
                    <button id="level_setup_btn" type="button" onClick={handleSetupLevelClick}>Настроить</button>
                </div>
                <div className={`${styles.item} ${styles.add_level_btn}`}>
                    <button id="add_level_btn" type="button" className={styles.addLevelButton} onClick={handleAddLevelClick}>Добавить уровень</button>
                </div>
            </div>
        </form>
    );
};

export default QueryForm;
