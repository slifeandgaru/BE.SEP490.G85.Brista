const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addIngredientToProduct, getAllProductsByCategoryId, getAllProductsWithStorage } = require('../controllers/productController');
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const router = require('express').Router();

router.get('/get-all-products', getAllProducts);
router.get('/get-product-by-id/:productId', getProductById);
// router.get('/find-customer', findCustomerByRegex);
router.post('/create-new-product', checkLogin, createProduct);
router.patch('/update-product/:customerId', checkLogin, updateProduct);
router.delete('/delete-product-by-id', checkAdmin, deleteProduct);
router.get('/get-products-by-category/:categoryId', getAllProductsByCategoryId);
// router.delete('/add-ingredient-to-product', checkLogin, addIngredientToProduct);
router.get('/get-all-products-storage', getAllProductsWithStorage);

module.exports = router;
