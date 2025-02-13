const router = require('express').Router();
const { shopCreateNewProduct } = require("../controllers/testController")

router.post('/shop-create-new-product', shopCreateNewProduct)

module.exports = router;