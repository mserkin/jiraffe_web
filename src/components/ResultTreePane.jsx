import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectSearchResults } from "../redux/slices/searchResultsSlice";
import ResultToolbar from "./ResultToolbar";
import WorkItemsTree from "./WorkItemsTree";
import styles from "./ResultTreePane.module.css";

const ResultTreePane = () => {
    const { issues, progress, total } = useSelector(selectSearchResults);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [expandedNodeIds, setExpandedNodeIds] = useState(
        () => new Set(["found-issues"]),
    );

    const tree = useMemo(
        () => ({
            id: "found-issues",
            label: "Найденные элементы",
            type: "root",
            children: issues.map((issue, index) => ({
                id: `issue:${issue.key ?? issue.id ?? index}`,
                label: `${issue.key ?? ""} ${issue.fields?.summary ?? ""}`.trim(),
                type: "issue",
            })),
        }),
        [issues],
    );

    const getExpandableNodeIds = (node) => {
        if (!node.children?.length) {
            return [];
        }

        return [
            node.id,
            ...node.children.flatMap(getExpandableNodeIds),
        ];
    };

    const handleExpandAll = () => {
        setExpandedNodeIds(new Set(getExpandableNodeIds(tree)));
    };

    const handleCollapseAll = () => {
        setExpandedNodeIds(new Set());
    };

    return (
        <div className={styles.resultTreePane}>
            <ResultToolbar
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
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
                    onSelect={setSelectedNodeId}
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