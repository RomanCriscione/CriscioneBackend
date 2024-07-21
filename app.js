import express from "express"
import handlebars, { engine } from "express-handlebars"
import path from "path";
import productsRouter, { readProducts, writeProducts } from "./routes/products.router.js"
import cartsRouter from './routes/carts.router.js';
import __dirname from './utils.js';
import viewsRouter from "./routes/views.router.js"
import { Server } from "socket.io"

const app = express()

const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({extended: true }))

app.engine("handlebars", handlebars.engine())
app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, 'public')))

app.use("/", viewsRouter)

app.use("/products", productsRouter)
app.use("/carts", cartsRouter)


const httpServer = app.listen(8080, ()=> console.log(`Server running on port ${PORT}`))
const io = new Server(httpServer)

app.set('io', io)

io.on("connection", socket=>{
    console.log("Nuevo cliente conectado")

    socket.on("createProduct", (product) => {
        const products = readProducts()
        const newProduct = {
            id: products.length ? products[products.length - 1].id + 1 : 1,
            ...product
        }
        products.push(newProduct)
        writeProducts(products)
        io.emit('updateProducts', products)
    })

    socket.on("deleteProduct", (productId) => {
        const products = readProducts()
        const newProducts = products.filter(p => p.id !== parseInt(productId))
        writeProducts(newProducts)
        io.emit('updateProducts', newProducts)
    })

    socket.on("message", data=> {
        console.log(`Soy la data ${data}`)
    })
})

export default io