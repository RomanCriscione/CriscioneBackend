const express = require('express');
const { getProducts, createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/product.controller')
const { verifyAdmin } = require('../middleware/auth')

const router = express.Router()

// GET
router.get("/", getProducts);

// GET por ID
router.get("/:id", getProductById);

// POST
router.post("/", verifyAdmin, createProduct);

// PUT
router.put("/:id", verifyAdmin, updateProduct);

// DELETE
router.delete("/:id", verifyAdmin, deleteProduct);

module.exports = router;
