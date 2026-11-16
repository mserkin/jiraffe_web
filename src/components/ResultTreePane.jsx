import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSearchResults } from "../redux/slices/searchResultsSlice";
import {
    dropSelection,
    setSelection,
} from "../redux/slices/selectedIssueSlice";
import { selectIssueTypes } from "../redux/slices/jiraMetadataSlice";
import ResultToolbar from "./ResultToolbar";
import WorkItemsTree from "./WorkItemsTree";
import styles from "./ResultTreePane.module.css";

const getExpandableNodeIds = (node) => {
    if (!node.children?.length) {
        return [];
    }

    return [node.id, ...node.children.flatMap(getExpandableNodeIds)];
};

const ResultTreePane = () => {
    const { issues, progress, total } = useSelector(selectSearchResults);
    const issueTypes = useSelector(selectIssueTypes);
    const dispatch = useDispatch();
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [expandedNodeIds, setExpandedNodeIds] = useState(
        () => new Set(["found-issues"]),
    );
    const previousExpandableNodeIds = useRef(new Set());

    const tree = useMemo(() => {
        const toTreeNode = (issue, parentId, index) => {
            const issueKey = issue.key ?? issue.id ?? index;
            const id = `${parentId}/${issueKey}`;
            return {
                id,
                issue,
                label: `${issue.key ?? ""} ${issue.fields?.summary ?? ""}`.trim(),
                type: "issue",
                icon:
                    issueTypes.find(
                        (issueType) =>
                            issueType.id === issue.fields?.issuetype?.id,
                    )?.icon ??
                    issueTypes.find(
                        (issueType) =>
                            issueType.name === issue.fields?.issuetype?.name,
                    )?.icon,
                children: (issue.children ?? []).map((child, childIndex) =>
                    toTreeNode(child, id, childIndex),
                ),
            };
        };

        return {
            id: "found-issues",
            label: "Найденные элементы",
            type: "root",
            children: issues.map((issue, index) =>
                toTreeNode(issue, "issue", index),
            ),
        };
    }, [issues, issueTypes]);

    useEffect(() => {
        const expandableNodeIds = new Set(getExpandableNodeIds(tree));
        const newlyExpandableNodeIds = [...expandableNodeIds].filter(
            (nodeId) => !previousExpandableNodeIds.current.has(nodeId),
        );
        previousExpandableNodeIds.current = expandableNodeIds;
        if (newlyExpandableNodeIds.length > 0) {
            setExpandedNodeIds((current) => {
                const next = new Set(current);
                for (const nodeId of newlyExpandableNodeIds) {
                    next.add(nodeId);
                }
                return next;
            });
        }
    }, [tree]);

    const handleExpandAll = () => {
        setExpandedNodeIds(new Set(getExpandableNodeIds(tree)));
    };

    const handleCollapseAll = () => {
        setExpandedNodeIds(new Set());
    };

    const handleSelect = (node, allowDeselect = false) => {
        if (allowDeselect && selectedNodeId === node.id) {
            setSelectedNodeId(null);
            dispatch(dropSelection());
            return;
        }

        setSelectedNodeId(node.id);
        if (node.type !== "issue") {
            dispatch(dropSelection());
            return;
        }

        const fields = node.issue.fields ?? {};
        dispatch(
            setSelection({
                key: node.issue.key ?? null,
                summary: fields.summary ?? null,
                issuetype: fields.issuetype?.name ?? null,
                status: fields.status?.name ?? null,
                sprints: Array.isArray(fields.customfield_10375)
                    ? fields.customfield_10375
                    : [],
                creatorLogin: fields.creator?.name ?? null,
                assigneeLogin: fields.assignee?.name ?? null,
                reporterLogin: fields.reporter?.name ?? null,
                storyPoints: fields.customfield_10372 ?? null,
                description: fields.description ?? null,
            }),
        );
    };

    return (
        <div className={styles.resultTreePane}>
            <ResultToolbar
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
                tree={tree}
            />
            {total > 0 && (
                <div className={styles.progress}>
                    Получено {progress} из {total}
                </div>
            )}
            <ul className={styles.tree} role="tree" aria-label="Результаты поиска">
                <WorkItemsTree
                    node={tree}
                    selectedNodeId={selectedNodeId}
                    expandedNodeIds={expandedNodeIds}
                    onSelect={handleSelect}
                    onToggle={(nodeId) => {
                        setExpandedNodeIds((current) => {
                            const next = new Set(current);
                            if (next.has(nodeId)) {
                                next.delete(nodeId);
                            } else {
                                next.add(nodeId);
                            }
                            return next;
                        });
                    }}
                />
            </ul>
        </div>
    );
};

export default ResultTreePane;