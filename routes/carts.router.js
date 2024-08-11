import express from 'express';
import fs from 'fs';
import Product from '../models/product.js';
import Cart from '../models/cart.js';
import mongoose from 'mongoose'
const router = express.Router()
const filePath = "./src/carts.json"

// Leer

const readCarts = () => {
    if (!fs.existsSync(filePath)) return []
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
}

// Guardar

const writeCarts = (carts) => {
    fs.writeFileSync(filePath, JSON.stringify(carts, null, 2))
}

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// POST cart

router.post("/", async (req, res) => {
    try{
        const newCart = new Cart() 
        await newCart.save()
        res.status(201).json({message: "Carrito creado", cart: newCart})
    
} catch (error){
    res.status(500).json({ status: "error", message: error.message})
}
})

router.post("/add", async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body

        console.log(`Received cartId: ${cartId}, productId: ${productId}, quantity: ${quantity}`)
        
        if (!productId || quantity == null || quantity <= 0) {
            return res.status(400).json({ message: "Faltan campos obligatorios o cantidad inválida" })
        }

        if (!validateObjectId(productId)) { 
            return res.status(400).json({ message: "ID del producto no válido" })
        }

        let cart
        
        if (cartId && validateObjectId(cartId)) {
            cart = await Cart.findById(cartId)
        }

        if (!cart) { 
            cart = new Cart()
            await cart.save()
            console.log(`Nuevo carrito creado con ID: ${cart._id}`)
        }

        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Producto no encontrado" })

        const itemIndex = cart.products.findIndex(item => item.product.toString() === productId)
        if (itemIndex !== -1) {
            cart.products[itemIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity })
        }

        await cart.save();
        res.status(200).json({ message: "Producto agregado al carrito", cart })
    } catch (error) {
        console.error('Error adding product to cart:', error)
        res.status(500).json({ status: 'error', message: error.message })
    }
})

// Get

router.get("/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;

            if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId).populate("products.product")
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        res.json(cart);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
})

// PUT

router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body
        const cartId = req.params.cid

        
        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        cart.products = products.map(p => ({
            product: p.product,
            quantity: p.quantity
        }))

        await cart.save()
        res.json({ message: "Carrito actualizado", cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body

       
        if (!validateObjectId(cid) || !validateObjectId(pid)) {
            return res.status(400).json({ message: "ID del carrito o del producto no válido" })
        }
        if (quantity == null || quantity <= 0) {
            return res.status(400).json({ message: "Cantidad inválida" })
        }

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        const cartProduct = cart.products.find(p => p.product.equals(pid))
        if (!cartProduct) return res.status(404).json({ message: "Producto no encontrado en el carrito" })

        cartProduct.quantity = quantity

        await cart.save()
        res.json({ message: "Cantidad actualizada", cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

// Delete

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        
        if (!validateObjectId(cid) || !validateObjectId(pid)) {
            return res.status(400).json({ message: "ID del carrito o del producto no válido" })
        }

        const cart = await Cart.findById(cid)
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        cart.products = cart.products.filter(p => !p.product.equals(pid))

        await cart.save()
        res.json({ message: "Producto eliminado del carrito", cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})


router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid

       
        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId)
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        cart.products = []
        await cart.save()

        res.json({ message: "Todos los productos eliminados del carrito" })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

export default router;