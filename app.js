// server/app.js

// Define required modules
const config = require('./config');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// TODO(ntpttr): If we end up with a production mongodb somehow
// update this url from development to production.
dotenv.config();
const mongo_url = process.env.MONGODB_URI || config.db.development;
const port = parseInt(process.env.PORT, 10) || 3000;
const testing = module.parent == null ?
    false : module.parent.filename.indexOf('test') != -1;

// Create global app object.
const app = express();
app.use(require('morgan')('dev'));
app.use(require('sanitize').middleware);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(session({
  secret: config.secret,
  cookie: {maxAge: 60000},
  resave: false,
  saveUninitialized: false,
}));

if (!testing) {
  mongoose.connect(
    mongo_url,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
    }, function(err) {
      if (err) throw err;
    });
}

require('./config/passport');

// Server-side API.
app.use(require('./routes'));


const server = app.listen(port, (err) => {
  if (err) throw err;
  console.log('Server listening on port ' + port + '...');
});

module.exports = {
  server,
};
