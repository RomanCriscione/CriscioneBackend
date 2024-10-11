const Product = require('../models/product');
const ProductDTO = require('../dtos/product.dto');
const paginateAndSort = require('../services/paginateAndSort');

const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, ...query } = req.query;
        const products = await Product.find(query);
        const { data: paginatedProducts, totalPages, totalItems, currentPage } = paginateAndSort(products, { page: parseInt(page), limit: parseInt(limit), sortField: sort });

        const hasPrevPage = currentPage > 1;
        const hasNextPage = currentPage < totalPages;

        const prevLink = hasPrevPage ? `/products?limit=${limit}&page=${currentPage - 1}&sort=${sort}&query=${JSON.stringify(query)}` : null;
        const nextLink = hasNextPage ? `/products?limit=${limit}&page=${currentPage + 1}&sort=${sort}&query=${JSON.stringify(query)}` : null;

        res.render("index", {
            status: 'success',
            payload: paginatedProducts.map(product => new ProductDTO(product)),
            totalPages,
            totalProducts: totalItems,
            prevPage: currentPage - 1,
            nextPage: currentPage + 1,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        res.json(new ProductDTO(product))
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !status || !stock || !category || !Array.isArray(thumbnails)) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const newProduct = new Product(req.body);
        await newProduct.save();

        req.app.get("io").emit("updateProducts", await Product.find());

        res.status(201).json({ message: "Producto agregado", product: new ProductDTO(newProduct) })
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        res.status(400).json({ status: "error", message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updateProduct) return res.status(404).json({ message: "Producto no encontrado" });

        req.app.get("io").emit("updateProducts", await Product.find());

        res.json({ message: "Producto actualizado", product: new ProductDTO(updateProduct) });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) return res.status(404).json({ message: "Producto no encontrado" });

        req.app.get("io").emit("updateProducts", await Product.find());

        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
};
