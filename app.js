// server/app.js

// Define required modules
const config = require('./config');
const express = require('express');
const next = require('next');
const bodyParser =require('body-parser');
const mongoose = require('mongoose');

// TODO(ntpttr): If we end up with a production mongodb somehow
// update this url from development to production.
const dev = process.env.NODE_ENV !== 'production';
const url = process.env.MONGODB_URI || config.db.development;
const port = parseInt(process.env.PORT, 10) || 3000;
const testing = module.parent != null;

// Define route variables
const userRoutes = require('./server/routes/userRoutes');
const groupRoutes = require('./server/routes/groupRoutes');
const gameRoutes = require('./server/routes/gameRoutes');

// Define schema variables
const userSchema = require('./server/models/User');
const groupSchema = require('./server/models/Group');
const gameSchema = require('./server/models/Game');

// Define controller variables
const userController = require('./server/controllers/userController');
const groupController = require('./server/controllers/groupController');
const gameController = require('./server/controllers/gameController');

if (!testing) {
  mongoose.connect(url, {useNewUrlParser: true}, function(err) {
    if (err) throw err;
  });
}

const app = next({dir: './client', dev});
const handle = app.getRequestHandler();

const server = express();

// parse application/json
server.use(bodyParser.json());
// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({extended: true}));

// Server-side API
server.use('/groups', function(req, res, next) {
  req.groupSchema = groupSchema;
  req.groupController = groupController;
  req.userSchema = userSchema;
  req.userController = userController;
  req.gameSchema = gameSchema;
  req.gameController = gameController;
  next();
}, groupRoutes);

server.use('/users', function(req, res, next) {
  req.userSchema = userSchema;
  req.userController = userController;
  req.groupSchema = groupSchema;
  req.groupController = groupController;
  next();
}, userRoutes);

server.use('/games', function(req, res, next) {
  req.gameSchema = gameSchema;
  req.gameController = gameController;
  next();
}, gameRoutes);

server.get('*', (req, res) => {
  return handle(req, res);
});

app.prepare().then(() => {
  if (!testing) {
    startServer(server);
  }
});

/**
 * Start the app server.
 * @param {*} server - The server object.
 * @return {server} - The listening server object.
 */
function startServer(server) {
  return server.listen(port, (err) => {
    if (err) throw err;
    console.log('Server listening on port ' + port + '...');
  });
}

module.exports = {
  server,
  startServer,
};
