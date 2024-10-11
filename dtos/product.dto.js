class ProductDTO {
    constructor(product) {
        this.id = product._id
        this.title = product.title
        this.description = product.description
        this.price = product.price
        this.stock = product.stock
        this.category = product.category
        this.createdAt = product.createdAt
        this.updatedAt = product.updatedAt

    }
}

module.exports = ProductDTO
