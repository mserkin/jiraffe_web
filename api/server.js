import express from "express";
import { connect, Schema, model } from "mongoose";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { MONGO_LOGIN, MONGO_PASSWORD } from "./credits.js";
import JiraClient from "./jira_client.js";
import { v4 as uuidv4 } from 'uuid'; // Установите через npm i uuid для генерации ID задач

// Хранилище для фоновых задач
const activeTasks = new Map();
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

const StatusDescriptor = new Schema({
    issueType: String,
    statusId: String
}, { _id: false })

const LevelFilterSchema = new Schema({
    summaryFilter: String,
    issueTypeFilter: [String],
    statusFilter: [StatusDescriptor],
    sprintFilter: [Number],
    creatorLoginFilter: [String],
    assigneeLoginFilter: [String],
    reporterLoginFilter: [String],
    linkTypeFilter: [String],
}, { _id: false });

const queryShortInfoSchema = new Schema(
    {
        id: String,
        name: String,
        queryText: String,
        epicViewType: String,
        levelFilters: [LevelFilterSchema],
    },
    { collection: "queries" },
);

const SettingsSchema = new Schema(
    {
        jiraLogin: String,
        jiraPassword: String,
        jiraServer: String,
        project: String,
        boardId: Number,
        teamMembers: [MemberSchema],
    },
    { collection: "settings" },
);

const LinkTypeSchema = new Schema({
    id: String,
    type: String,
    direction: String,
    name: String
}, { _id: false });

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
            .json({ error: `Ошибка сервера при поиске запросов: ${error}` });
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
            .json({ error: `Ошибка сервера при поиске запроса: ${error}`});
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
            .json({ error: `Ошибка сервера при сохранении запроса: ${error}` });
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
        
        console.log(`updatedQuery: ${JSON.stringify(updatedQuery)}`);

        const query = await QueryShortInfo.findOneAndUpdate(
            { id },
            { $set: updatedQuery },
            { returnDocument: "after", runValidators: true },
        );
        
        console.log(`query: ${JSON.stringify(query)}`);
        
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
            .json({ error: `Ошибка сервера при обновлении запроса: ${error}` });
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
            .json({ error: `Ошибка сервера при обновлении запроса: ${error}` });
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
            .json({ error: `Ошибка сервера при поиске настроек: ${error}` });
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
            .json({ error: `Ошибка сервера при обновлении настроек: ${error}` });
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
            .json({ error: `Ошибка сервера при поиске типов связей: ${error}` });
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
            .json({ error: `Ошибка сервера при поиске типов рабочих элементов: ${error}` });
    }
}

async function getSprints(res) {
    try {
        const settings = await Settings.findOne(
            {},
            { _id: 0, "teamMembers._id": 0 },
        );

        const config = {
            baseUrl: settings.jiraServer,
            username: settings.jiraLogin,
            password: settings.jiraPassword
        };

        // Устанавливает соединение и проверяет credentials через /myself
        console.log(`Вызов 1: Инициализация(${JSON.stringify(config)})`);
        const jira1 = await JiraClient.getConnection(config);
    
        // Запрашиваем спринты, используя метод созданного подключения
        const boardId = settings.boardId;
        const sprints = await jira1.request(`/rest/agile/1.0/board/${boardId}/sprint?state=active,future`);
        console.log("Спринты получены:", sprints.values);

        return res.status(200).json(sprints.values);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: `Ошибка сервера при получении информации о спринтах: ${error}` });
    }
}

async function getIssuesByJql(req, res) {
    try {
        const { jql } = req.query;

        if (!jql) {
            return res.status(400).json({ error: "Параметр 'jql' обязателен в query-строке запроса." });
        }

        const jira = await JiraClient.getConnection();

        const maxResults = 1000; // Ограничение на кол-во задач

        const endpoint = `/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`;

        console.log(`Запрос задач по JQL: ${jql}`);
        const searchResult = await jira.request(endpoint);
        
        console.log("Задачи получены. Всего найдено:", searchResult.total);

        return res.status(200).json(searchResult.issues);

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: `Ошибка сервера при получении задач по JQL: ${error.message}` });
    }
}

