import express from "express"
import session from "express-session";
import bodyParser from "body-parser"
import handlebars, { engine } from "express-handlebars"
import handlebarsHelpers from "handlebars-helpers"
import path from "path";
import productsRouter, { readProducts, writeProducts } from "./routes/products.router.js"
import cartsRouter from './routes/carts.router.js'
import __dirname from './utils.js'
import viewsRouter from "./routes/views.router.js"
import { Server } from "socket.io"
import connectDB from './config/db.js'
import Product from "./models/product.js"
import mongoose from 'mongoose'
import MongoStore from "connect-mongo"
import sessionsRouter from "./routes/api/sessions.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js"
import cookieParser from 'cookie-parser'
import profileRouter from './routes/profile.js'


connectDB()

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({extended: true }))

app.use(cookieParser())

app.use('/profile', profileRouter)

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: handlebarsHelpers()
}));
app.set('view engine', 'hbs');
app.set('views', './src/views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://criscioner:pjF3DJtcz59ABY9t@codercluster.sdeyn.mongodb.net/fitoPlantas?retryWrites=true&w=majority' })
}))

initializePassport()
app.use(passport.initialize())
    app.use(passport.session())

app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

app.use(express.static(path.join(__dirname, 'public')))

app.use("/", viewsRouter)

app.use("/products", productsRouter)
app.use("/carts", cartsRouter)


const httpServer = app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))

const io = new Server(httpServer)

app.set('io', io)

io.on("connection", socket=>{
    console.log("Nuevo cliente conectado")

    socket.on ("createProduct", async (productData) => {
        try{
        const newProduct = new Product(productData)
        await newProduct.save()
        const products = await Product.find()
        io.emit("updateProducts", products)
        } catch (error) {
            console.error("Error al crear producto:", error.message)
        }
        
        
    })

    socket.on("deleteProduct", async (productId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                console.error("ID inválido:", productId);
                return}

            console.log("Product ID:", productId)
            
            await Product.findByIdAndDelete(productId)
        const products = await Product.find()
        io.emit("updateProducts", products)
        } catch (error) {
            console.error("Error al eliminar producto:", error.message)
        }
    })

    socket.on("message", data=> {
        console.log(`Mensaje recibido ${data}`)
    })
})

export default io