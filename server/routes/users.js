const express = require('express');
const router = express.Router();

const User = require('../models/User');
const userController = require('../controllers/users');

// List all users
router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            res.json({'status': false,
                      'message': 'Database error finding users!'});
        } else {
            res.json({'status': true,
                      'users': users});
        }
    });
});

// Get specific user
router.get('/:ident', function(req, res) {
    userController.getUser(req.params.ident, function(getRes) {
        res.json(getRes);
    });
});

// Create new user
router.post('/', function(req, res) {
    user = new User(req.body);

    user.save(function(err) {
        if (err) {
            var errMessage = '';
            if (err.code === 11000) {
                // Duplicate username found
                errMessage = 'Username already exists!';
            } else {
                errMessage = 'Error saving user!';
            }
            res.json({'status': false,
                      'message': errMessage});
            return;
        }
        res.json({'status': true,
                  'user': user});
    });
});

// Update an existing user
router.put('/:ident', function(req, res) {
    var userIdent = req.params.ident;
    userController.getUser(userIdent, function(userRes) {
        if (!userRes.status) {
            res.json({'status': false, 'message': userRes.message});
            return;
        }
        user = userRes.user;
        Object.assign(user, req.body).save((err, user) => {
            if (err) {
                res.json({'status': false, message: 'Error updating user!'});
            } else {
                res.json({'status': true, 'user': user});
            }
        }); 
    });
});

// Login
router.post('/login', function(req, res) {
    var creds = req.body;
    userController.authenticate(creds, function(auth) {
        res.json(auth);
    });
});

// Delete user
router.delete('/:ident', function(req, res) {
    userController.deleteUser(req.params.ident, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
