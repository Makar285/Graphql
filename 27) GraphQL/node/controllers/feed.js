const io = require('../socket');


const fs = require('fs');
const path = require('path');

const Feed = require('../models/feed');
const Auth = require('../models/auth');

const { validationResult } = require('express-validator');

function deleteImage(fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  fs.unlink(filePath, (err => console.log(err)));
};


module.exports.getPosts = async (req, res, next) => {
  try {
    const data = await Feed.getAllPosts()
    const posts = data.rows;
    console.log(posts);
    if(posts.length === 0) {
      const error = new Error('Постов не найдено.');
      error.statusCode = 200;
      throw error;
    };
    return res.status(200).json(posts);
  } catch(err) {
    next(err);
  };
};

module.exports.postCreatePost = async function(req, res, next) {
  console.log(req.body, req.file);
  console.log(req.body, req.file);
  console.log(req.body, req.file);

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    return res.status(422).json({error: true, ...errors});
  };

  if(!req.file) {
    const error = new Error('Изображения нет');
    error.statusCode = 422;
    next(error);
  };

  const { title, content } = req.body;
  const image_url = req.file.path;

  const creatorUserId = req.userId;
  const createdAt = new Date().toISOString();

  console.log(title, content, image_url, creatorUserId, createdAt);

  try {
    const data1 = await Feed.addPost(title, content, image_url, creatorUserId, createdAt)
    const postId = data1.rows[0].id;
    console.log(postId);

    const data2 = await Feed.getPostById(postId);
    const post = data2.rows[0];
    console.log(post);
    io.getIO().emit('posts', { action: 'create', post });
    res.status(201).json({ message: "Success", post });
  } catch(err) {
    next(err);
  };
};

module.exports.getPostById = async function(req, res, next) {
  const { postId } = req.params;

  try {
    const data1 = await Feed.getPostById(postId)
    const post = data1.rows[0];
    if(!post) {
      return res.status(404).json({ error: true, message: "Такой Пост Не Найден", type: "postNotFound" });
    };
    console.log(post);
    io.getIO().emit('posts', { action: "getPostById", post });
    res.status(200).json(post);
  } catch(err) {
    next(err);
  };
};

module.exports.updatePost = async function(req, res, next) {
  const userIdLogin = req.userId;
  const { postId } = req.params;
  const { title, content } = req.body;

  let image_url;
  let sendFile = false;
  if(req.file) {
    sendFile = true;
    image_url = req.file.path;
  };

  console.log(postId, title, content, image_url, sendFile);

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    return res.status(422).json({error: true, ...errors});
  };

  try {
    const data1 = await Feed.getPostById(postId)
    const post1 = data1.rows[0];
    if(!post1) {
      const error = new Error('Такой Пост Не Найден');
      error.statusCode = 404;
      throw error;
    };
    console.log(userIdLogin, post1.creator_user_id);
    if(userIdLogin!=post1.creator_user_id) {
      const error = new Error('Вы хотите изменить не свой пост');
      error.statusCode = 403;
      throw error
    };
    if((post1.image_url != image_url) && sendFile) {
      deleteImage(post1.image_url);
    };
    
    const notPostId = await Feed.updatePostById(postId, title, content, image_url, sendFile);
    console.log(notPostId);
    console.log(notPostId);
    const post2 = notPostId.rows[0];
    if(post2.type === "notUpdate") {
      const error = new Error('Изминения не было потому что вы не выбрали на что изминять значения');
      error.statusCode = 200;
      throw error;
    };
    console.log(postId);

    const data2 = await Feed.getPostById(postId);
    const post3 = data2.rows[0];
    console.log(post3);

    io.getIO().emit('posts', { action: 'update', post: post3 });

    res.status(200).json({ message: "Post Updated", post3 });
  } catch(err) {
    next(err);
  };
};

module.exports.deletePost = async function(req, res, next) {
  const userIdLogin = req.userId;
  const { postId } = req.params;

  try {
    const data1 = await Feed.getPostById(postId)
    const post = data1.rows[0];
    if(!post) {
      const error = new Error('Такой Пост Не Найден');
      error.statusCode = 404;
      throw error;
    };
    console.log('ududududud', userIdLogin, post.creator_user_id);
    // Проверить этот ли пользователь который отправил запрос создал этот пост
    if(userIdLogin!=post.creator_user_id) {
      const error = new Error('Вы хотите удалить не свой пост');
      error.statusCode = 403;
      throw error;
    };
    deleteImage(post.image_url);
    
    await Feed.deletePostById(postId);
    io.getIO().emit('posts', { action: 'delete', postId });
    res.status(200).json({ message: "Post Deleted" });
  } catch(err) {
    next(err);
  };
};

module.exports.getStatus = async function(req, res, next) {
  const { userId } = req;
  console.log('userid;', userId);

  try {
    const data1 = await Auth.getUserById(userId)
    const user = data1.rows[0];
    console.log('user', user);
    if(!user) {
      const error = new Error('Такой пользователь не найден.');
      error.statusCode = 401;
      throw error
    };
    return res.status(200).json({ status: user.status });
  } catch(err) {
    next(err);
  };
};

module.exports.postStatus = async function(req, res, next) {
  const { userId } = req;
  const { newStatus } = req.body;

  try {
    const data1 = await Auth.updateStatusUserById(userId, newStatus)
    const status = data1.rows[0].status;
    console.log('status', status);
    res.status(200).json({ newStatus });
  } catch(err) {
    next(err);
  };
};

module.exports.main = async function(req, res, next) {
  const { userId } = req;
  console.log(userId);

  try {
    const data1 = await Auth.getUserById(userId)
    const user = data1.rows[0];
    console.log('user', user);
    if(!user) {
      const error = new Error('Пользователь с таким id не сущестувет.');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({ user });
  } catch(err) {
    next(err);
  };
};