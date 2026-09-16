import { text } from 'express';
import styles from './QueryForm.module.css';
import QueryToolBar from './QueryToolBar';
const QueryForm = () => {
    return (
        <>
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
                    <select name="select">
                        <option value="value1">Только связанные</option>
                        <option value="value2">Только принадлежащие</option>
                        <option value="value3" selected>
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
                    <input type="text" readonly></input>
                </div>
                <div className={`${styles.item} ${styles.level_setup_btn}`}>
                    <button>Настроить</button>
                </div>
            </div>
        </>
    );
};

export default QueryForm;
