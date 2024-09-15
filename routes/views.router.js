import express from "express"
import { readProducts } from './products.router.js'
import Product from "../models/product.js"
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js'

const router = express.Router()


router.get("/", async (req, res) => {
    try {
    const products = await Product.find().lean()
    console.log("Productos desde la base de datos:", products)
    res.render("index", { products })
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message})
    }
})

router.get("/realtimeproducts", async (req, res) => {
    try{
    const products = await Product.find().lean();
    res.render("realTimeProducts", { products })
    } catch (error){
        res.status(500).json({ status: "error", message: error.message})
    }
})  


router.get('/login', async (req, res) => {
    res.render('login')
})
export default router