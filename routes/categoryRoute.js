const { getAllCategories, adminCreateCategory, getCategoryById, findCategoryRegex, changeCategoryName, upload, updateCategoryThump } = require('../controllers/categoryController');
const { checkLogin, checkAdmin } = require('../middlewares/auth');
const router = require('express').Router();

router.get('/get-all-categories', getAllCategories);
// router.get('/get-category-by-id/:categoryId', getCategoryById);
// router.get('/find-category', findCategoryRegex);
router.post('/admin-create-new-category',checkLogin, checkAdmin, upload.single('thump'), adminCreateCategory);
// router.patch('/change-category-name/:categoryId', checkLogin, checkAdmin, changeCategoryName);
// router.patch('/change-category-thump/:categoryId', checkLogin, checkAdmin, upload.single('thump'), updateCategoryThump);

module.exports = router