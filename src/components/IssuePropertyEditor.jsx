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
            <div className={styles.item}>
                <input
                    id="issue_key"
                    type="text"
                    disabled={true}
                    value={selectedIssue.key ? selectedIssue.key : ""}
                />
            </div>
            <div className={styles.item}>
                <input
                    id="issue_summary"
                    type="text"
                    disabled={selectedIssue.key === null}
                    value={selectedIssue.summary ? selectedIssue.summary : ""}
                    onChange={handleSummaryChange}
                />
            </div>
            <div className={styles.item}>Тип: </div>
            <div className={styles.item}>
                {selectedIssue.issuetype ? selectedIssue.issuetype : ""}
            </div>
            <div className={styles.item}>Статус: </div>
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
            <div className={styles.item}>Спринт: </div>
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
            <div className={styles.item}>Стори поинты: </div>
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
            <div className={styles.item}>Исполнитель: </div>
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
            <div className={styles.item}>Создатель: </div>
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
            <div className={styles.item}>Ответственный: </div>
            <div className={styles.item}>
                <select
                    id="issue_responsible"
                    disabled={selectedIssue.key === null}
                    name="select"
                    value={
                        selectedIssue.reporterLogin ? selectedIssue.reporterLogin : "unknown"
                    }
                    onChange={handleResponsibleChange}
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
