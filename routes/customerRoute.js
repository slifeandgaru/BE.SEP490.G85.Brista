const { createNewCustomer, getAllCustomers, getCustomerById, findCustomerByRegex, updateCustomerInfo, deleteCustomerById } = require('../controllers/customerController');
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const router = require('express').Router();

router.get('/get-all-customers', getAllCustomers);
router.get('/get-customer-by-id/:customerId', getCustomerById);
router.get('/find-customer', findCustomerByRegex);
router.post('/create-new-customer', checkLogin, createNewCustomer);
router.patch('/update-customer-info/:customerId', checkLogin, updateCustomerInfo);
router.delete('/delete-customer-by-id', checkAdmin, deleteCustomerById);

module.exports = router;
