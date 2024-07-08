const express = require("express")
const fs = require("fs")
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

// POST cart

router.post("/", (req, res) => {
    const carts = readCarts()
    const newCart = {
        cid: carts.length ? carts[carts.length - 1].cid + 1 : 1,
        products: []
    }
    carts.push(newCart)
    writeCarts(carts)
    res.json({ message: "Carrito creado", cart: newCart })
})
 // POST product

 router.post("/:cid/products", (req, res) => {
    const { cid } = req.params
    const { productId } = req.body;
    const carts = readCarts()
    const cart = carts.find(c => c.cid === parseInt(cid))
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })

        // Validación
if (!productId) {
    return res.status(400).json({ message: "productId es requerido" })
}

        const product = cart.products.find(p => p.id === productId)
    if (product) {
        product.quantity += 1
    } else {
        cart.products.push({ id: productId, quantity: 1 })
    }
    writeCarts(carts)
    res.json({ message: "Producto añadido al carrito", cart })
})

// Get

router.get("/:cid", (req, res) => {
    const { cid } = req.params
    const carts = readCarts()
    const cart = carts.find(c => c.cid === parseInt(cid))
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" })
        res.json(cart)
})

module.exports = router