const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Ticket = require('../models/ticket');
const router = express.Router();

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next()
    }
    return res.status(403).json({ message: "Acceso denegado: no tienes permisos para realizar esta acción" })
}

router.get("/:cid/view", async (req, res) => {
    try {
        const cartId = req.params.cid;

        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" });
        }

        const cart = await Cart.findById(cartId).populate("products.product");
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        const total = cart.products.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

 
        res.render('cart', { cart, total }); 
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
})


// POST cart
router.post("/", async (req, res) => {
    try {
        const newCart = new Cart()
        await newCart.save()
        res.status(201).json({ message: "Carrito creado", cart: newCart })
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
})

// POST /add
router.post("/add", async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body

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
        }

        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Producto no encontrado" })

        const itemIndex = cart.products.findIndex(item => item.product.toString() === productId)
        if (itemIndex !== -1) {
            cart.products[itemIndex].quantity += quantity
        } else {
            cart.products.push({ product: productId, quantity })
        }

        await cart.save()
        res.status(200).json({ message: "Producto agregado al carrito", cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

// GET /:cid
router.get("/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid

        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId).populate("products.product")
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        res.json(cart)
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
})

// PUT /:cid
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body
        const cartId = req.params.cid;

        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId)
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
});

// PUT /:cid/products/:pid
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

        const cart = await Cart.findById(cid)
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        const cartProduct = cart.products.find(p => p.product.equals(pid))
        if (!cartProduct) return res.status(404).json({ message: "Producto no encontrado en el carrito" })

        cartProduct.quantity = quantity

        await cart.save()
        res.json({ message: "Cantidad actualizada", cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
});

// DELETE /:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params

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

// DELETE /:cid
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

// POST /:cid/purchase
router.post("/:cid/purchase", async (req, res) => {
    try {
        const cartId = req.params.cid

        if (!validateObjectId(cartId)) {
            return res.status(400).json({ message: "ID del carrito no válido" })
        }

        const cart = await Cart.findById(cartId).populate("products.product")
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        const ticketItems = []
        let totalAmount = 0

        for (const item of cart.products) {
            const product = item.product
            const quantity = item.quantity

            if (product.stock < quantity) {
                ticketItems.push({
                    product: product._id,
                    quantity: quantity,
                    status: 'no comprado'
                });
            } else {
                product.stock -= quantity
                await product.save()
                ticketItems.push({
                    product: product._id,
                    quantity: quantity,
                    status: 'comprado'
                });
                totalAmount += product.price * quantity
            }
        }

     
        const newTicket = new Ticket({
            code: `TICKET-${Date.now()}`,
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: req.user._id 
        })

        await newTicket.save()

        
        cart.products = []
        await cart.save()

        res.json({ message: "Compra procesada", ticket: newTicket, items: ticketItems })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
});

module.exports = router;
