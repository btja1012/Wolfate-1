var UsersDAO = require('../users').UsersDAO
  , SessionsDAO = require('../sessions').SessionsDAO;

/* The SessionHandler must be constructed with a connected db */
function SessionHandler (db) {
    "use strict";

    var users = new UsersDAO(db);
    var sessions = new SessionsDAO(db);

    this.isLoggedInMiddleware = function(req, res, next) {
        var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username) {
            "use strict";

            if (!err && username) {
                req.username = username;
            }
            return next();
        });
    }

    this.displayLoginPage = function(req, res, next) {
        "use strict";
        return res.render("login", {username:"", password:"", login_error:""})
    }

    this.handleLoginRequest = function(req, res, next) {
        "use strict";

        var username = req.body.username;
        var password = req.body.password;

        console.log("user submitted username: " + username + " pass: " + password);

        users.validateLogin(username, password, function(err, user) {
            "use strict";

            if (err) {
                if (err.no_such_user) {
                    return res.render("login", {username:username, password:"", login_error:"No such user"});
                }
                else if (err.invalid_password) {
                    return res.render("login", {username:username, password:"", login_error:"Invalid password"});
                }
                else {
                    // Some other kind of error
                    return next(err);
                }
            }

            sessions.startSession(user['_id'], function(err, session_id) {
                "use strict";

                if (err) return next(err);

                res.cookie('session', session_id);
                return res.redirect('/welcome');
            });
        });
    }

    this.displayLogoutPage = function(req, res, next) {
        "use strict";

        var session_id = req.cookies.session;
        sessions.endSession(session_id, function (err) {
            "use strict";

            // Even if the user wasn't logged in, redirect to home
            res.cookie('session', '');
            return res.redirect('/');
        });
    }

    this.displaySignupPage =  function(req, res, next) {
        "use strict";
        res.render("signup", {username:"", username_error:"",
                                password:"", password_error:"",
                                email:"", email_error:"", 
                                firstname:"", fistname_error:"",
                                lastname:"", lastname_error:"",
                                verify:"", verify_error :"", 
                                page_class: "signup"});
    }

    function validateSignup(username, password, verify, email, firstname, lastname, errors) {
        "use strict";
        var USER_RE = /^[a-zA-Z0-9_-]{3,20}$/;
        var PASS_RE = /^.{3,20}$/;
        var EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;
        var findError = false;

        errors['username_error'] = "";
        errors['password_error'] = "";
        errors['verify_error'] = "";
        errors['email_error'] = "";
        errors['firstname_error'] = "";
        errors['lastname_error'] = "";
        
        if (firstname == "") {
            errors['firstname_error'] = "This field is required";
            //return false;
            findError = true;
        }
        if (lastname == "") {
            errors['lastname_error'] = "This field is required";
            //return false;
            findError = true;
        }
        if (!USER_RE.test(username)) {
            errors['username_error'] = "invalid username. try just letters and numbers";
            //return false;
            findError = true;
        }
        if (!EMAIL_RE.test(email)) {
            errors['email_error'] = "invalid email address";
            //return false;
            findError = true;
        }
        if (!PASS_RE.test(password)) {
            errors['password_error'] = "invalid password.";
            //return false;
            findError = true;
        }
        if (password != verify || verify == "") {
            errors['verify_error'] = "password must match";
            //return false;
            findError = true;
        }
        
        if(findError){
            return false;
        } else {
            return true;
        }
    }

    this.handleSignup = function(req, res, next) {
        "use strict";

        var email = req.body.email
        var firstname = req.body.firstname
        var lastname = req.body.lastname
        var username = req.body.username
        var password = req.body.password
        var verify = req.body.verify

        // set these up in case we have an error case
        var errors = {'username': username, 'email': email, 'firstname': firstname, 'lastname': lastname}
        if (validateSignup(username, password, verify, email, firstname, lastname, errors)) {
            users.addUser(username, password, email, firstname, lastname, function(err, user) {
                "use strict";

                if (err) {
                    // this was a duplicate
                    if (err.code == '11000') {
                        errors['username_error'] = "Username already in use. Please choose another";
                        return res.render("signup", errors);
                    }
                    // this was a different error
                    else {
                        return next(err);
                    }
                }

                sessions.startSession(user['_id'], function(err, session_id) {
                    "use strict";

                    if (err) return next(err);

                    res.cookie('session', session_id);
                    return res.redirect('/welcome');
                });
            });
        }
        else {
            console.log("user did not validate");
            return res.render("signup", errors);
        }
    }

    this.displayWelcomePage = function(req, res, next) {
        "use strict";

        if (!req.username) {
            console.log("welcome: can't identify user...redirecting to signup");
            return res.redirect("/signup");
        }

        return res.render("welcome", {'username':req.username})
    }
}

module.exports = SessionHandler;
