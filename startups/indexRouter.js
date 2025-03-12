// const testRoute = require('../routes/');
const router = require('express').Router();

const userRoute = require("../routes/userRoute")
const categoryRoute = require("../routes/categoryRoute")
const authRoute = require("../routes/authRoute")
const supplierController = require("../routes/supplierRoute")
const ingredientController = require("../routes/ingredientRoute")

router.use('/auth', authRoute);

router.use('/user', userRoute);
router.use('/category', categoryRoute);
router.use('/supplier', supplierController);
router.use('/ingredient', ingredientController);

module.exports = router;