import * as XLSX from "xlsx";

const getIssueField = (issue, path, fallbackValue = "") => {
    if (!issue || typeof issue !== "object") {
        return fallbackValue;
    }

    const segments = path.split(".");
    let current = issue;

    for (const segment of segments) {
        if (!current || typeof current !== "object") {
            return fallbackValue;
        }
        current = current[segment];
    }

    return current ?? fallbackValue;
};

const unescapeSeparatedValue = (value = "") =>
    String(value).replace(/\\(.)/g, "$1");

const splitTopLevel = (text = "", delimiter = ",") => {
    const parts = [];
    let current = "";
    let escaped = false;
    let bracketDepth = 0;

    for (const char of text) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            current += char;
            escaped = true;
            continue;
        }

        if (char === "[") {
            bracketDepth += 1;
        } else if (char === "]" && bracketDepth > 0) {
            bracketDepth -= 1;
        }

        if (char === delimiter && bracketDepth === 0) {
            parts.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    if (current) {
        parts.push(current);
    }

    return parts.map((part) => unescapeSeparatedValue(part.trim())).filter(Boolean);
};

const collectSprintNames = (rawValue) => {
    if (rawValue === null || rawValue === undefined) {
        return [];
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const names = [];

    for (const entry of values) {
        if (typeof entry !== "string") {
            continue;
        }

        const startIndex = entry.indexOf("[");
        if (startIndex === -1) {
            const trimmed = entry.trim();
            if (trimmed) {
                names.push(trimmed);
            }
            continue;
        }

        let bracketDepth = 0;
        let endIndex = -1;

        for (let index = startIndex; index < entry.length; index += 1) {
            const char = entry[index];
            if (char === "\\") {
                index += 1;
                continue;
            }

            if (char === "[") {
                bracketDepth += 1;
            } else if (char === "]") {
                bracketDepth -= 1;
                if (bracketDepth === 0) {
                    endIndex = index;
                    break;
                }
            }
        }

        if (endIndex === -1) {
            continue;
        }

        const innerData = entry.slice(startIndex + 1, endIndex);
        const pairs = splitTopLevel(innerData, ",");

        for (const pair of pairs) {
            const equalsIndex = pair.indexOf("=");
            if (equalsIndex === -1) {
                continue;
            }

            const key = pair.slice(0, equalsIndex).trim();
            const value = pair.slice(equalsIndex + 1).trim();
            if (key === "name") {
                const trimmedValue = value.trim();
                if (trimmedValue) {
                    names.push(trimmedValue);
                }
            }
        }
    }

    return names;
};

const getSummaryTag = (summary) => {
    if (typeof summary !== "string") {
        return "";
    }

    const match = summary.match(/^((?:\[[^\]]*\])+)/);
    return match ? match[1] : "";
};

export const getIssueExportValue = (issue, fieldName) => {
    const fieldMap = {
        key: issue?.key ?? "",
        issue_type: getIssueField(issue, "fields.issuetype.name", ""),
        status: getIssueField(issue, "fields.status.name", ""),
        sprints: collectSprintNames(getIssueField(issue, "fields.customfield_10375", [])).join(", "),
        story_points: getIssueField(issue, "fields.customfield_10372", ""),
        summary_tag: getSummaryTag(getIssueField(issue, "fields.summary", "")),
        summary: getIssueField(issue, "fields.summary", ""),
        creator_login: getIssueField(issue, "fields.creator.name", ""),
        creator: getIssueField(issue, "fields.creator.displayName", ""),
        assignee_login: getIssueField(issue, "fields.assignee.name", ""),
        assignee: getIssueField(issue, "fields.assignee.displayName", ""),
        reporter_login: getIssueField(issue, "fields.reporter.name", ""),
        reporter: getIssueField(issue, "fields.reporter.displayName", ""),
    };

    if (!fieldName || !Object.prototype.hasOwnProperty.call(fieldMap, fieldName)) {
        return "";
    }

    return String(fieldMap[fieldName] ?? "");
};

export const renderTemplate = (issue, template = "") => {
    if (!template) {
        return "";
    }

    return template.replace(/\{([^}]+)\}/g, (_, placeholder) => {
        const value = getIssueExportValue(issue, placeholder.trim());
        return value;
    });
};

export const flattenWorkItemsTree = (tree, depth = 0, rows = []) => {
    if (!tree || typeof tree !== "object") {
        return rows;
    }

    if (tree.type === "root") {
        for (const child of tree.children ?? []) {
            flattenWorkItemsTree(child, depth, rows);
        }
        return rows;
    }

    rows.push({ issue: tree.issue ?? tree, depth });

    for (const child of tree.children ?? []) {
        flattenWorkItemsTree(child, depth + 1, rows);
    }

    return rows;
};

const toColumnName = (index) => {
    let name = "";
    let current = index + 1;

    while (current > 0) {
        const remainder = (current - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        current = Math.floor((current - 1) / 26);
    }

    return name;
};

const buildRowValues = (issueRow, templates) => {
    const rowValues = [];
    const startColumnIndex = issueRow.depth;

    for (let index = 0; index < templates.length; index += 1) {
        const template = templates[index];
        const value = renderTemplate(issueRow.issue, template);
        rowValues[startColumnIndex + index] = value;
    }

    return rowValues;
};

export const buildExportRows = (tree, settings = {}) => {
    const exportedIssues = flattenWorkItemsTree(tree, 0, []);
    const oneCellEnabled = Boolean(settings.oneCellExportEnabled);
    const individualTemplates = Array.isArray(settings.individualCellsTemplates)
        ? settings.individualCellsTemplates
        : [];
    const singleCellTemplate = settings.oneCellExportTemplate ?? "";

    const rows = [];
    let maxColumns = 0;

    for (const issueRow of exportedIssues) {
        if (oneCellEnabled) {
            const row = Array.from({ length: issueRow.depth + 1 }, () => "");
            row[issueRow.depth] = renderTemplate(issueRow.issue, singleCellTemplate);
            rows.push(row);
            maxColumns = Math.max(maxColumns, row.length);
            continue;
        }

        const row = Array.from({ length: issueRow.depth + Math.max(individualTemplates.length, 1) }, () => "");
        const filledRow = buildRowValues(issueRow, individualTemplates);
        for (let index = 0; index < row.length; index += 1) {
            if (filledRow[index] !== undefined) {
                row[index] = filledRow[index];
            }
        }
        rows.push(row);
        maxColumns = Math.max(maxColumns, row.length);
    }

    const normalizedRows = rows.map((row) => {
        const nextRow = [...row];
        while (nextRow.length < maxColumns) {
            nextRow.push("");
        }
        return nextRow;
    });

    return normalizedRows;
};

export const exportTreeToXlsx = (tree, settings = {}) => {
    const workbook = XLSX.utils.book_new();
    const rows = buildExportRows(tree, settings);
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    XLSX.writeFile(workbook, "jiraffe-export.xlsx");
};

export const getIssueValueForTemplate = (issue, template) => renderTemplate(issue, template);

export const getColumnAddress = (index) => `${toColumnName(index)}1`;
