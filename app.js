require('dotenv').config()
console.log('MongoDB URI:', process.env.MONGODB_URI)

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const handlebarsHelpers = require("handlebars-helpers");
const path = require("path");
const productsRouter = require("./routes/products.router");
const cartsRouter = require('./routes/carts.router');
const { createHash, isValidPassword } = require('./utils');
const viewsRouter = require("./routes/views.router");
const { Server } = require("socket.io");
const { connectDB } = require('./config/db');
const Product = require("./models/product");
const MongoStore = require("connect-mongo");
const sessionsRouter = require("./routes/api/sessions");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const cookieParser = require('cookie-parser');
const profileRouter = require('./routes/profile');
const errorHandler = require('./middleware/error');


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
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true }
    })
}))

initializePassport()
app.use(passport.initialize())
    app.use(passport.session())

app.use('/api/sessions', sessionsRouter)
app.use('/', viewsRouter)
app.use('/profile', profileRouter)
app.use(express.static(path.join(__dirname, 'public')))
app.use("/", viewsRouter)
app.use("/products", productsRouter)
app.use("/carts", cartsRouter)
app.use(errorHandler)

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

module.exports = io