async function startSearch(req, res) {
    try {
        const { jql } = req.body; // или req.query
        if (!jql) return res.status(400).json({ error: "Параметр 'jql' обязателен." });

        const taskId = uuidv4(); // Генерируем уникальный ID для этой сессии

        // Инициализируем состояние задачи в памяти
        activeTasks.set(taskId, {
            status: "processing",
            issues: [],
            total: 0,
            isCancelled: false,
            error: null
        });

        // Запускаем тяжелый процесс В ФОНЕ (без await!)
        runJiraBackgroundSearch(taskId, jql);

        // МГНОВЕННО возвращаем клиенту ID задачи
        return res.status(202).json({ taskId });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getSearchStatus(req, res) {
    const { taskId } = req.params;
    const task = activeTasks.get(taskId);

    if (!task) {
        return res.status(404).json({ error: "Задача не найдена или устарела" });
    }

    // Возвращаем текущее состояние (фронтенд увидит статус и сколько задач уже скачано)
    return res.status(200).json({
        status: task.status,
        progress: task.issues.length,
        total: task.total,
        error: task.error,
        issues: task.issues // Можно отдавать накопленный массив
    });
    
    // Идея: Если статус "completed" или "cancelled", после этого ответа можно сделать activeTasks.delete(taskId), чтобы очистить память
}

async function cancelSearch(req, res) {
    const { taskId } = req.params;
    const task = activeTasks.get(taskId);

    if (!task) {
        return res.status(404).json({ error: "Задача не найдена" });
    }

    if (task.status === "processing") {
        task.isCancelled = true; // Выставляем флаг отмены. Фоновый цикл увидит его на следующей итерации.
        task.status = "cancelled";
        console.log(`[Task ${taskId}] Пользователь запросил отмену.`);
        return res.status(200).json({ message: "Запрос на отмену принят." });
    }

    return res.status(400).json({ message: `Нельзя отменить задачу в статусе ${task.status}` });
}

async function runJiraBackgroundSearch(taskId, jql) {
    const task = activeTasks.get(taskId);
    
    try {
        const settings = await Settings.findOne({}, { _id: 0, "teamMembers._id": 0 });
        const config = { baseUrl: settings.jiraServer, username: settings.jiraLogin, password: settings.jiraPassword };
        const jira = await JiraClient.getConnection(config);

        const pageSize = 100;
        let startAt = 0;
        let totalIssuesInJira = 0;

        do {
            // ПРОВЕРКА НА ИТЕРАЦИИ: Не отменил ли пользователь задачу, пока мы ждали прошлую порцию?
            if (task.isCancelled) {
                console.log(`[Task ${taskId}] Цикл остановлен по требованию пользователя.`);
                return; // Просто выходим, статус уже изменен на "cancelled" в эндпоинте отмены
            }

            const endpoint = `/rest/api/2/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${pageSize}`;
            const searchResult = await jira.request(endpoint);
            
            const chunk = searchResult.issues || [];
            totalIssuesInJira = searchResult.total;

            if (chunk.length === 0) break;

            // Наполняем задачу данными прямо в памяти
            task.total = totalIssuesInJira;
            task.issues = task.issues.concat(chunk);

            startAt += chunk.length;

            // Небольшая пауза (опционально), чтобы не спамить Jira (например, 100мс)
            await new Promise(resolve => setTimeout(resolve, 100));

        } while (startAt < totalIssuesInJira);

        // Если дошли сюда и никто не отменил — задача успешно выполнена
        if (!task.isCancelled) {
            task.status = "completed";
            console.log(`[Task ${taskId}] Успешно завершена. Собрано задач: ${task.issues.length}`);
        }

    } catch (error) {
        console.error(`[Task ${taskId}] Ошибка выполнения:`, error);
        task.status = "failed";
        task.error = error.message;
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

app.get("/sprints", async (req, res) => {
    getSprints(res);
});

app.get("/search", async (req, res) => {
    getIssuesByJql(req, res);
});

app.post("/search/start", async (req, res) => {
    startSearch(req, res);
});

app.get("/search/status/:taskId", (req, res) => {
    getSearchStatus(req, res)
});

// 3. ПРИНУДИТЕЛЬНАЯ ОТМЕНА ЗАДАЧИ ПОЛЬЗОВАТЕЛЕМ
app.post("/search/cancel/:taskId", (req, res) => {
    cancelSearch(req, res)
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
