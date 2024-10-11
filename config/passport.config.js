const passport = require('passport');
const local = require('passport-local');
const userService = require('../models/user.js');
const { createHash, isValidPassword } = require('../utils.js');
const GitHubStrategy = require('passport-github2');
const jwt = require('passport-jwt');
const cookieParser = require('cookie-parser')


const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        passReqToCallback: true, usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        try {
            let user = await userService.findOne({ email: username })
            if (user) {
                console.log("El usuario ya existe")
                return done(null, false)
            }

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            };

            let result = await userService.create(newUser)
            return done(null, result)
        } catch (error) {
            return done("Error al obtener el usuario: " + error)
        }
    }
    ));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
     try {
         const user = await userService.findOne({ email: username })
         if (!user) {
             console.log("El usuario no existe")
             return done(null, false)
             }
             if (!isValidPassword(user, password)) return done(null, false)
             return done(null, user)
             } catch (error) {
                 return done(error)
                 }
                 }))



    
    passport.use('github', new GitHubStrategy({
        clientID: "Iv23liUWRzkPBFWqu6RR",
        clientSecret: "1e06a2fa3ded262aa3d4e6ffabb788aa4169edbf",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userService.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: null,
                    email: profile._json.email,
                    password: ""
                }
                let result = await userService.create(newUser)
                done(null, result)
            }
            else {
                done(null, user)
            }
        } catch (error) {

        }
    }))

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'secretkey'
    }, async (jwt_payload, done) => {
        try {
            const user = await userService.findById(jwt_payload.user._id);
            if (!user) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))


    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userService.findById(id)
        done(null, user)
    })
}

module.exports = initializePassport