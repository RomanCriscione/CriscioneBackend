const { Router } = require('express')
const {
    register,
    postRegister,
    failRegister,
    postLogin,
    failLogin,
    postLogout,
    getCurrent
} = require('../../controllers/session.controller.js')

const router = Router();

router.get('/register', register);
router.post('/register', postRegister);
router.get('/failregister', failRegister);
router.post('/login', postLogin);
router.get('/faillogin', failLogin);
router.post('/logout', postLogout);
router.get('/current', getCurrent);

module.exports = router