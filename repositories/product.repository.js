const Product = require('../models/product');

class ProductRepository {
    async createProduct(data) {
        const product = new Product(data);
        await product.save();
        return product;
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async updateProduct(id, data) {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async getAllProducts(paginationOptions) {
        return await Product.paginate({}, paginationOptions);
    }
}

module.exports = new ProductRepository();
