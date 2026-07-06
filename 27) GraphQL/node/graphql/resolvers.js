const Auth = require('../models/auth');
const bcryptjs = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const helper = require('../helper');
const Feed = require('../models/feed');


module.exports = {
  async createUser({ userInput }) {
    const { email, name, password } = userInput;

    const errors = [];
    if(!validator.isEmail(email)) {
      errors.push({ message: "Неверный email", value: email  });
    };

    if(validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
      errors.push({ message: 'Пароль слишком короткий', value: password });
    };

    if(errors.length>0) {
      const error = new Error('Данные не прошли проверку валидности');
      error.statusCode = 422;
      error.data = errors;
      throw error;
    } else {
      const user = await Auth.getUserByEmail(email);
      if(user.rows.length > 0) {
        const error = new Error('Пользователь с такой почтой уже существует');
        error.statusCode = 409;
        throw error;
      } else {
        const hashPassword = await bcryptjs.hash(password, 12)
        console.log(hashPassword);

        const notUserId = await Auth.signup(name, email, hashPassword)
        const { id: userId, status } = notUserId.rows[0];
        console.log(userId);

        const token = jwt.sign({ userId }, helper.SECRET_KEY, { expiresIn: '1h' });
        return { message: "User Created", userId, status, token };
      };
    };
  },

  async login({ email, password }) {
    const data1 = await Auth.getUserByEmail(email);
    const user = data1.rows[0];
    console.log(user);

    if(!user) {
      // пользователя с такой почтой не найден
      const error = new Error('Пользователь с такой почтой не найден.');
      error.statusCode = 401;
      throw error;
    } else {
      const data2 = await bcryptjs.compare(password, user.password);
      console.log(data2);

      if(!data2) {
        // Неверный пароль
        const error = new Error('Неверный пароль.');
        error.statusCode = 401;
        throw error;
      } else {
        //  Пользоатель с такой почтой существует и пароль верный
        const token = jwt.sign({ userId: user.id }, helper.SECRET_KEY, { expiresIn: '1h' });
        return { token, userId: user.id, status: user.status };
      };
    };
  },

  async createPost({ title, content, image_url }, { req }) {
    console.log('orororororororkopkf', req.isAuth, req.userId);

    if(req.isAuth) {
      const errors = [];
      if(title.length < 5) {
        errors.push({ message: "Заголовок слишкой короткий", value: title });
      };

      if(content.length<5) {
        errors.push({ message: "Контено слишком короткий", value: content });
      };
      
      if(errors.length > 0) {
        const error = new Error('Данные не прошли проверку валидности');
        error.statusCode = 422;
        error.data = errors;
        throw error;
      };

      const creator_user_id = req.userId;

      // if(!req.file) {
      //   const error = new Error('Изображения нет');
      //   error.statusCode = 422;
      //   next(error);
      // };

      // const image_url = req.file.path;

      const created_at = new Date().toISOString();

      console.log(title, content, image_url, creator_user_id, created_at);

      try {
        const data1 = await Feed.addPost(title, content, image_url, creator_user_id, created_at)
        const postId = data1.rows[0].id;
        console.log(postId);

        const data2 = await Feed.getPostByIdForCreatePost(postId);
        const post = data2.rows[0];
        console.log(post);

        // res:
        // message: String!
        // post_id: ID!
        // title: String!
        // content: String!
        // image_url: String!
        // creator_user_id: Int!
        // post_created_at: String!
        // user_id: ID!
        // name: String!
        // email: String!
        // password: String!
        // status: String!
        // user_created_at: String!

        console.log(typeof created_at, created_at, typeof post.created_at, post.created_at);

        const res = {
          message: "Пост создан",
          post_id: post.post_id,
          title,
          content,
          image_url,
          creator_user_id,
          post_created_at: created_at,
          user_id: creator_user_id,
          name: post.name,
          email: post.email,
          password: post.password,
          status: post.status,
          user_created_at: post.created_at.toISOString()
        };

        console.log(res);

        return res;
      } catch(err) {
        console.log('err catch createPost', err);

        const error = new Error('Неполадки с базой данных, пожалуйста подождите и попробуйте еще раз позже');
        error.statusCode = 500;
        throw error;
      };
    } else {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };
  },

  async getAllPosts({ page }, { req }) {
    console.log('pagegegegege', page);
    if(req.isAuth) {
      const data1 = await Feed.getAllPosts(page);
      const posts = data1.rows;
      console.log(posts);
  
      if(posts.length > 0) {
        const notCountPosts = await Feed.getCountPosts();
        const countPosts = notCountPosts.rows[0].c;
        console.log(countPosts);

        return { posts, countPosts };
      } else {
        const error = new Error('Постов нету');
        error.statusCode = 200;
        throw error;
      };
    } else {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };
  },

  async getPostById(args, context) {
    if(!req.isAuth) {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };

    const postId = args.postId;
    const req = context.req;

    const notPost = await Feed.getPostById(postId);
    const post = notPost.rows[0];

    return post;
  },

  async editPost(args, context) {
    if(!req.isAuth) {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };

    const { postId, title, content, image_url, sendFile } = args;
    const req = context.req;

    console.log('0202020202', postId, title, content, image_url, sendFile);

    await Feed.updatePostById(postId, title.trim(), content.trim(), image_url, sendFile);
    const notPost = await Feed.getPostById(postId);
    const post = notPost.rows[0];
    console.log('post', post);
    return post;
  },

  async deletePost(args, context) {
    if(!req.isAuth) {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };

    const { postId } = args;
    const { req } = context;

    try {
      const not = await Feed.getPostById(postId);
      const post = not.rows[0];
      if(!post) {
        const error = new Error("Пост с таким id не найден");
        error.statusCode = 404;
        throw error;
      };

      if(post.creator_user_id != req.postId) {
        const error = new Error('Вы не хотите удалить не свой пост.');
        error.statusCode = 403;
        throw error;
      };

      await Feed.deletePostById(postId);
      return { message: "Пост успешно удален" };
    } catch(err) {
      console.log('err catch createPost', err);

      if(err.statusCode) {
        throw err;
      } else {
        const error = new Error('Неполадки с базой данных, пожалуйста подождите и попробуйте еще раз позже');
        error.statusCode = 500;
        throw error;
      };
    };
  },

  async setStatus({ newStatus }, { req }) {
    if(!req.isAuth) {
      const error = new Error('Вы не авторизованы.');
      error.statusCode = 401;
      throw error;
    };

    await Auth.updateStatusUserById(req.userId, newStatus);
    return newStatus;
  },
  
  async main({ token }) {
    const { userId } = jwt.verify(token, helper.SECRET_KEY);
    console.log(userId);
    const data1 = await Auth.getUserById(userId)
    const user = data1.rows[0];
    console.log('user', user);

    if(!user) {
      const error = new Error('Пользователь с таким id не сущестувет');
      error.statusCode = 404;
      throw error;
    };
    return { status: user.status };
  },
};