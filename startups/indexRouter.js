// const testRoute = require('../routes/');
const router = require('express').Router();

const userRoute = require("../routes/userRoute")
const categoryRoute = require("../routes/categoryRoute")
const authRoute = require("../routes/authRoute")

router.use('/auth', authRoute);

router.use('/user', userRoute);
router.use('/category', categoryRoute);

module.exports = router;