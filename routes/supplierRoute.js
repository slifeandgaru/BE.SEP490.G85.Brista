const { createNewSupplier, getAllSupplier, getSupplierById, findSupplierByRegex, updateSupplierInfo, deleteSupplierById } = require('../controllers/supplierController');
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const router = require('express').Router();

router.get('/get-all-supplier', getAllSupplier);
router.get('/get-supplier-by-id/:supplierId', getSupplierById);
router.get('/find-supplier', findSupplierByRegex);
router.post('/create-new-supplier', checkLogin, checkAdmin, createNewSupplier);
router.patch('/change-supplier-info/:supplierId', checkLogin, checkAdmin, updateSupplierInfo);
router.delete('/delete-supplier-by-id', deleteSupplierById);


module.exports = router;