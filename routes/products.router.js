import express from 'express';
import fs from 'fs';
import Product from '../models/product.js'
const router = express.Router()
const filePath = "./src/products.json"

// leer

export const readProducts = () => {
    if (!fs.existsSync(filePath)) return[]
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
}

// Guardar

export const writeProducts = (products) => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2))
}

// Paginacion y ordenamiento

const paginateAndSort = async (query = {}, limit = 10, page = 1, sort = "") => {
    const queryConditions = {}
    if (query.category) queryConditions.category = query.category
    if (query.availability) queryConditions.status = query.availability === "available" ? true : false

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort === "asc" ? { price: 1 } : { price: -1 }
    };

    const result = await Product.paginate(queryConditions, options);

    return {
        products: result.docs,
        totalPages: result.totalPages,
        totalProducts: result.totalDocs,
        currentPage: result.page,
        limit: result.limit,
    }
}

// get
router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, ...query } = req.query
        const { products, totalPages, totalProducts, currentPage } = await paginateAndSort(
            query,
            parseInt(limit),
            parseInt(page),
            sort,
            )

        const hasPrevPage = currentPage > 1
        const hasNextPage = currentPage < totalPages
        const prevLink = hasPrevPage ? `/products?limit=${limit}&page=${currentPage - 1}&sort=${sort}&query=${JSON.stringify(query)}` : null
        const nextLink = hasNextPage ? `/products?limit=${limit}&page=${currentPage + 1}&sort=${sort}&query=${JSON.stringify(query)}` : null

        res.render("index", {
            status: 'success',
            payload: products,
            products,
            totalPages,
            totalProducts,
            prevPage: currentPage - 1,
            nextPage: currentPage + 1,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

router.get("/:id", async (req, res) => {
    try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Producto no encontrado" })
    res.json(product)
    } catch (error) {
        res.status(500).json({status: "error", message: error.message})
    }
})

// post
router.post("/", async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body
        if (!title || !description || !code || !price || !status || !stock || !category || !Array.isArray(thumbnails)) {
            return res.status(400).json({ message: "Faltan campos obligatorios" })
        }
        
    const newProduct = new Product(req.body)
    await newProduct.save()
    req.app.get("io").emit("updateProducts", await Product.find())
    res.status(201).json({message: "Producto agregado", product: newProduct})
    } catch (error) {
        console.error("Error al crear producto:", error.message)
        res.status(400).json({status: "error", message: error.message})
    }
    
})


// PUT

router.put("/:id", async (req, res) => {
    try{        
    const updateProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true})
    if (!updateProduct) return res.status(404).json({message: "Producto no encontrado"})
    req.app.get("io").emit("updateProducts", await Product.find())

    res.json({message: "Producto actualizado", product: updateProduct})
} catch (error){
    res.status(500).json({status: "error", message: error.message})

}
})

// delete

router.delete("/:id", async (req, res) => {
    try{
        const deleteProduct = await Product.findByIdAndDelete(req.params.id)
        if (!deleteProduct) return res.status(404).json({ message: "Producto no encontrado" });
        req.app.get("io").emit("updateProducts", await Product.find())
        res.json({message: "Producto eliminado"})

        } catch (error) {
            res.status(500).json({ status: "error", message: error.message})
        }
    
})

export default router;