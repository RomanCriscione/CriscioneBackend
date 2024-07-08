const express = require("express")
const fs = require("fs")
const router = express.Router()
const filePath = "./src/products.json"

// leer

const readProducts = () => {
    if (!fs.existsSync(filePath)) return[]
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
}

// Guardar

const writeProducts = (products) => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2))
}

// get
router.get("/", (req, res) => {
    const products = readProducts()
    res.json(products)
})

// post
router.post("/", (req, res) => {
    const products = readProducts()
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1, ...req.body
    }

    // Validaciones
    
if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.status || !newProduct.stock || !newProduct.category || !Array.isArray(newProduct.thumbnails)) {
    return res.status(400).json({ message: "Faltan campos obligatorios" })
}
       
    products.push(newProduct)
    writeProducts(products)
    res.json({message: "Producto agregado", products: newProduct})
})

// PUT

router.put("/:id", (req, res) => {
    const { id } = req.params
    const products = readProducts()
    const productsID = products.findIndex(p => p.id === parseInt(id))
    if (productsID === -1) return res.status(404).json({message: "Producto no encontrado"})
        const updateProduct = {...products[productsID], ...req.body, id: products[productsID].id}
    products[productsID] = updateProduct
    writeProducts(products)
    res.json({message: "Producto actualizado", products: updateProduct})
})

// delete
router.delete("/:id", (req, res) => {
    const { id } = req.params
    const products = readProducts()
    const newProduct = products.filter(p => p.id !== parseInt(id))
    writeProducts(newProduct)
    res.json({message: "Producto eliminado"})
})

module.exports = router