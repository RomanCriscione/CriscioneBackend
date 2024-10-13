const express = require('express');
const {
    getCartById,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    purchaseCart
} = require('../controllers/carts.controller')

const router = express.Router()


router.get('/:cid', getCartById)


router.post('/:cid/products', addProductToCart)


router.delete('/:cid/products/:pid', removeProductFromCart)


router.delete('/:cid', clearCart)


router.post('/:cid/purchase', purchaseCart)

module.exports = router
