const pool = require('../util/db');
const helper = require('../helper');

module.exports = class Feed {
  static addPost(title, content, imageUrl, creator_user_id, created_at) {
    return pool.query(` INSERT INTO posts (title, content, image_url, creator_user_id, created_at)
                        VALUES
                          ($1, $2, $3, $4, $5)
                        RETURNING id;`, [title, content, imageUrl, creator_user_id, created_at]);
  };

  static getPostById(postId) {
    return pool.query(` SELECT p.id AS post_id, p.title AS title, p.content AS content, p.image_url AS image_url, p.creator_user_id AS creator_user_id, p.created_at AS post_created_at, u.id AS user_id, u.name AS name, u.email AS email, u.password AS password, u.status AS status, u.created_at AS user_created_at FROM posts p
                        INNER JOIN users u ON p.creator_user_id = u.id
                        WHERE p.id = $1;`, [postId]);
  };

  static updatePostById(postId, title, content, image_url, sendFile) {
    console.log('prprprprp0r', postId, title, content, image_url, sendFile);

    if(sendFile) {
      if(title) {
        if(content) {
          return pool.query(` UPDATE posts
                              SET title = $2, content = $3, image_url = $4
                              WHERE id = $1;`, [postId, title, content, image_url]);
        } else {
          return pool.query(` UPDATE posts
                              SET title = $2, image_url = $3
                              WHERE id = $1;`, [postId, title, image_url]);
        }
      } else {
        if(content) {
          return pool.query(` UPDATE posts
                              SET content = $2, image_url = $3
                              WHERE id = $1;`, [postId, content, image_url]);
        } else {
          return pool.query(` UPDATE posts
                              SET image_url = $2
                              WHERE id = $1;`, [postId, image_url]);
        };
      };
    } else {
      if(title) {
        if(content) {
          return pool.query(` UPDATE posts
                              SET title = $2, content = $3
                              WHERE id = $1;`, [postId, title, content]);
        } else {
          return pool.query(` UPDATE posts
                              SET title = $2
                              WHERE id = $1;`, [postId, title]);
        }
      } else {
        if(content) {
          return pool.query(` UPDATE posts
                              SET content = $2
                              WHERE id = $1;`, [postId, content]);
        } else {
          // return pool.query(` UPDATE posts
          //                     SET
          //                     WHERE id = $1
          //                     RETURNING id;`, [postId]);
          return Promise.resolve({ rows: [{ id: postId, type: "notUpdate" }] });
        };
      };
    };
  };

  static deletePostById(postId) {
    return pool.query(` DELETE FROM posts
                        WHERE id = $1;`, [postId]);
  };

  static getAllPosts(page) {
    const limit = helper.LIMIT;
    const offset = (+page-1)*limit;
    console.log(limit, offset, page);
    return pool.query(` SELECT p.id AS post_id, p.title AS title, p.content AS content, p.image_url AS image_url, p.creator_user_id AS creator_user_id, p.created_at AS post_created_at, u.id AS user_id, u.name AS name, u.email AS email, u.password AS password, u.status AS status, u.created_at AS user_created_at FROM posts p
                        INNER JOIN users u ON p.creator_user_id = u.id
                        ORDER BY p.id
                        LIMIT $1
                        OFFSET $2;`, [limit, offset]);
  };

  static getPostByIdForCreatePost(postId) {
    return pool.query(` SELECT p.id AS post_id, u.name, u.email, u.password, u.status, u.created_at FROM posts p
                        INNER JOIN users u ON p.creator_user_id = u.id
                        WHERE p.id = $1
                        ORDER BY p.id;`, [postId]);
  };

  static getCountPosts() {
    return pool.query(` SELECT COUNT(*) AS c FROM posts;`);
  };
};