import { VscCollapseAll, VscDownload, VscExpandAll } from "react-icons/vsc";
import styles from "./ResultToolbar.module.css";

const ResultToolbar = ({ onExpandAll, onCollapseAll }) => {
    const handleExpandAllClick = (e) => {
        e.preventDefault();
        onExpandAll?.();
    };

    const handleCollapseAllClick = (e) => {
        e.preventDefault();
        onCollapseAll?.();
    };

    const handleExportClick = (e) => {
        e.preventDefault();
    };

    return (
        <ul className={styles.toolbar}>
            <li
                className={styles.toolbarIconItem}
            >
                <button
                    type="button"
                    aria-label="Развернуть все элементы"
                    title="Развернуть все элементы"
                    onClick={handleExpandAllClick}
                >
                    <VscExpandAll size={32} />
                </button>
            </li>
            <li
                className={styles.toolbarIconItem}
            >
                <button
                    type="button"
                    aria-label="Свернуть все элементы"
                    title="Свернуть все элементы"
                    onClick={handleCollapseAllClick}
                >
                    <VscCollapseAll size={32} />
                </button>
            </li>
            <li className={styles.toolbarIconItem}>
                <button
                    type="button"
                    aria-label="Экспортировать результаты"
                    title="Экспортировать результаты"
                    onClick={handleExportClick}
                >
                    <VscDownload size={32} />
                </button>
            </li>
        </ul>
    );
};

export default ResultToolbar;
