const asArray = (value) => (Array.isArray(value) ? value : []);

const escapeJqlValue = (value) =>
    String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const quoteJqlValue = (value) => `"${escapeJqlValue(value)}"`;

const getIssueTypeExpression = (issueTypeId, issueTypes) => {
    const issueType = issueTypes.find(
        (option) => String(option.id) === String(issueTypeId),
    );
    if (issueType?.name) {
        return quoteJqlValue(issueType.name);
    }

    return /^\d+$/.test(String(issueTypeId))
        ? String(issueTypeId)
        : quoteJqlValue(issueTypeId);
};

const getStatusExpression = (issueTypeId, statusId, issueTypes) => {
    const issueType = issueTypes.find(
        (option) => String(option.id) === String(issueTypeId),
    );
    const status = issueType?.statuses?.find(
        (option) => String(option.id) === String(statusId),
    );

    if (status?.name) {
        return quoteJqlValue(status.name);
    }

    return /^\d+$/.test(String(statusId))
        ? String(statusId)
        : quoteJqlValue(statusId);
};

export function buildLevelFilterJql(filters = {}, issueTypes = []) {
    const clauses = [];
    const summary = String(filters.summaryFilter ?? "").trim();

    if (summary) {
        clauses.push(`summary ~ ${quoteJqlValue(summary)}`);
    }

    const issueTypeIds = asArray(filters.issueTypeFilter);
    if (issueTypeIds.length > 0) {
        clauses.push(
            `issuetype in (${issueTypeIds
                .map((id) => getIssueTypeExpression(id, issueTypes))
                .join(", ")})`,
        );
    }

    const statusFilters = asArray(filters.statusFilter).filter(
        (status) => status?.issueType !== undefined && status?.statusId !== undefined,
    );
    if (statusFilters.length > 0) {
        clauses.push(
            `(${statusFilters
                .map(
                    ({ issueType, statusId }) =>
                        `(issuetype = ${getIssueTypeExpression(issueType, issueTypes)} AND status = ${getStatusExpression(issueType, statusId, issueTypes)})`,
                )
                .join(" OR ")})`,
        );
    }

    const sprintIds = asArray(filters.sprintFilter)
        .map(Number)
        .filter(Number.isInteger);
    if (sprintIds.length > 0) {
        clauses.push(`sprint in (${sprintIds.join(", ")})`);
    }

    for (const role of ["creator", "assignee", "reporter"]) {
        const logins = asArray(filters[`${role}LoginFilter`]).filter(
            (login) => login !== null && login !== undefined && login !== "",
        );
        if (logins.length > 0) {
            clauses.push(
                `${role} in (${logins.map(quoteJqlValue).join(", ")})`,
            );
        }
    }

    return clauses.join(" AND ");
}

const getLinkDirections = (linkType, issueLink) => {
    const selectors = [
        linkType?.direction,
        linkType?.type,
        linkType?.name,
    ]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());
    const directions = [];

    if (
        selectors.some(
            (value) =>
                value === "inward" ||
                value === "inwardissue" ||
                value === String(issueLink.type?.inward ?? "").toLowerCase(),
        )
    ) {
        directions.push("inwardIssue");
    }
    if (
        selectors.some(
            (value) =>
                value === "outward" ||
                value === "outwardissue" ||
                value === String(issueLink.type?.outward ?? "").toLowerCase(),
        )
    ) {
        directions.push("outwardIssue");
    }

    return directions.length > 0
        ? directions
        : ["inwardIssue", "outwardIssue"];
};

export function getLinkedIssueKeys(issue, filters = {}, linkTypes = []) {
    const selectedLinkTypeIds = asArray(filters.linkTypeFilter).map(String);
    const keys = new Set();

    for (const issueLink of asArray(issue?.fields?.issuelinks)) {
        const linkTypeId = String(issueLink.type?.id ?? "");
        const isLinkTypeSelected =
            selectedLinkTypeIds.length === 0 ||
            selectedLinkTypeIds.includes(linkTypeId);
        if (!isLinkTypeSelected) {
            continue;
        }

        const linkType = linkTypes.find(
            (option) => String(option.id) === linkTypeId,
        );
        const directions =
            selectedLinkTypeIds.length === 0
                ? ["inwardIssue", "outwardIssue"]
                : getLinkDirections(linkType, issueLink);

        for (const direction of directions) {
            const key = issueLink[direction]?.key;
            if (key) {
                keys.add(key);
            }
        }
    }

    return [...keys];
}

export async function expandIssueTree(
    issues,
    levelFilters,
    linkTypes,
    issueTypes,
    searchIssuesByJql,
    shouldStop = () => false,
) {
    let parents = issues;

    for (let levelIndex = 1; levelIndex < levelFilters.length; levelIndex += 1) {
        if (parents.length === 0 || shouldStop()) {
            break;
        }

        const filters = levelFilters[levelIndex] ?? {};
        const keysByParent = parents.map((parent) =>
            getLinkedIssueKeys(parent, filters, linkTypes),
        );
        const candidateKeys = [
            ...new Set(keysByParent.flat()),
        ];
        const filterJql = buildLevelFilterJql(filters, issueTypes);
        const matchingIssues = new Map();

        for (let offset = 0; offset < candidateKeys.length; offset += 100) {
            if (shouldStop()) {
                return issues;
            }

            const keyClause = `key in (${candidateKeys
                .slice(offset, offset + 100)
                .map(quoteJqlValue)
                .join(", ")})`;
            const jql = filterJql
                ? `${keyClause} AND (${filterJql})`
                : keyClause;
            const foundIssues = await searchIssuesByJql(jql);

            if (!Array.isArray(foundIssues)) {
                throw new Error(
                    "Сервер вернул некорректный список связанных элементов.",
                );
            }

            for (const foundIssue of foundIssues) {
                if (foundIssue?.key) {
                    matchingIssues.set(foundIssue.key, foundIssue);
                }
            }
        }

        const nextParents = [];
        for (const [parentIndex, parent] of parents.entries()) {
            const children = [];
            for (const key of keysByParent[parentIndex]) {
                const matchingIssue = matchingIssues.get(key);
                if (matchingIssue) {
                    const child = { ...matchingIssue, children: [] };
                    children.push(child);
                    nextParents.push(child);
                }
            }
            parent.children = children;
        }
        parents = nextParents;
    }

    return issues;
}
