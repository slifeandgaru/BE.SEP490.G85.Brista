const { getAllCategories, adminCreateCategory, getCategoryById, findCategoryRegex, changeCategoryName, updateCategoryThump } = require("../controllers/categoryController");
const { checkLogin, checkAdmin } = require('../middlewares/auth');
const router = require('express').Router();
const upload = require('../configs/multerConfig')

router.get('/get-all-categories', getAllCategories);
router.post('/get-category-by-id', getCategoryById);
router.get('/find-category', findCategoryRegex);
router.post('/admin-create-new-category',checkLogin, checkAdmin, upload.single('thump'), adminCreateCategory);
router.patch('/change-category-name', checkLogin, checkAdmin, changeCategoryName);
// router.patch('/change-category-thump/:categoryId', checkLogin, checkAdmin, upload.single('thump'), updateCategoryThump);


// router.post('/admin-create-new-category', checkLogin, checkAdmin, (req, res, next) => {
//     upload.single('thump')(req, res, (err) => {
//         if (err) {
//             console.error("❌ Multer error:", err);
//             return res.status(500).json({ message: "Multer error", error: err.message });
//         }
//         next();
//     });
// }, adminCreateCategory);


module.exports = router