const { Router } = require('express');
const jwt = require('jsonwebtoken');

const router = Router();

const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.redirect('/login');

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.redirect('/login'); 
        req.user = decoded.user; 
        next();
    });
};


router.get('/', verifyToken, (req, res) => {
    const token = req.cookies.jwt
    res.render('profile', { user: req.user,
        token 
     });
});

module.exports = router