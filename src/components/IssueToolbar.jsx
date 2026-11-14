import { VscOpenInWindow } from "react-icons/vsc";

import styles from "./IssueToolbar.module.css";
import { selectSelectedIssue } from "../redux/slices/selectedIssueSlice";
import { useSelector } from "react-redux";
import { selectJiraServer } from "../redux/slices/settingsSlice";
import { JIRA_ISSUE_URL_PATH } from "../modules/const";

const IssueToolbar = () => {
    const selectedIssue = useSelector(selectSelectedIssue);
    const jiraServer = useSelector(selectJiraServer);

    const handleOpenInBrowserClick = (event) => {
        event.preventDefault();
        if (selectedIssue.key === null) {
            return;
        }

        window.open(
            `${jiraServer}${JIRA_ISSUE_URL_PATH}${selectedIssue.key}`,
            "_blank",
            "noopener,noreferrer",
        );
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
