const {
    createWarehouseProduct
} = require("../controllers/warehouseProductController");

const router = require('express').Router();

// router.get('/get-all-warehouses', getAllWarehouses);
// router.get('/get-warehouse-by-id/:id', getWarehouseById);
router.post('/create-warehouse-product', createWarehouseProduct);

module.exports = router;
