const { getAllCategories, adminCreateCategory, getCategoryById, findCategoryRegex, changeCategoryName, updateCategoryThump } = require("../controllers/categoryController");
const { checkLogin, checkAdmin } = require('../middlewares/auth');
const router = require('express').Router();
const upload = require('../configs/multerConfig')

router.get('/get-all-categories', getAllCategories);
router.post('/get-category-by-id', getCategoryById);
router.get('/find-category', findCategoryRegex);
router.post('/admin-create-new-category',checkLogin, checkAdmin, upload.single('thump'), adminCreateCategory);
router.patch('/change-category-name', checkLogin, checkAdmin, changeCategoryName);

module.exports = router