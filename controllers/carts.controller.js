const Cart = require('../models/cart')
const Ticket = require('../models/ticket')
const Product = require('../models/product')


const getCartById = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product')
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" })
        }
        res.json(cart)
    } catch (error) {
        console.error("Error al obtener el carrito:", error.message)
        res.status(500).json({ status: "error", message: error.message })
    }
};


const addProductToCart = async (req, res) => {
    try {
        const cartId = req.params.cid
        const { pid } = req.body
        const cart = await Cart.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" })
        }
        
        // Comprobar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(item => item.product.toString() === pid)
        
        if (productIndex !== -1) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si el producto no está, agregarlo
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al agregar el producto al carrito:", error.message)
        res.status(500).json({ status: "error", message: error.message })
    }
};

// Eliminar Producto del Carrito
const removeProductFromCart = async (req, res) => {
    try {
        const cartId = req.params.cid
        const productId = req.params.pid
        const cart = await Cart.findById(cartId)

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" })
        }

        // Filtrar el producto a eliminar
        cart.products = cart.products.filter(item => item.product.toString() !== productId)
        await cart.save()

        res.json(cart)
    } catch (error) {
        console.error("Error al eliminar el producto del carrito:", error.message)
        res.status(500).json({ status: "error", message: error.message })
    }
};

// Limpiar Carrito
const clearCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" })
        }

        // Limpiar los productos del carrito
        cart.products = []
        await cart.save()

        res.json(cart)
    } catch (error) {
        console.error("Error al limpiar el carrito:", error.message)
        res.status(500).json({ status: "error", message: error.message })
    }
};

// Comprar Carrito
const purchaseCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product')

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" })
        }

        let totalAmount = 0
        const purchasedProducts = []
        const notPurchasedProducts = []

        for (const item of cart.products) {
            const product = await Product.findById(item.product._id)
            const quantity = item.quantity

            if (product.stock >= quantity) {
                product.stock -= quantity
                await product.save()
                totalAmount += product.price * quantity
                purchasedProducts.push(product)
            } else {
                notPurchasedProducts.push(product)
            }
        }

        if (purchasedProducts.length > 0) {
            const newTicket = new Ticket({
                code: `TICKET-${Date.now()}`,
                amount: totalAmount,
                purchaser: req.user._id
            });

            await newTicket.save();
        }

        res.json({
            status: "success",
            message: "Compra procesada",
            purchasedProducts,
            notPurchasedProducts
        });
    } catch (error) {
        console.error("Error al procesar la compra:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Exportar todas las funciones
module.exports = {
    getCartById,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    purchaseCart
};
