import { Router } from 'express';
import User from '../../models/user.js';
import { createHash, isValidPassword } from '../../utils.js';
import passport from 'passport';
import jwt from 'jsonwebtoken'


const router = Router();

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    res.send({ status: "success", message: "usuario registrado" })
});

router.get('/failregister', async (req, res) => {
    console.log('Registro fallido')
    res.status(400).send({ error: "Failed" })
})

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {
    if (!req.user){ 
        return res.status(400).send({ status: "error", error: "Datos incompletos" })
    }
        try {
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age
        }
        
        console.log('User session set:', req.session.user)
        

        const token = jwt.sign({ user: req.user }, 'secretkey', { expiresIn: '1h' })
        console.log('Generated token:', token)
        res.cookie('jwt', token, { httpOnly: true })
        return res.redirect('/profile')
        
    } catch (err) {
        return res.status(500).send('Error al iniciar sesión');
    }
})
    
router.get('/faillogin', (req, res) => {
    res.status(401).send("Login fallido. Por favor, verifica tus credenciales.")
})



router.post('/logout', (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/login');
    })

    router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
        res.send({ status: "success", payload: req.user })
    })

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user
    res.redirect('/')
})

export default router