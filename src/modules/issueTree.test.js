import assert from "node:assert/strict";
import test from "node:test";
import {
    buildLevelFilterJql,
    countIssueTree,
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
                    type: {
                        id: "jira-7",
                        name: "blocks",
                        inward: "is blocked by",
                        outward: "blocks",
                    },
                    inwardIssue: { key: "TASK-1" },
                    outwardIssue: { key: "TASK-2" },
                },
                {
                    type: {
                        id: "jira-7",
                        name: "blocks",
                        inward: "is blocked by",
                        outward: "blocks",
                    },
                    outwardIssue: { key: "TASK-2" },
                },
            ],
        },
    };

    assert.deepEqual(
        getLinkedIssueKeys(
            issue,
            { linkTypeFilter: ["local-7"] },
            [{ id: "local-7", type: "BLOCKS", direction: "OUTWARD" }],
        ),
        ["TASK-2"],
    );
});

test("getLinkedIssueKeys highlights inward relations only for inward direction", () => {
    const issue = {
        fields: {
            issuelinks: [
                {
                    type: {
                        id: "jira-7",
                        name: "is blocked by",
                        inward: "is blocked by",
                        outward: "blocks",
                    },
                    inwardIssue: { key: "TASK-1" },
                    outwardIssue: { key: "TASK-2" },
                },
            ],
        },
    };

    assert.deepEqual(
        getLinkedIssueKeys(
            issue,
            { linkTypeFilter: ["local-7-inward"] },
            [{ id: "local-7-inward", type: "BLOCKS", direction: "INWARD" }],
        ),
        ["TASK-1"],
    );
});

