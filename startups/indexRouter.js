// const testRoute = require('../routes/');
const router = require('express').Router();

const userRoute = require("../routes/userRoute")
const categoryRoute = require("../routes/categoryRoute")
const authRoute = require("../routes/authRoute")
const supplierRoute = require("../routes/supplierRoute")
const ingredientRoute = require("../routes/ingredientRoute")
const warehouseRoute = require("../routes/warehouseRoute")

router.use('/auth', authRoute);

router.use('/user', userRoute);
router.use('/category', categoryRoute);
router.use('/supplier', supplierRoute);
router.use('/ingredient', ingredientRoute);
router.use('/warehouse', warehouseRoute);

module.exports = router;