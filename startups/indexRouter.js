// const testRoute = require('../routes/');
const router = require('express').Router();

const productRoute = require("../routes/testRouter")

router.use("/product", productRoute)

module.exports = router;