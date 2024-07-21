import express from "express"
import { readProducts } from './products.router.js'

const router = express.Router()


router.get("/", (req, res) => {
    const products = readProducts()
    res.render("index", { products })
})

router.get("/realtimeproducts", (req, res) => {
    const products = readProducts();
    res.render("realTimeProducts", { products })
})
export default router