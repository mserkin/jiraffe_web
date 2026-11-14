import { useSelector } from "react-redux";

import { selectSelectedIssue } from "../redux/slices/selectedIssueSlice";
import styles from "./IssuePropertyEditor.module.css";
import {
    selectIssueTypes,
    selectSprints,
} from "../redux/slices/jiraMetadataSlice";
import { selectTeamMembers } from "../redux/slices/settingsSlice";


const IssuePropertyEditor = () => {
    const selectedIssue = useSelector(selectSelectedIssue);
    const issueTypes = useSelector(selectIssueTypes);
    const sprints = useSelector(selectSprints);
    const teamMembers = useSelector(selectTeamMembers);

    const handleSummaryChange = (event) => {}
    const handleStatusChange = (event) => {}
    const handleSprintChange = (event) => {}
    const handleCreatorChange = (event) => {}
    const handleAssigneeChange = (event) => {}
    const handleReporterChange = (event) => {}
    const handleStoryPointsChange = (event) => {}

    function getStatuses(issuetype, issueTypes) {
        const issueType = issueTypes.find((type) => type.name === issuetype);
        return issueType ? issueType.statuses.map((status) => status.name) : [];
    }

    return (
        <div className={styles.gridContainer}>
            <div className={`${styles.field} ${styles.keyDiv}`}>
                <label className={styles.item} htmlFor="issue_key">
                    Ключ
                </label>
                <input
                    id="issue_key"
                    type="text"
                    disabled={true}
                    className={styles.keyInput}
                    value={selectedIssue.key ? selectedIssue.key : ""}
                />
            </div>
            <div className={`${styles.field} ${styles.typeDiv}`}>
                <label className={styles.item} htmlFor="issue_type">
                    Тип
                </label>
                <input
                    id="issue_type"
                    type="text"
                    disabled={true}
                    className={styles.typeInput}
                    value={selectedIssue.issuetype ? selectedIssue.issuetype : ""}
                />
            </div>
            <div className={`${styles.field} ${styles.summary}`}>
                <textarea
                    id="issue_summary"
                    rows={3}
                    className={styles.summaryInput}
                    disabled={selectedIssue.key === null}
                    value={selectedIssue.summary ? selectedIssue.summary : ""}
                    onChange={handleSummaryChange}
                />
            </div>
            <label className={styles.item} htmlFor="issue_status">Статус:</label>
            <div className={styles.item}>
                <select
                    id="issue_status"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.status ? selectedIssue.status : "unknown"
                    }
                    onChange={handleStatusChange}
                >
                    {selectedIssue.key === null ? 
                        <option value="unknown">Неизвестный</option>
                        : 
                        getStatuses(selectedIssue.issuetype, issueTypes).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))
                    }
                </select>                    
            </div>
            <label className={styles.item} htmlFor="issue_sprint">Спринт:</label>
            <div className={styles.item}>
                <select
                    id="issue_sprint"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.sprint ? selectedIssue.sprint : "unknown"
                    }
                    onChange={handleSprintChange}
                >
                    {selectedIssue.key === null ? 
                        <option value="unknown"></option>
                        : 
                        sprints.map((sprint) => (
                            <option key={sprint.id} value={sprint.name}>
                                {sprint.name}
                            </option>
                        ))
                    }
                </select>
            </div>
            <label className={styles.item} htmlFor="issue_story_points">Стори поинты:</label>
            <div className={styles.item}>
                <select
                    id="issue_story_points"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.storyPoints ? selectedIssue.storyPoints : "unknown"
                    }
                    onChange={handleStoryPointsChange}
                >
                    <option value="1">
                        1
                    </option>
                    <option value="2">
                        2
                    </option>
                    <option value="3">
                        3
                    </option>
                    <option value="5">
                        5
                    </option>
                    <option value="8">
                        8
                    </option>
                    <option value="13">
                        13
                    </option>
                </select>
            </div>            
            <label className={styles.item} htmlFor="issue_assignee">Исполнитель:</label>
            <div className={styles.item}>
                <select
                    id="issue_assignee"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.assigneeLogin ? selectedIssue.assigneeLogin : "unknown"
                    }
                    onChange={handleAssigneeChange}
                >
                    {selectedIssue.key === null ? 
                        <option value="unknown"></option>
                        : 
                        teamMembers.map((member) => (
                            <option key={member.login} value={member.login}>
                                {member.name}
                            </option>
                        ))
                    }
                </select>
            </div>
            <label className={styles.item} htmlFor="issue_creator">Создатель:</label>
            <div className={styles.item}>
                <select
                    id="issue_creator"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.creatorLogin ? selectedIssue.creatorLogin : "unknown"
                    }
                    onChange={handleCreatorChange}
                >
                    {selectedIssue.key === null ? 
                        <option value="unknown"></option>
                        : 
                        teamMembers.map((member) => (
                            <option key={member.login} value={member.login}>
                                {member.name}
                            </option>
                        ))
                    }
                </select>                
            </div>       
            <label className={styles.item} htmlFor="issue_reporter">Ответственный:</label>
            <div className={styles.item}>
                <select
                    id="issue_reporter"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.reporterLogin ? selectedIssue.reporterLogin : "unknown"
                    }
                    onChange={handleReporterChange}
                >
                    {selectedIssue.key === null ? 
                        <option value="unknown"></option>
                        : 
                        teamMembers.map((member) => (
                            <option key={member.login} value={member.login}>
                                {member.name}
                            </option>
                        ))
                    }
                </select>                
            </div>                   
        </div>
    );
};

export default IssuePropertyEditor;
