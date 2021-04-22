/* eslint-disable import/extensions */
import { MongoClient } from 'mongodb';
import app from './server';
import MoviesDAO from './dao/moviesDAO';
import UsersDAO from './dao/usersDAO';
import CommentsDAO from './dao/commentsDAO';

require('dotenv').config();

const port = process.env.PORT || 8000;

MongoClient.connect(process.env.FLIX_DB_URI as string, {
  useNewUrlParser: true,
  poolSize: 50,
  wtimeout: 2500
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await MoviesDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await CommentsDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
