const express = require('express');
const router = express.Router();

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('login');
    }
    next();
};

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/index');
    }
    next();
};

router.get('/register', ifLoggedin, (req, res) => {
    res.render('register', {
        register_error: [],
        old_data: {},
    });
});

router.get('/login', ifLoggedin, (req, res) => {

    if (req.query.register === 'success') {
        const registerSuccess = req.query.register === 'success';
        res.render('login', {
            login_errors: [],
            register_success: registerSuccess,

        });
    } else {
        res.render('login', {
            login_errors: [],

        });
    }


});

router.post('/login', ifLoggedin, [
    body('user_email').custom((value) => {
        return dbConnection.query('SELECT email FROM users WHERE email=$1', [value])
            .then((result) => {
                if (result.rows.length === 1) {
                    return true;
                }
                return Promise.reject('Invalid Email Address!');
            });
    }),
    body('user_pass', 'Password is empty!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;

    if (validation_result.isEmpty()) {
        dbConnection.query("SELECT * FROM users WHERE email=$1", [user_email])
            .then((result) => {
                bcrypt.compare(user_pass, result.rows[0].password).then((compare_result) => {
                    if (compare_result === true) {
                        req.session.isLoggedIn = true;
                        req.session.userID = result.rows[0].id;
                        res.redirect('/index');
                    } else {
                        res.render('login', {
                            login_errors: ['Invalid Password!'],
                        });
                    }
                })
                    .catch((err) => {
                        if (err) throw err;
                    });
            })
            .catch((err) => {
                if (err) throw err;
            });
    } else {
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        console.log(allErrors)
        res.render('login', {
            login_errors: allErrors,
        });
    }
});

router.post('/register', ifLoggedin, [
    body('user_email', 'Invalid email address!').isEmail().custom((value) => {
        return dbConnection.query('SELECT email FROM users WHERE email=$1', [value])
            .then((result) => {
                if (result.rows.length > 0) {
                    return Promise.reject('This E-mail already in use!');
                }
                return true;
            });
    }),
    body('user_name', 'Username is Empty!').trim().not().isEmpty(),
    body('user_pass', 'Passwords do not match').custom((value, { req }) => {
        if (value !== req.body.confirm_pass) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('user_pass', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
], (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            dbConnection.query("INSERT INTO users(username, email, password) VALUES($1, $2, $3)", [user_name, user_email, hash_pass])
                .then(() => {

                    res.redirect('/login?register=success');

                })
                .catch((err) => {
                    if (err) throw err;
                });
        })
            .catch((err) => {
                if (err) throw err;
            });
    } else {
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        res.render('register', {
            register_error: allErrors,
            old_data: req.body,
        });
    }
});

router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});
module.exports = router;
module.exports = { ifNotLoggedin, ifLoggedin };