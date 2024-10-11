const User = require('../models/user.js');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = (req, res) => {
    res.render('register');
};

const postRegister = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ status: "error", message: "El email ya está registrado" });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role: role || 'user'
        })

        await newUser.save();

        return res.send({ status: "success", message: "Usuario registrado" });
    } catch (error) {
        console.error("Error al registrar el usuario:", error.message);
        if (error.code === 11000) {
            return res.status(400).send({ status: "error", message: "El email ya está registrado" });
        }
        res.status(500).send({ status: "error", message: error.message });
    }
};

const failRegister = (req, res) => {
    console.log('Registro fallido');
    res.status(400).send({ error: "Failed" });
};

const postLogin = (req, res) => {
    passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' })(req, res, async () => {
        if (!req.user) {
            return res.status(400).send({ status: "error", error: "Datos incompletos" });
        }
        try {
            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age
            };
            console.log('User session set:', req.session.user);
            const token = jwt.sign({ user: req.user }, 'secretkey', { expiresIn: '1h' });
            console.log('Generated token:', token);
            res.cookie('jwt', token, { httpOnly: true });
            return res.send({ status: "success", message: "Login exitoso", token });
        } catch (err) {
            return res.status(500).send('Error al iniciar sesión');
        }
    });
};

const failLogin = (req, res) => {
    res.status(401).send("Login fallido. Por favor, verifica tus credenciales.");
};

const postLogout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send("Error al cerrar sesión");
        }
        res.clearCookie('jwt');
        res.redirect('/');
    })
}

const getCurrent = (req, res) => {
    res.send({ status: "success", payload: req.user });
};

module.exports = {
    register,
    postRegister,
    failRegister,
    postLogin,
    failLogin,
    postLogout,
    getCurrent
};
