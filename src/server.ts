import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import movies from './api/movies.route';
import users from './api/users.route';

const app = express();

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register api routes
app.use('/api/v1/movies', movies);
app.use('/api/v1/user', users);
app.use('/status', express.static('build'));
app.use('/', express.static('build'));
app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

export default app;