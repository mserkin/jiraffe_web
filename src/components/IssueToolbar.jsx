import { VscOpenInWindow } from "react-icons/vsc";

import styles from "./IssueToolbar.module.css";

const IssueToolbar = () => {
    const handleOpenInBrowserClick = (event) => {
        event.preventDefault();
    }

    return (
        <ul className={styles.toolbar}>
            <li
                className={styles.toolbarIconItem}
                onClick={handleOpenInBrowserClick}
            >
                <VscOpenInWindow size={32} />
            </li>
        </ul>
    );
};

export default IssueToolbar;
