import { useState } from "react";
import { VscFile, VscListTree } from "react-icons/vsc";
import styles from "./WorkItemsTree.module.css";

const WorkItemsTree = ({
    node,
    selectedNodeId,
    expandedNodeIds,
    onSelect,
    onToggle,
}) => {
    const [iconFailed, setIconFailed] = useState(false);
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
                onSelect(node, true);
            }}
            onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(node, true);
                } else if (event.key === "ArrowRight" && hasChildren) {
                    onSelect(node);
                    if (!isExpanded) {
                        onToggle(node.id);
                    }
                } else if (event.key === "ArrowLeft" && hasChildren) {
                    onSelect(node);
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
                    {node.icon && !iconFailed ? (
                        <img
                            className={styles.nodeIcon}
                            src={`/${encodeURIComponent(
                                node.icon.toLowerCase().endsWith(".png")
                                    ? node.icon
                                    : `${node.icon}.png`,
                            )}`}
                            alt=""
                            onError={() => setIconFailed(true)}
                        />
                    ) : (
                        <Icon className={styles.nodeIcon} aria-hidden="true" />
                    )}
                    {node.type === "issue" ? (
                        <>
                            <span className={styles.issueKey}>{node.key}</span>
                            {node.statusBadge && (
                                <span
                                    className={styles.statusBadge}
                                    data-category={node.statusBadge.category}
                                    style={{
                                        "--status-background": node.statusBadge.background,
                                        "--status-color": node.statusBadge.color,
                                    }}
                                >
                                    {node.statusBadge.label}
                                </span>
                            )}
                            <span className={styles.issueSummary}>{node.summary}</span>
                        </>
                    ) : (
                        <span className={styles.nodeLabel}>{node.label}</span>
                    )}
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