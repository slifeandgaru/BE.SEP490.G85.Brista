const { 
    createWarehouse, 
    getAllWarehouses, 
    getWarehouseById, 
    updateWarehouse, 
    deleteWarehouse,
    addIngredientToWarehouse,
    removeIngredientFromWarehouse,
    getWarehousesByManager
} = require("../controllers/warehouseController");
const { checkLogin, checkAdmin } = require('../middlewares/auth');

const router = require('express').Router();

router.get('/get-all-warehouses', getAllWarehouses);
router.get('/get-warehouse-by-id/:id', getWarehouseById);
router.post('/create-warehouse', checkLogin, checkAdmin, createWarehouse);
router.patch('/update-warehouse/:id', checkLogin, checkAdmin, updateWarehouse);
router.delete('/delete-warehouse/:id', checkLogin, checkAdmin, deleteWarehouse);
router.post('/add-ingredient', checkLogin, checkAdmin, addIngredientToWarehouse);
router.delete('/delete-ingredient-in-warehouse', checkLogin, checkAdmin, removeIngredientFromWarehouse);
router.get("/get-warehouse-by-manager/:managerId", getWarehousesByManager);


module.exports = router;
