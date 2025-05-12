const KitchenTask = require('../models/kitchenTask');
const Order = require('../models/order');

// Tổng hợp sản phẩm từ đơn đã thanh toán
exports.generateKitchenTasks = async (req, res) => {
  try {
    const paidOrders = await Order.find({ status: 'paid' }).populate('product.productId');

    const taskMap = new Map();

    for (const order of paidOrders) {
      for (const item of order.product) {
        const productId = item.productId._id.toString();

        // Biến selectedOptions Map thành chuỗi JSON có thứ tự key ổn định
        const options = item.selectedOptions
          ? JSON.stringify(Object.fromEntries([...item.selectedOptions.entries()].sort()))
          : '{}';

        const taskKey = `${productId}_${options}`;

        if (taskMap.has(taskKey)) {
          taskMap.get(taskKey).totalQuantity += item.quantity;
        } else {
          taskMap.set(taskKey, {
            productId,
            productName: item.productId.productName,
            totalQuantity: item.quantity,
            selectedOptions: JSON.parse(options), // Lưu lại để hiển thị trong bếp
          });
        }
      }
    }

    const results = [];

    for (const task of taskMap.values()) {
      // Tìm theo productId + selectedOptions
      const existingTask = await KitchenTask.findOne({
        productId: task.productId,
        selectedOptions: task.selectedOptions
      });

      if (existingTask) {
        const delta = task.totalQuantity - existingTask.totalQuantity;

        if (delta > 0) {
          existingTask.totalQuantity += delta;
          existingTask.updatedAt = new Date();
          await existingTask.save();
          results.push(existingTask);
        } else {
          results.push(existingTask);
        }
      } else {
        const newTask = new KitchenTask({
          ...task,
          completedQuantity: 0,
          servedQuantity: 0,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await newTask.save();

        if (global._io) {
          global._io.emit("call_kitchen", newTask);
        }

        results.push(newTask);
      }
    }

    res.status(200).json({ message: 'Cập nhật task bếp thành công', tasks: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách kitchen task
exports.getAllKitchenTasks = async (req, res) => {
  try {
    const tasks = await KitchenTask.find().sort({ updatedAt: -1 });
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu hoàn thành một phần hoặc toàn bộ task
exports.updateTaskProgress = async (req, res) => {
  const { taskId } = req.params;
  const { addQuantity, brista, servedQuantity } = req.body;

  try {
    const task = await KitchenTask.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });


    task.completedQuantity += addQuantity;
    task.servedQuantity += servedQuantity;

    if (task.totalQuantity === task.servedQuantity) {
      task.status = 'done';
    } else {
      task.status = 'in_progress';
    }

    if (brista) task.brista = brista;

    task.updatedAt = new Date();
    await task.save();

    // Gửi socket đến tất cả client
    if (global._io) {
      global._io.emit("task_updated", task);
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
