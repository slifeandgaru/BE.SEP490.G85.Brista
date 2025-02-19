// const testRoute = require('../routes/');
const router = require('express').Router();

const userRoute = require("../routes/userRoute")

router.use('/user', userRoute);

module.exports = router;