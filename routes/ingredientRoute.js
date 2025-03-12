const {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
} = require('../controllers/ingredientController');
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const router = require('express').Router();

router.get('/get-all-ingredients', getAllIngredients);
router.get('/get-ingredient-by-id/:id', getIngredientById);
router.post('/create-ingredient', checkLogin, createIngredient);
router.patch('/update-ingredient/:id', checkLogin, updateIngredient);
router.delete('/delete-ingredient/:id', checkLogin, deleteIngredient);

module.exports = router;
