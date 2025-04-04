const {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    addUnitToIngredient
} = require('../controllers/ingredientController');
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const router = require('express').Router();
const upload = require('../configs/multerConfig')

router.get('/get-all-ingredients', getAllIngredients);
router.get('/get-ingredient-by-id/:id', getIngredientById);
router.post('/create-ingredient', checkLogin, upload.single('thump'), createIngredient);
router.patch('/update-ingredient/:id', checkLogin, updateIngredient);
router.delete('/delete-ingredient/:id', checkLogin, checkAdmin, deleteIngredient);
router.patch('/add-unit-to-ingredient/:id', checkLogin, addUnitToIngredient);

module.exports = router;
