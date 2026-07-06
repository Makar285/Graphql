const multer = require('multer');
const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const Feed = require('./models/feed');


function deleteImage(fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  fs.unlink(filePath, (err => console.log(err)));
};


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },

  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + Buffer.from(decodeURIComponent(file.originalname), 'latin1').toString('utf8'));
  }
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  };
};



const cors = require('cors');
app.use(cors({
  origin: ["https://makar285.github.io", "http://127.0.0.1:5500", 'https://makar-server-test.loca.lt'],
  credentials: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));


const auth = require('./middleware/auth');
app.use(auth);

// Будет перед добавлением поста в бд и изменением данных поста
app.put('/post-image', async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  if(!req.isAuth) {
    const error = new Error('Вы не авторизованы.');
    error.statusCode = 401;
    throw error;
  };

  if(req.file) {
    return res.status(201).json({ message: "Файл сохранен", filePath: req.file.path });
  } else {
    return res.status(200).json({ message: "Файл не был предоставлен" });
  };
});

app.put('/post-image-delete', async (req, res, next) => {
  console.log('requserid', req.userId);

  if(!req.isAuth) {
    const error = new Error('Вы не авторизованы.');
    error.statusCode = 401;
    throw error;
  };

  // Для изменения данных, если id был передан удалить изображение для этого поста
  const notPost = await Feed.getPostById(req.body.postIdForDelete);
  const post = notPost.rows[0];
  console.log(req.userId, post.creator_user_id);

  if(post.creator_user_id != req.userId) {
    const error = new Error('Мы хотите изменить не свой пост');
    error.statusCode = 403;
    return next(error);
  } else {
    const pathForDelete = post.image_url;
    deleteImage(pathForDelete);
  };

  if(req.file) {
    res.status(200).json({ sendFile: true, filePath: req.file.path });
  } else {
    res.status(200).json({ sendFile: false });
  };
});


const { ruruHTML } = require('ruru/server'); // Импортируем HTML-интерфейс
app.get('/graphiql', (req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

// For graphql
const { createHandler } = require('graphql-http/lib/use/express');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
app.all('/graphql', createHandler({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  context: (contextParams) => {
    const req = contextParams.raw; // Это и есть настоящий req от Express
    return { req }; // Передаем его в контекст GraphQL
  },
  formatError(err) {
    console.log(1111);
    console.log(err);
    console.log(err.errors);
    console.log(err.data);
    console.log(err.originalError);
    console.log(22222)
    if(!err.originalError) {
      return err;
    };
    const message = err.message || 'Произошла ошибка';
    const data = err.originalError.data || null;
    const statusCode = err.originalError.statusCode || 500;
    console.log({ message, statusCode, data });
    return { message, statusCode, data };
  }
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((err, req, res, next) => {
  console.log('ВСЯ ОШИБКА', err);
  console.log('Статус ошибки', err.statusCode);
  console.log('Сообщение ошибки', err.message);
  console.log('вывод информации об ошибке закончен', 11111111111111);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ошибка сервера';
  res.status(statusCode).json({ type: "text", result: message });
});

app.listen(8080);