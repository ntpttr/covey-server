// server/controllers/userController.js

const crypto = require('crypto');
const passport = require('passport');
const sgMail = require('@sendgrid/mail');
const validator = require('validator');

/**
 * Authenticate a user based on credentials.
 * @param {object} creds - The credentials to check.
 * @param {function} callback - The callback function.
 */
function authenticate(creds, callback) {
  if (!creds.body.username) {
    callback(422, {
      'message': 'username is empty',
    });

    return;
  }

  if (!creds.body.password) {
    callback(422, {
      'message': 'password is empty',
    });

    return;
  }

  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (user) {
      if (!user.isVerified) {
        callback(401, {
          'message': 'Your account has not been verified.',
        });

        return;
      }

      callback(200, {
        'user': user,
      });
    } else {
      callback(401, info);
    }
  })(creds, callback);
};

/**
 * Confirm a user account
 * @param {schema} User - The user mongoose schema.
 * @param {schema} ValidationKey - The validation key mongoose schema.
 * @param {string} token - The confirmation token.
 * @param {function} callback - The callback function.
 */
function confirmUser(User, ValidationKey, token, callback) {
  ValidationKey.findOne({token: token}, function(err, key) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!key) {
      callback(404, {
        'message': 'Unable to find a valid token. Your token may have expired.',
      });

      return;
    }

    User.findOne({_id: key.userId}, function(err, user) {
      if (err) {
        callback(500, {
          'message': err,
        });

        return;
      }

      if (!user) {
        callback(404, {
          'message': 'Unable to find a user that corresponds to this token.',
        });

        return;
      }

      if (user.isVerified) {
        callback(400, {
          'message': 'This user has already been verified',
        });

        return;
      }

      user.isVerified = true;
      user.save(function(err) {
        if (err) {
          callback(500, {
            'error': err,
          });

          return;
        }

        callback(200, {
          'message': 'The account has been verified. Please log in.',
        });
      });
    });
  });
}

/**
 * Resend a confirmation email to a given user.
 * @param {schema} User - The user mongoose schema.
 * @param {schema} ValidationKey - The validation key mongoose schema.
 * @param {string} username - The username to resend the validation email to.
 * @param {string} host = The host for the email verification URL.
 * @param {function} callback - The callback function.
 */
function resendConfirmation(User, ValidationKey, username, host, callback) {
  User.findOne({username: username}, function(err, user) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!user) {
      callback(404, {
        'message': 'User ' + username + ' not found.',
      });

      return;
    }

    if (user.isVerified) {
      callback(400, {
        'message': 'User ' + username + ' has already been verified.',
      });

      return;
    }

    sendConfirmationEmail(ValidationKey, user, host, callback);
  });
}

/**
 * Create a new user.
 * @param {schema} User - The user mongoose schema.
 * @param {schema} ValidationKey = The validation key mongoose schema.
 * @param {object} properties - The user properties.
 * @param {string} host = The host for the email verification URL.
 * @param {function} callback - The callback function.
 */
function createUser(User, ValidationKey, properties, host, callback) {
  const {email, username, password} = properties;

  if (!email) {
    callback(400, {
      'message': 'Must provide email',
    });
  }

  if (!validator.isEmail(email)) {
    callback(422, {
      'message': 'email is not valid',
    });
    return;
  }

  if (!username) {
    callback(400, {
      'message': 'Must provide username',
    });
  }

  if (!password) {
    callback(400, {
      'message': 'Must provide password',
    });
  }

  const user = new User({
    email: email,
    username: username,
  });

  user.setPassword(password);

  user.save(function(err) {
    if (err) {
      if (err.name === 'ValidationError') {
        if (err.errors && err.errors.email) {
          callback(409, {
            'message': 'Email ' + err.errors.email.value +
                       ' is already registered with an account.',
          });

          return;
        }

        if (err.errors && err.errors.username) {
          callback(409, {
            'message': 'Username ' + err.errors.username.value +
                       ' is already taken.',
          });

          return;
        }
      } else {
        callback(500, {
          'error': err,
        });

        return;
      }
    }

    sendConfirmationEmail(ValidationKey, user, host, function(sendStatus, sendBody) {
      if (sendStatus != 200) {
        callback(200, {
          'message': 'User created but system failed to send confirmation email. Try again later.',
        });

        return;
      }

      callback(sendStatus, sendBody);
    });
  });
}

/**
 * Get a user based on its name.
 * @param {schema} User - The user mongoose schema.
 * @param {string} username - The username to get.
 * @param {function} callback - The callback function.
 */
