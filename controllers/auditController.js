const AuditLog = require('../models/auditLog');

exports.getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('warehouseId ingredientId').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy audit logs', error: err.message });
  }
};
