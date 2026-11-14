import { VscOpenInWindow } from "react-icons/vsc";

import styles from "./IssueToolbar.module.css";
import { selectSelectedIssue } from "../redux/slices/selectedIssueSlice";
import { useSelector } from "react-redux";

const IssueToolbar = () => {
    const selectedIssue = useSelector(selectSelectedIssue);

    const handleOpenInBrowserClick = (event) => {
        event.preventDefault();
    }

    return (
        <ul className={styles.toolbar}>
            <li
                className={
                    selectedIssue.key !== null
                        ? styles.toolbarIconItem
                        : styles.toolbarIconItemDisabled
                }            
                onClick={handleOpenInBrowserClick}
            >
                <VscOpenInWindow size={32} />
            </li>
        </ul>
    );
};

export default IssueToolbar;
