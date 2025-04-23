const mongoose = require('mongoose');
const Warehouse  = require('../models/warehouse');
const Ingredient = require('../models/ingredient');

// Lấy danh sách kho với phân trang
exports.getAllWarehouses = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        console.log(`📦 Fetching Warehouses - Page: ${page}, Limit: ${limit}`);

        // Lấy danh sách warehouse + populate thông tin nguyên liệu
        const warehouses = await Warehouse.find()
            .skip(skip)
            .limit(limit)
            .populate("listIngredient.ingredientId");

        // Đếm tổng số warehouse
        const total = await Warehouse.countDocuments();

        console.log(`✅ Found ${warehouses.length} warehouses (Total: ${total})`);

        res.status(200).json({
            warehouses,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("❌ Error fetching warehouses:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Lấy kho theo ID
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id).populate("listIngredient.ingredientId");
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.status(200).json({ warehouse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Tạo kho mới
exports.createWarehouse = async (req, res) => {
    try {
        const { warehouseName, warehouseType, address, manager, listIngredient } = req.body;

        // Kiểm tra warehouseType có hợp lệ không
        if (!["Warehouse", "Subwarehouse"].includes(warehouseType)) {
            return res.status(400).json({ message: "warehouseType chỉ được là 'Warehouse' hoặc 'Subwarehouse'" });
        }

        const newWarehouse = new Warehouse(req.body);
        await newWarehouse.save();
        res.status(201).json({ message: 'Warehouse created successfully', warehouse: newWarehouse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Cập nhật kho theo ID
exports.updateWarehouse = async (req, res) => {
    try {
        const updatedWarehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.status(200).json({ message: 'Warehouse updated successfully', warehouse: updatedWarehouse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Xóa kho theo ID
exports.deleteWarehouse = async (req, res) => {
    try {
        const deletedWarehouse = await Warehouse.findByIdAndDelete(req.params.id);
        if (!deletedWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.status(200).json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Thêm nguyên liệu vào trong kho
exports.addIngredientToWarehouse = async (req, res) => {
    try {
        const { warehouseId, ingredientId, quantity, unit } = req.body;

        // Kiểm tra ingredient có tồn tại không
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        // Kiểm tra warehouse có tồn tại không
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        let selectedUnit = unit || ingredient.baseUnit; // Nếu không có unit, lấy baseUnit
        let conversionRate = 1; // Mặc định là 1 nếu dùng baseUnit

        if (unit) {
            // Nếu có đơn vị khác baseUnit, tìm conversionRate tương ứng
            const conversion = ingredient.conversionRate.find(c => c.unit === unit);
            if (!conversion) {
                return res.status(400).json({ message: `Unit ${unit} is not supported for this ingredient` });
            }
            conversionRate = conversion.rate;
        }

        // Tính tổng số lượng theo đơn vị gốc (baseUnit)
        const totalQuantity = quantity * conversionRate;

        // Kiểm tra xem nguyên liệu đã có trong kho chưa
        const existingIndex = warehouse.listIngredient.findIndex(
            (item) => item.ingredientId.toString() === ingredientId
        );

        if (existingIndex !== -1) {
            // Nếu đã có nguyên liệu trong kho, cộng thêm số lượng mới
            warehouse.listIngredient[existingIndex].quantity += totalQuantity;
        } else {
            // Nếu chưa có, thêm mới vào danh sách nguyên liệu
            warehouse.listIngredient.push({
                ingredientId,
                quantity: totalQuantity,
                selectedUnit,
                conversionRate,
            });
        }

        console.log("🚀 listIngredient trước khi lưu:", warehouse.listIngredient);
        // Lưu lại warehouse sau khi cập nhật
        await warehouse.save();
        res.status(200).json({ message: "Ingredient added to warehouse successfully", warehouse });
    } catch (error) {
        console.error("Error adding ingredient:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.removeIngredientFromWarehouse = async (req, res) => {
    try {
        const { warehouseId, ingredientId } = req.body; // Nhận cả 2 ID từ body

        // Kiểm tra warehouse có tồn tại không
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // Kiểm tra ingredient có trong warehouse không
        const ingredientExists = warehouse.listIngredient.some(
            (item) => item.ingredientId.toString() === ingredientId
        );
        if (!ingredientExists) {
            return res.status(404).json({ message: "Ingredient not found in warehouse" });
        }

        // Xoá ingredient khỏi listIngredient
        warehouse.listIngredient = warehouse.listIngredient.filter(
            (item) => item.ingredientId.toString() !== ingredientId
        );

        // Lưu warehouse sau khi cập nhật
        await warehouse.save();

        res.status(200).json({ message: "Ingredient removed from warehouse successfully", warehouse });
    } catch (error) {
        console.error("❌ Lỗi khi xoá nguyên liệu:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Tìm warehouse theo managerID
exports.getWarehousesByManager = async (req, res) => {
    try {
      const { managerId } = req.params;
  
      const warehouses = await Warehouse.find({ managerId }).populate('listIngredient.ingredientId');
  
      if (!warehouses || warehouses.length === 0) {
        return res.status(404).json({ message: "No warehouses found for this manager" });
      }
  
      res.status(200).json({ warehouses });
    } catch (error) {
      console.error("Error getting warehouses by manager:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };


