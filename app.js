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
const testing = module.parent == null ?
    false : module.parent.filename.indexOf('test') != -1;

const app = next({dir: './client', dev});
const handle = app.getRequestHandler();

const server = express();

if (!testing) {
  mongoose.connect(url, {useNewUrlParser: true}, function(err) {
    if (err) throw err;
  });
}

// parse application/json
server.use(bodyParser.json());
// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({extended: true}));

// Server-side API
server.use(require('./routes'));

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
