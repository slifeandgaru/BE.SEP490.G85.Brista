const express = require('express');
const router = express.Router();
const { getAllAuditLogs } = require('../controllers/auditController.js');

router.get('/get-all-audit-logs', getAllAuditLogs);

module.exports = router;