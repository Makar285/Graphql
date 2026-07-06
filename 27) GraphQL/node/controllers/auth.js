const Auth =require('../models/auth');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const helper = require('../helper');

const { validationResult } = require('express-validator');

module.exports.postSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()) {
    return res.status(422).json({ error: true, ...errors});
  };

  try {
    const hashPassword = await bcryptjs.hash(password, 12)
    console.log(hashPassword);

    const notUserId = await Auth.signup(name, email, hashPassword)
    const userId = notUserId.rows[0].id;
    console.log(userId);
    res.status(201).json({ message: "User Created", userId });
  } catch(err) {
    next(err);
  };
};

module.exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password)

  const errors = validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()) {
    return res.status(422).json({ error: true, ...errors});
  };

  try {
    const data1 = await Auth.getUserByEmail(email)
    const user = data1.rows[0];
    console.log(user);
    if(!user) {
      // пользователя с такой почтой не найден
      const error = new Error('Пользователь с такой почтой не найден.');
      error.statusCode = 401;
      throw error;
    };

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
      console.log(token)
      res.status(200).json({ token, user: user });
    };
  } catch(err) {
    next(err);
  };
};