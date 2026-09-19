import express from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3010;

// 1. Подключаемся к MongoDB (к базе данных 'apps')
connect(
      'mongodb+srv://mikhailserkin_db_user:eoqec1ZfzUoGNoqu@cluster0.uvazvte.mongodb.net/jiraffe'
//    'mongodb://127.0.0.1:27017/apps'
)
    .then(() => console.log('Успешно подключились к MongoDB!'))
    .catch((err) => console.error('Ошибка подключения к базе:', err));

const queryShortInfoSchema = new Schema(
    {
        id: String,
        name: String,
        queryText: String,
        epicViewType: String,
        levelFilters: {
            type: [Schema.Types.Mixed],
            default: [],
        },        
    },
    { collection: 'queries' },
);

const QueryShortInfo = model('Query', queryShortInfoSchema)

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

        return res
            .status(200)
            .json(queryList);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: 'Ошибка сервера при поиске запросов' });
    }
}

async function getQueryById(req, res) {
    try {
        const { id } = req.params;
        const query = await QueryShortInfo.findOne({ id }, { _id: 0 });

        if (!query) {
            return res
                .status(404)
                .json({ message: 'Запрос не найден' });
        }

        return res
            .status(200)
            .json(query);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: 'Ошибка сервера при поиске запроса' });
    }
}

async function insertQuery(req, res) {
    try {
        if (
            !req.body
            || typeof req.body !== 'object'
            || Array.isArray(req.body)
        ) {
            return res
                .status(400)
                .json({ error: 'Тело запроса должно быть объектом' });
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'id')) {
            return res
                .status(400)
                .json({ error: 'Поле id не должно передаваться' });
        }

        const query = await QueryShortInfo.create({
            ...req.body,
            id: randomUUID(),
        });
        const queryDocument = query.toObject({ versionKey: false });
        delete queryDocument._id;

        return res
            .status(201)
            .json(queryDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: 'Ошибка сервера при сохранении запроса' });
    }
}

async function updateQueryById(req, res) {
    try {
        const { id } = req.params;

        if ( !req.body || typeof req.body !== 'object' || Array.isArray(req.body) ) {
            return res
                .status(400)
                .json({ error: 'Тело запроса должно быть объектом' });
        }

       const updatedQuery = {
            ...req.body,
            id,
        };

        const query = await QueryShortInfo.findOneAndUpdate(
            { id },
            { $set: updatedQuery },
            { new: true, runValidators: true },
        );

        if (!query) {
            return res
                .status(404)
                .json({ error: 'Документ с указанным id не найден' });
        }

        const queryDocument = query.toObject({ versionKey: false });
        delete queryDocument._id;

        return res
            .status(200)
            .json(queryDocument);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: 'Ошибка сервера при обновлении запроса' });
    }
}

app.get('/queries', async (req, res) => {
    getQueryList(res);
});

app.post('/queries', async (req, res) => {
    insertQuery(req, res);
});

app.get('/queries/:id', async (req, res) => {
    getQueryById(req, res);
});

app.put('/queries/:id', async (req, res) => {
    updateQueryById(req, res);
});


app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
