import assert from "node:assert/strict";
import test from "node:test";
import {
    buildLevelFilterJql,
    expandIssueTree,
    getLinkedIssueKeys,
} from "./issueTree.js";

test("buildLevelFilterJql includes configured criteria", () => {
    const jql = buildLevelFilterJql(
        {
            summaryFilter: 'API "cleanup"',
            issueTypeFilter: ["3"],
            statusFilter: [{ issueType: "3", statusId: "10001" }],
            sprintFilter: [12],
            creatorLoginFilter: ["alice"],
            assigneeLoginFilter: ["bob"],
            reporterLoginFilter: ["carol"],
        },
        [
            {
                id: "3",
                name: "Bug",
                statuses: [{ id: "10001", name: "In Progress" }],
            },
        ],
    );

    assert.equal(
        jql,
        'summary ~ "API \\"cleanup\\"" AND issuetype in ("Bug") AND ((issuetype = "Bug" AND status = "In Progress")) AND sprint in (12) AND creator in ("alice") AND assignee in ("bob") AND reporter in ("carol")',
    );
});

test("getLinkedIssueKeys respects configured direction and removes duplicates", () => {
    const issue = {
        fields: {
            issuelinks: [
                {
                    type: { id: "7", inward: "is blocked by", outward: "blocks" },
                    inwardIssue: { key: "TASK-1" },
                    outwardIssue: { key: "TASK-2" },
                },
                {
                    type: { id: "7", inward: "is blocked by", outward: "blocks" },
                    outwardIssue: { key: "TASK-2" },
                },
            ],
        },
    };

    assert.deepEqual(
        getLinkedIssueKeys(
            issue,
            { linkTypeFilter: ["7"] },
            [{ id: "7", direction: "outward" }],
        ),
        ["TASK-2"],
    );
});

test("expandIssueTree attaches unique children at each configured level", async () => {
    const root = {
        key: "TASK-1",
        fields: {
            issuelinks: [
                {
                    type: { id: "7" },
                    outwardIssue: { key: "TASK-2" },
                    inwardIssue: { key: "TASK-9" },
                },
                {
                    type: { id: "7" },
                    outwardIssue: { key: "TASK-2" },
                },
            ],
        },
    };
    const requestedJql = [];
    const issueResults = {
        'key in ("TASK-2") AND (summary ~ "second")': [
            {
                key: "TASK-2",
                fields: {
                    issuelinks: [
                        {
                            type: { id: "8" },
                            outwardIssue: { key: "TASK-3" },
                        },
                    ],
                },
            },
        ],
        'key in ("TASK-3")': [
            {
                key: "TASK-3",
                fields: {
                    issuelinks: [
                        {
                            type: { id: "9" },
                            outwardIssue: { key: "TASK-4" },
                        },
                    ],
                },
            },
        ],
        'key in ("TASK-4")': [{ key: "TASK-4", fields: { issuelinks: [] } }],
    };

    await expandIssueTree(
        [root],
        [{}, { summaryFilter: "second", linkTypeFilter: ["7"] }, {}, {}],
        [
            { id: "7", direction: "outward" },
            { id: "8", direction: "outward" },
            { id: "9", direction: "outward" },
        ],
        [],
        async (jql) => {
            requestedJql.push(jql);
            return issueResults[jql] ?? [];
        },
    );

    assert.deepEqual(requestedJql, [
        'key in ("TASK-2") AND (summary ~ "second")',
        'key in ("TASK-3")',
        'key in ("TASK-4")',
    ]);
    assert.deepEqual(root.children.map((child) => child.key), ["TASK-2"]);
    assert.deepEqual(
        root.children[0].children.map((child) => child.key),
        ["TASK-3"],
    );
    assert.deepEqual(
        root.children[0].children[0].children.map((child) => child.key),
        ["TASK-4"],
    );
});
