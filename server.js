// server/app.js

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
const users = require('./server/routes/users');
const groups = require('./server/routes/groups');

mongoose.connect(url, function(err) {
    if (err) throw err;
});

const app = next({dir: './client', dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // parse application/json
    server.use(bodyParser.json());
    // parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({extended: true}));

    // Server-side API
    server.use('/groups', groups);
    server.use('/users', users);

    server.get('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, err => {
        if (err) throw err;
        console.log("Server listening on port " + port + "...");
    });
});
