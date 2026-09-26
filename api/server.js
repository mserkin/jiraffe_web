import express from "express";
import { connect, Schema, model } from "mongoose";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { MONGO_LOGIN, MONGO_PASSWORD } from "./credits.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3010;

// 1. Подключаемся к MongoDB (к базе данных 'apps')
connect(
    `mongodb+srv://${MONGO_LOGIN}:${MONGO_PASSWORD}@cluster0.uvazvte.mongodb.net/jiraffe`,
    //    'mongodb://127.0.0.1:27017/apps'
)
    .then(() => console.log("Успешно подключились к MongoDB!"))
    .catch((err) => console.error("Ошибка подключения к базе:", err));

const MemberSchema = new Schema({
    login: String,
    name: String,
});

const queryShortInfoSchema = new Schema(
    {
        id: String,
        name: String,
        queryText: String,
        epicViewType: String,
    },
    { collection: "queries" },
);

const SettingsSchema = new Schema(
    {
        jiraLogin: String,
        jiraPassword: String,
        jiraServer: String,
        project: String,
        teamMembers: [MemberSchema],
    },
    { collection: "settings" },
);

const LinkDirectionSchema= new Schema({
    id: String,
    name: String,
});

const LinkTypeSchema = new Schema({
    type: String,
    inward: [LinkDirectionSchema],
    outward: [LinkDirectionSchema],
});

const LinkTypesSchema = new Schema([LinkTypeSchema], { collection: "link-types" });

const IssueStatusSchema= new Schema({
    id: String,
    name: String,
});

const IssueTypeSchema = new Schema({
    id: String,
    name: String,
    icon: String,
    statuses: [IssueStatusSchema],
});

const IssueTypesSchema = new Schema([IssueTypeSchema], { collection: "issue-types" });


const QueryShortInfo = model("Query", queryShortInfoSchema);
const Settings = model("Settings", SettingsSchema);
const LinkTypes = model("LinkTypes", LinkTypesSchema);
const IssueTypes = model("IssueTypes", IssueTypesSchema);

async function getQueryList(res) {
    try {
        const queries = await QueryShortInfo.find(
            {},
            { id: 1, name: 1, _id: 0 },
        );
        const queryList = queries.map((query) => ({
            id: query.id,
            name: query.name,
        }));

        return res.status(200).json(queryList);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при поиске запросов" });
    }
}

async function getQueryById(req, res) {
    try {
        const { id } = req.params;
        const query = await QueryShortInfo.findOne({ id }, { _id: 0 });

        if (!query) {
            return res.status(404).json({ message: "Запрос не найден" });
        }

        return res.status(200).json(query);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при поиске запроса" });
    }
}

async function insertQuery(req, res) {
    try {
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res
                .status(400)
                .json({ error: "Тело запроса должно быть объектом" });
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "id")) {
            return res
                .status(400)
                .json({ error: "Поле id не должно передаваться" });
        }

        const query = await QueryShortInfo.create({
            ...req.body,
            id: randomUUID(),
        });
        const queryDocument = query.toObject({ versionKey: false });
        delete queryDocument._id;

        return res.status(201).json(queryDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при сохранении запроса" });
    }
}

async function updateQueryById(req, res) {
    try {
        const { id } = req.params;

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res
                .status(400)
                .json({ error: "Тело запроса должно быть объектом" });
        }

        const updatedQuery = {
            ...req.body,
            id,
        };

        const query = await QueryShortInfo.findOneAndUpdate(
            { id },
            { $set: updatedQuery },
            { returnDocument: "after", runValidators: true },
        );

        if (!query) {
            return res
                .status(404)
                .json({ error: "Документ с указанным id не найден" });
        }

        const queryDocument = query.toObject({ versionKey: false });
        delete queryDocument._id;

        return res.status(200).json(queryDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при обновлении запроса" });
    }
}

async function deleteQueryById(req, res) {
    try {
        const { id } = req.params;

        const query = await QueryShortInfo.findOne({ id }, { _id: 0 });

        if (!query) {
            return res.status(404).json({ message: "Запрос не найден" });
        }

        await QueryShortInfo.deleteOne({ id });

        const queryDocument = query.toObject({ versionKey: false });
        delete queryDocument._id;

        return res.status(200).json(queryDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при обновлении запроса" });
    }
}

async function getSettings(res) {
    try {
        const settings = await Settings.findOne(
            {},
            { _id: 0, "teamMembers._id": 0 },
        );
        return res.status(200).json(settings);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при поиске запросов" });
    }
}

async function updateSettings(req, res) {
    try {
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res
                .status(400)
                .json({ error: "Тело запроса должно быть объектом" });
        }

        const updated_settings = { ...req.body };
        const settings = await Settings.findOneAndUpdate(
            {},
            { $set: updated_settings },
            { returnDocument: "after", runValidators: true },
        );

        if (!settings) {
            return res
                .status(404)
                .json({ error: "Документ настроек не найден в базе данных!" });
        }

        const settingsDocument = settings.toObject({ versionKey: false });
        delete settingsDocument._id;

        return res.status(200).json(settingsDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при обновлении настроек" });
    }
}

async function getLinkTypes(res) {
    try {
        const linkTypes = await LinkTypes.find(
            {},
            { _id: 0},
        );
        return res.status(200).json(linkTypes);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при поиске запросов" });
    }
}

async function getIssueTypes(res) {
    try {
        const issueTypes = await IssueTypes.find(
            {},
            { _id: 0},
        );
        return res.status(200).json(issueTypes);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Ошибка сервера при поиске запросов" });
    }
}

app.get("/queries", async (req, res) => {
    getQueryList(res);
});

app.post("/queries", async (req, res) => {
    insertQuery(req, res);
});

app.get("/queries/:id", async (req, res) => {
    getQueryById(req, res);
});

app.put("/queries/:id", async (req, res) => {
    updateQueryById(req, res);
});

app.delete("/queries/:id", async (req, res) => {
    deleteQueryById(req, res);
});

app.get("/settings", async (req, res) => {
    getSettings(res);
});

app.put("/settings", async (req, res) => {
    updateSettings(req, res);
});

app.get("/issue-types", async (req, res) => {
    getIssueTypes(res);
});

app.get("/link-types", async (req, res) => {
    getLinkTypes(res);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
