const express = require('express');
const router = express.Router();
const { createTransfer } = require('../controllers/transferController');

router.post('/create-new-transfers', createTransfer);

module.exports = router;