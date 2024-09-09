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

module.exports = { ifNotLoggedin, ifLoggedin };

router.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {  
    req.session = null;
    res.redirect('/login');
});
module.exports = router;