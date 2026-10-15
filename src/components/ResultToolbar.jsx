import { VscCollapseAll, VscDownload, VscExpandAll } from "react-icons/vsc";
import styles from "./ResultToolbar.module.css";

const ResultToolbar = () => {
    const handleExpandAllClick = (e) => {
        e.preventDefault();
    };

    const handleCollapseAllClick = (e) => {
        e.preventDefault();
    };

    const handleExportClick = (e) => {
        e.preventDefault();
    };

    return (
        <ul className={styles.toolbar}>
            <li
                className={styles.toolbarIconItem}
                onClick={handleExpandAllClick}
            >
                <VscExpandAll size={32} />
            </li>
            <li
                className={styles.toolbarIconItem}
                onClick={handleCollapseAllClick}
            >
                <VscCollapseAll size={32} />
            </li>
            <li className={styles.toolbarIconItem} onClick={handleExportClick}>
                <VscDownload size={32} />
            </li>
        </ul>
    );
};

export default ResultToolbar;
