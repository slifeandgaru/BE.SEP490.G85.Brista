const express = require('express');
const router = express.Router();
const { createRequest, getAllRequests } = require('../controllers/requestController');

router.post('/create-new-requests', createRequest);
router.get('/get-all-requests', getAllRequests);

module.exports = router;