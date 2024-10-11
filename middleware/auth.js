const jwt = require('jsonwebtoken');


const isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt; 
    if (!token) {
        return res.redirect('/login'); 
    }

    jwt.verify(token, 'secretkey', (err, decoded) => { 
        if (err) {
            return res.redirect('/login')
        }
        req.user = decoded.user
        next()
    });
};


const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next(); 
    }
    return res.status(403).send({ message: 'Forbidden: Admins only' }); 
}


const verifyUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        return next()
    }
    return res.status(403).send({ message: 'Forbidden: Users only' })
}

const isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return next()
    } else {
        return res.redirect('/profile');
    }
}

module.exports = { isAuthenticated, isNotAuthenticated, verifyAdmin, verifyUser };