function getUserDetails(User, username, callback) {
  User.findOne({username: username}).
      populate('groups').
      exec(function(err, user) {
        if (err) {
          callback(500, {
            'error': err,
          });
        } else if (user) {
          callback(200, {
            'user': user,
          });
        } else {
          callback(404, {
            'message': 'user not found',
          });
        }
      });
}

/**
 * Update an existing user.
 * @param {schema} User - The user mongoose schema.
 * @param {string} username - The name of the user to update.
 * @param {object} properties - The properties for the user.
 * @param {function} callback - The callback function.
 */
function updateUser(User, username, properties, callback) {
  if (!properties.username && !properties.image && !properties.password && !properties.name) {
    callback(400, {
      'message': 'Must provide a valid property to update.',
    });

    return;
  }

  getUserDetails(User, username, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }

    user = body.user;

    if (properties.password) {
      user.setPassword(properties.password);
    }

    Object.assign(user, properties).save((err, user) => {
      if (err) {
        if (err.name === 'ValidationError') {
          if (err.errors.email) {
            callback(409, {
              'message': 'Email ' + err.errors.email.value +
                         ' is already registered with an account.',
            });
  
            return;
          }
  
          if (err.errors.username) {
            callback(409, {
              'message': 'Username ' + err.errors.username.value +
                         ' is already taken.',
            });
  
            return;
          }
        } else {
          callback(500, {
            'error': err,
          });
        }
      } else {
        callback(200, {
          'user': user,
        });
      }
    });
  });
}

/**
 * Add a reference to a group
 * @param {schema} User - The user mongoose schema
 * @param {string} username - The username of the user to update.
 * @param {string} groupId - The group Id to add.
 * @param {function} callback - The callback function.
 */
function addGroupLink(User, username, groupId, callback) {
  User.findOneAndUpdate(
    {username: username},
    {$addToSet: {groups: groupId}}, 
    {new: true}
  ).exec(function(err, user) {
    if (err) {
      callback(500, {
        'error': err,
      });
    } else {
      callback(200, {
        'user': user,
      });
    }
  });
}

/**
 * Remove a reference to a group
 * @param {schema} User - The user mongoose schema
 * @param {string} username - The username of the user to update.
 * @param {string} groupId - The group mongoose Id.
 * @param {function} callback - The callback function.
 */
function removeGroupLink(User, username, groupId, callback) {
  User.findOneAndUpdate(
    {username: username},
    {$pull: {groups: groupId}},
    {new: true,}
  ).exec(function(err, user) {
    if (err) {
      callback(500, {
        'error': err,
      });
    } else {
      callback(200, {
        'user': user,
      });
    }
  });
}

/**
 * Delete a user.
 * @param {schema} User - The user mongoose schema.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} username - The username of the user to delete.
 * @param {function} callback - The callback function.
 */
function deleteUser(User, Group, username, callback) {
  User.findOne(
    {username: username}
  ).populate('groups').exec(function(err, user) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (user) {
      // First delete this group from all user lists.
      user.groups.forEach(function(group) {
        Group.update({
          _id: group._id,
        }, {
          $pull: {
            users: user._id,
          },
        }).exec(function(err) {
          if (err) {
            console.log(err);
          }
        });
      });

      user.remove();

      callback(200, {
        'message': 'user ' + username + ' deleted successfully',
      });
    } else {
      callback(404, {
        'message': 'user ' + username + ' not found',
      });
    }
  });
}

/**
 * Send a validation email to a user.
 * @param {schema} ValidationKey - The validation key mongoose schema.
 * @param {Object} user - The user to send the validation email to.
 * @param {string} host = The host for the email verification URL.
 * @param {function} callback - The callback function.
 */
function sendConfirmationEmail(ValidationKey, user, host, callback) {
  // Create a validation key for this user
  const validationKey = new ValidationKey({
    userId: user._id,
    token: crypto.randomBytes(16).toString('hex'),
  });

  // Save the verification token
  validationKey.save(function(err) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: user.email,
      from: 'no-reply@coveyapp.com',
      subject: 'Account Verification Token',
      text: 'Hi ' + user.username + ',\n\n' + 'Verify your ' +
            'Covey account by clicking this link:' +
            '\nhttp:\/\/' + host + '\/user\/confirm\/' +
            validationKey.token + '.\n',
    };

    sgMail.send(msg, function(err) {
      if (err) {
        callback(500, {
          'error': err,
        });

        return;
      }

      callback(200, {
        'message': 'Confirmation email sent to ' + user.email,
      });
    });
  });
}

module.exports = {
  authenticate,
  confirmUser,
  resendConfirmation,
  getUserDetails,
  createUser,
  updateUser,
  addGroupLink,
  removeGroupLink,
  deleteUser,
};
