const express = require("express");
const Product = require("../models/product");
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        
        const products = await Product.find().lean(); 
        console.log("Productos desde la base de datos:", products)
        res.render("index", { products })
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
})

router.get("/realtimeproducts", async (req, res) => {
    try {
      
        const products = await Product.find().lean(); 
        res.render("realTimeProducts", { products })
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
})

router.get('/login', async (req, res) => {
    res.render('login')
})

module.exports = router;
