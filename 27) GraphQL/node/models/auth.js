const pool = require('../util/db');

module.exports = class Auth {
  static getUserByEmail(email) {
    return pool.query(` SELECT * FROM users u
                        WHERE u.email = $1;`, [email]);
  };

  static signup(name, email, password) {
    console.log(name, email, password);
    return pool.query(` INSERT INTO users(name, email, password, status)
                        VALUES
                          ($1, $2, $3, 'I am new')
                          RETURNING id, status;`, [name, email, password]);
  };

  static getUserById(userId) {
    return pool.query(` SELECT * FROM users
                        WHERE id = $1;`, [userId]);
  };

  static updateStatusUserById(userId, newTitle) {
    return pool.query(` UPDATE users
                        SET status = $2
                        WHERE id = $1
                        RETURNING status;`, [userId, newTitle]);
  };
};