test("getLinkedIssueKeys matches link-family by type and direction for Jira records", () => {
    const issue = {
        fields: {
            issuelinks: [
                {
                    type: {
                        id: "jira-7",
                        name: "is blocked by",
                        inward: "is blocked by",
                        outward: "blocks",
                    },
                    inwardIssue: { key: "TASK-1" },
                    outwardIssue: { key: "TASK-2" },
                },
            ],
        },
    };

    assert.deepEqual(
        getLinkedIssueKeys(
            issue,
            { linkTypeFilter: ["local-7-outward"] },
            [
                { id: "local-7-inward", type: "BLOCKS", direction: "INWARD" },
                { id: "local-7-outward", type: "BLOCKS", direction: "OUTWARD" },
            ],
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

test("expandIssueTree publishes children after each backend batch", async () => {
    const root = {
        key: "ROOT-1",
        fields: {
            issuelinks: Array.from({ length: 101 }, (_, index) => ({
                type: { id: "7" },
                outwardIssue: { key: `CHILD-${index + 1}` },
            })),
        },
    };
    let resolveSecondBatch;
    let markSecondBatchStarted;
    const secondBatchStarted = new Promise((resolve) => {
        markSecondBatchStarted = resolve;
    });
    const publishedChildCounts = [];
    const expansion = expandIssueTree(
        [root],
        [{}, {}],
        [],
        [],
        async (jql) => {
            if (jql.includes("CHILD-1") && !jql.includes("CHILD-101")) {
                return [{ key: "CHILD-1", fields: { issuelinks: [] } }];
            }
            markSecondBatchStarted();
            return new Promise((resolve) => {
                resolveSecondBatch = resolve;
            });
        },
        undefined,
        () => publishedChildCounts.push(root.children.length),
    );

    await secondBatchStarted;
    assert.deepEqual(root.children.map((child) => child.key), ["CHILD-1"]);
    assert.deepEqual(publishedChildCounts, [1]);

    resolveSecondBatch([{ key: "CHILD-101", fields: { issuelinks: [] } }]);
    await expansion;
    assert.deepEqual(
        root.children.map((child) => child.key),
        ["CHILD-1", "CHILD-101"],
    );
    assert.deepEqual(publishedChildCounts, [1, 2]);
});

test("expandIssueTree loads Epic Link children using their configured level filter", async () => {
    const root = {
        key: "EPIC-1",
        fields: { issuetype: { name: "Epic" }, issuelinks: [] },
    };
    const requestedJql = [];

    await expandIssueTree(
        [root],
        [{}, { summaryFilter: "second level" }, { summaryFilter: "third level" }],
        [],
        [],
        async (jql) => {
            requestedJql.push(jql);
            if (jql === '"Epic Link" = "EPIC-1" AND (summary ~ "second level")') {
                return [
                    {
                        key: "STORY-1",
                        fields: {
                            summary: "second level",
                            issuetype: { name: "Story" },
                            issuelinks: [
                                {
                                    type: { id: "7" },
                                    outwardIssue: { key: "TASK-1" },
                                },
                            ],
                        },
                    },
                ];
            }
            if (jql === 'key in ("TASK-1") AND (summary ~ "third level")') {
                return [{ key: "TASK-1", fields: { summary: "third level" } }];
            }
            return [];
        },
    );

    assert.deepEqual(requestedJql, [
        '"Epic Link" = "EPIC-1" AND (summary ~ "second level")',
        'key in ("TASK-1") AND (summary ~ "third level")',
    ]);
    assert.deepEqual(
        root.epicChildren.map((child) => child.key),
        ["STORY-1"],
    );
    assert.deepEqual(
        root.epicChildren[0].children.map((child) => child.key),
        ["TASK-1"],
    );
});

test("expandIssueTree does not load Epic Link children beyond configured levels", async () => {
    const root = {
        key: "ROOT-1",
        fields: {
            issuetype: { name: "Task" },
            issuelinks: [{ type: { id: "7" }, outwardIssue: { key: "EPIC-1" } }],
        },
    };
    const requestedJql = [];

    await expandIssueTree(
        [root],
        [{}, {}],
        [{ id: "7", direction: "outward" }],
        [],
        async (jql) => {
            requestedJql.push(jql);
            return [
                {
                    key: "EPIC-1",
                    fields: { issuetype: { name: "Epic" }, issuelinks: [] },
                },
            ];
        },
    );

    assert.deepEqual(requestedJql, ['key in ("EPIC-1")']);
    assert.deepEqual(root.children.map((child) => child.key), ["EPIC-1"]);
    assert.equal(root.children[0].epicChildren, undefined);
});

test("expandIssueTree skips Epic Link loading for linkedOnly view", async () => {
    const epic = {
        key: "EPIC-1",
        fields: { issuetype: { name: "Epic" }, issuelinks: [] },
    };
    const requestedJql = [];

    await expandIssueTree(
        [epic],
        [{}, {}],
        [],
        [],
        async (jql) => {
            requestedJql.push(jql);
            return [];
        },
        undefined,
        undefined,
        "linkedOnly",
    );

    assert.deepEqual(requestedJql, []);
    assert.deepEqual(epic.epicChildren, []);
});

test("expandIssueTree loads only Epic Link children for childrenOnly view", async () => {
    const epic = {
        key: "EPIC-1",
        fields: {
            issuetype: { name: "Epic" },
            issuelinks: [{ type: { id: "7" }, outwardIssue: { key: "LINKED-1" } }],
        },
    };
    const requestedJql = [];

    await expandIssueTree(
        [epic],
        [{}, { summaryFilter: "child level" }],
        [{ id: "7", direction: "outward" }],
        [],
        async (jql) => {
            requestedJql.push(jql);
            if (jql === '"Epic Link" = "EPIC-1" AND (summary ~ "child level")') {
                return [{ key: "CHILD-1", fields: { summary: "child level" } }];
            }
            return [];
        },
        undefined,
        undefined,
        "childrenOnly",
    );

    assert.deepEqual(requestedJql, [
        '"Epic Link" = "EPIC-1" AND (summary ~ "child level")',
    ]);
    assert.deepEqual(epic.children, []);
    assert.deepEqual(epic.epicChildren.map((child) => child.key), ["CHILD-1"]);
});

test("expandIssueTree enforces one issue budget across root and Epic Link levels", async () => {
    const epics = ["EPIC-1", "EPIC-2"].map((key) => ({
        key,
        fields: { issuetype: { name: "Epic" }, issuelinks: [] },
    }));
    const issueBudget = { count: 2, limit: 3 };
    const requestedLimits = [];

    await expandIssueTree(
        epics,
        [{}, {}, {}],
        [],
        [],
        async (_jql, limit) => {
            requestedLimits.push(limit);
            return [
                { key: "CHILD-1", fields: {} },
                { key: "CHILD-2", fields: {} },
            ];
        },
        undefined,
        undefined,
        "linkedAndChildren",
        issueBudget,
    );

    assert.deepEqual(requestedLimits, [1]);
    assert.deepEqual(
        epics[0].epicChildren.map((child) => child.key),
        ["CHILD-1"],
    );
    assert.deepEqual(epics[1].epicChildren, []);
    assert.equal(countIssueTree(epics), 3);
    assert.equal(issueBudget.count, 3);
});
