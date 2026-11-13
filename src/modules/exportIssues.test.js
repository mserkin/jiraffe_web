import assert from "node:assert/strict";
import test from "node:test";
import { buildExportRows, renderTemplate } from "./exportIssues.js";

test("buildExportRows exports nested issue nodes in order at their tree depth", () => {
    const tree = {
        type: "root",
        children: [
            {
                type: "issue",
                issue: {
                    key: "WIP-300",
                    fields: { summary: "Parent" },
                },
                children: [
                    {
                        type: "issue",
                        issue: {
                            key: "WIP-301",
                            fields: { summary: "Child" },
                        },
                        children: [],
                    },
                ],
            },
            {
                type: "issue",
                issue: {
                    key: "WIP-302",
                    fields: { summary: "Next parent" },
                },
                children: [],
            },
        ],
    };

    assert.deepEqual(
        buildExportRows(tree, {
            individualCellsTemplates: ["{key}", "{summary}"],
        }),
        [
            ["WIP-300", "Parent", ""],
            ["", "WIP-301", "Child"],
            ["WIP-302", "Next parent", ""],
        ],
    );
});

test("buildExportRows uses the single-cell template at the tree depth", () => {
    const tree = {
        type: "root",
        children: [
            {
                type: "issue",
                issue: { key: "WIP-300", fields: {} },
                children: [
                    {
                        type: "issue",
                        issue: { key: "WIP-301", fields: {} },
                        children: [],
                    },
                ],
            },
        ],
    };

    assert.deepEqual(
        buildExportRows(tree, {
            oneCellExportEnabled: true,
            oneCellExportTemplate: "{key}",
        }),
        [["WIP-300", ""], ["", "WIP-301"]],
    );
});

test("sprint parsing preserves nested brackets, escaped commas, and newlines", () => {
    const issue = {
        fields: {
            customfield_10375: [
                "prefix[name=[q4 2026] Sprint 3\\, Phase 2,description=first line\nsecond line]",
                "prefix[id=2,name=Another Sprint]",
            ],
        },
    };

    assert.equal(
        renderTemplate(issue, "{sprints}"),
        "[q4 2026] Sprint 3, Phase 2, Another Sprint",
    );
});
