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
        note,
        items
      } = req.body;
  
      // 👉 Lấy request từ DB để kiểm tra trạng thái
      const request = await Request.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Không tìm thấy request' });
      }
  
      // ❌ Nếu đã giao xong rồi thì không cho phép giao thêm
      if (request.status === 'delivered') {
        return res.status(400).json({ message: 'Phiếu yêu cầu đã được giao đủ, không thể giao thêm' });
      }
  
      // Tiếp tục xử lý bình thường
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
        const { ingredientId, quantityDelivered } = item;
  
        // Xuất khỏi kho nguồn
        const fromItem = fromWarehouse.listIngredient.find(i => i.ingredientId.toString() === ingredientId);
        if (!fromItem || fromItem.quantity < quantityDelivered) {
          return res.status(400).json({ message: 'Không đủ tồn kho để xuất' });
        }
        fromItem.quantity -= quantityDelivered;
  
        // Nhập vào kho đích
        const toItem = toWarehouse.listIngredient.find(i => i.ingredientId.toString() === ingredientId);
        if (toItem) {
          toItem.quantity += quantityDelivered;
        } else {
          toWarehouse.listIngredient.push({ ingredientId, quantity: quantityDelivered });
        }
  
        // Ghi audit log
        await AuditLog.create([
          {
            warehouseId: fromWarehouseId,
            ingredientId,
            action: 'transfer-out',
            quantityChanged: -quantityDelivered,
            changedBy: deliveredBy,
            note: `Xuất theo phiếu yêu cầu ${requestId}`,
          },
          {
            warehouseId: toWarehouseId,
            ingredientId,
            action: 'transfer-in',
            quantityChanged: quantityDelivered,
            changedBy: deliveredBy,
            note: `Nhập theo phiếu yêu cầu ${requestId}`,
          }
        ]);
  
        // Cập nhật số lượng đã giao trong Request
        await Request.updateOne(
          { _id: requestId, 'items.ingredientId': ingredientId },
          { $inc: { 'items.$.quantityDelivered': quantityDelivered } }
        );
      }
  
      await fromWarehouse.save();
      await toWarehouse.save();
  
      // Cập nhật trạng thái request nếu đã giao hết
      const updatedReq = await Request.findById(requestId);
      const allDelivered = updatedReq.items.every(i => i.quantityDelivered >= i.quantityRequested);
      if (allDelivered) {
        updatedReq.status = 'delivered';
        await updatedReq.save();
      }
  
      res.status(201).json({ message: 'Chuyển hàng thành công', transfer });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi tạo transfer', error: err.message });
    }
  };
  
