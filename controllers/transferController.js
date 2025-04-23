const TransferLog = require('../models/transferLog');
const Request = require('../models/request');
const Warehouse = require('../models/warehouse');
const AuditLog = require('../models/auditLog');

exports.createTransfer = async (req, res) => {
  try {
    const {
      requestId,
      fromWarehouseId,
      toWarehouseId,
      deliveredBy,
      note
    } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy request' });
    }

    if (request.status === 'delivered') {
      return res.status(400).json({ message: 'Phiếu yêu cầu đã được giao đủ, không thể giao thêm' });
    }

    const items = request.items; // Lấy danh sách items từ Request
    const transfer = new TransferLog({
      requestId,
      fromWarehouseId,
      toWarehouseId,
      deliveredBy,
      note,
      items
    });

    await transfer.save();

    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);

    for (let item of items) {
      const { ingredientId, quantityRequested } = item;

      // Xuất khỏi kho nguồn
      const fromItem = fromWarehouse.listIngredient.find(i => i.ingredientId.toString() === ingredientId.toString());
      if (!fromItem || fromItem.quantity < quantityRequested) {
        return res.status(400).json({ message: `Không đủ tồn kho để xuất nguyên liệu ${ingredientId}` });
      }
      fromItem.quantity -= quantityRequested;

      // Nhập vào kho đích
      const toItem = toWarehouse.listIngredient.find(i => i.ingredientId.toString() === ingredientId.toString());
      if (toItem) {
        toItem.quantity += quantityRequested;
      } else {
        toWarehouse.listIngredient.push({ ingredientId, quantity: quantityRequested });
      }

      // Ghi audit log
      await AuditLog.create([
        {
          warehouseId: fromWarehouseId,
          ingredientId,
          action: 'transfer-out',
          quantityChanged: -quantityRequested,
          changedBy: deliveredBy,
          note: `Xuất theo phiếu yêu cầu ${requestId}`,
        },
        {
          warehouseId: toWarehouseId,
          ingredientId,
          action: 'transfer-in',
          quantityChanged: quantityRequested,
          changedBy: deliveredBy,
          note: `Nhập theo phiếu yêu cầu ${requestId}`,
        }
      ]);
    }

    await fromWarehouse.save();
    await toWarehouse.save();

    // ✅ Giao 1 lần là hoàn thành
    request.status = 'delivered';
    await request.save();

    res.status(201).json({ message: 'Chuyển hàng thành công', transfer });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo transfer', error: err.message });
  }
};


