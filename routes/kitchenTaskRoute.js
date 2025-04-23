const express = require('express');
const router = express.Router();
const kitchenTaskController = require('../controllers/kitchenTaskController');

// Tạo lại danh sách task từ đơn đã thanh toán
router.post('/generate-tasks', kitchenTaskController.generateKitchenTasks);

// Lấy danh sách task
router.get('/', kitchenTaskController.getAllKitchenTasks);

// Cập nhật tiến độ task
router.put('/:taskId/update-progress', kitchenTaskController.updateTaskProgress);

module.exports = router;
