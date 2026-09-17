import styles from './QueryForm.module.css';
import QueryToolBar from './QueryToolBar';
const QueryForm = () => {
    return (
        <form className={styles.formContainer}>
            <QueryToolBar />
            <div className={styles.gridContainer}>
                <div className={`${styles.item} ${styles.query_label}`}>
                    Запрос:
                </div>
                <div className={`${styles.item} ${styles.query}`}>
                    <input type="text" placeholder="Текст запроса"></input>
                </div>
                <div className={`${styles.item} ${styles.epic_label}`}>
                    У эпиков показывать
                </div>
                <div className={`${styles.item} ${styles.epic_choice}`}>
                    <select name="select" defaultValue="linkedAndChildren">
                        <option value="linkedOnly">Только связанные</option>
                        <option value="childrenOnly">Только принадлежащие</option>
                        <option value="linkedAndChildren">
                            И связанные и принадлежащие
                        </option>
                    </select>
                </div>
                <div className={`${styles.item} ${styles.delete_btn}`}>
                    <button>Удалить</button>
                </div>
                <div className={`${styles.item} ${styles.level_label}`}>
                    Уровень 1
                </div>
                <div className={`${styles.item} ${styles.level_settings}`}>
                    <textarea></textarea>
                </div>
                <div className={`${styles.item} ${styles.level_setup_btn}`}>
                    <button>Настроить</button>
                </div>
                <div className={`${styles.item} ${styles.add_level_btn}`}>
                    <button className={styles.addLevelButton}>Добавить уровень</button>
                </div>
            </div>
        </form>
    );
};

export default QueryForm;
