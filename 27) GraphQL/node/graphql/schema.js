const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type UserSignup {
    userId: ID!
    message: String!
    status: String!
    token: String!
  }

  type PostForCreatePost {
    message: String!
    post_id: Int!
    title: String!
    content: String!
    image_url: String!
    creator_user_id: Int!
    post_created_at: String!
    user_id: Int!
    name: String!
    email: String!
    password: String!
    status: String!
    user_created_at: String!
  }

  type Post {
    post_id: Int!
    title: String!
    content: String!
    image_url: String!
    creator_user_id: Int!
    post_created_at: String!
    user_id: Int!
    name: String!
    email: String!
    password: String!
    status: String!
    user_created_at: String!
  }

  type AllPosts {
    posts: [Post!]!
    countPosts: Int!
  }

  type AuthData {
    userId: ID!
    status: String!
    token: String!
  }

  type MainData {
    status: String!
  }

  input userInputData {
    email: String!
    name: String!
    password: String!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData
    getAllPosts(page: Int!): AllPosts
    getPostById(postId: Int!): Post
    main(token: String!): MainData
  }

  type DeletePost {
    message: String!
  }
  
  type RootMutation {
    createUser(userInput: userInputData): UserSignup!
    createPost(title: String!, content: String!, image_url: String!): PostForCreatePost
    editPost(postId: Int!, title: String!, content: String!, image_url: String!, sendFile: Boolean!): Post
    deletePost(postId: Int!): DeletePost
    setStatus(newStatus: String!): String!
  }
  
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
