const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

//add apollo server, middleware, graphql CRUDS
const { ApolloSever } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

//created apollo server with schema data
const server = new ApolloSever({
  typeDefs,
  resolvers,
  context: authMiddleware

});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//create new apollo instance with schema from graphql
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
