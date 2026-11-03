import { VscFile, VscListTree } from "react-icons/vsc";
import styles from "./WorkItemsTree.module.css";

const WorkItemsTree = ({
    node,
    selectedNodeId,
    expandedNodeIds,
    onSelect,
    onToggle,
}) => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedNodeIds.has(node.id);
    const Icon = node.type === "root" ? VscListTree : VscFile;

    return (
        <li
            className={styles.treeNode}
            role="treeitem"
            aria-selected={selectedNodeId === node.id}
            aria-expanded={hasChildren ? isExpanded : undefined}
            tabIndex={0}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(node.id);
                if (hasChildren) {
                    onToggle(node.id);
                }
            }}
            onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(node.id);
                    if (hasChildren) {
                        onToggle(node.id);
                    }
                } else if (event.key === "ArrowRight" && hasChildren) {
                    onSelect(node.id);
                    if (!isExpanded) {
                        onToggle(node.id);
                    }
                } else if (event.key === "ArrowLeft" && hasChildren) {
                    onSelect(node.id);
                    if (isExpanded) {
                        onToggle(node.id);
                    }
                }
            }}
        >
            <div
                className={`${styles.treeRow} ${
                    selectedNodeId === node.id ? styles.selected : ""
                }`}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        className={styles.expandButton}
                        aria-label={`${isExpanded ? "Свернуть" : "Развернуть"} ${node.label}`}
                        aria-expanded={isExpanded}
                        tabIndex={-1}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggle(node.id);
                        }}
                    >
                        <span className={styles.expandIcon} aria-hidden="true">
                            {isExpanded ? "−" : "+"}
                        </span>
                    </button>
                ) : (
                    <span className={styles.expandPlaceholder} />
                )}
                <span className={styles.nodeButton}>
                    <Icon className={styles.nodeIcon} aria-hidden="true" />
                    <span>{node.label}</span>
                </span>
            </div>
            {hasChildren && isExpanded && (
                <ul className={styles.children} role="group">
                    {node.children.map((child) => (
                        <WorkItemsTree
                            key={child.id}
                            node={child}
                            selectedNodeId={selectedNodeId}
                            expandedNodeIds={expandedNodeIds}
                            onSelect={onSelect}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default WorkItemsTree;