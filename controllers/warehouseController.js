const Warehouse = require('../models/warehouse');

// Lấy danh sách kho với phân trang
exports.getAllWarehouses = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const warehouses = await Warehouse.find().skip(skip).limit(limit);
        const total = await Warehouse.countDocuments();

        res.status(200).json({
            warehouses,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy kho theo ID
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
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
        const { warehouseId } = req.params;
        const { ingredientId, quantity } = req.body;

        if (!ingredientId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "ingredientId và quantity phải hợp lệ!" });
        }

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse không tồn tại!" });
        }

        // Kiểm tra xem ingredientId đã tồn tại trong listIngredient chưa
        const ingredientIndex = warehouse.listIngredient.findIndex(item => item.ingredientId === ingredientId);

        if (ingredientIndex !== -1) {
            // Nếu tồn tại, tăng số lượng
            warehouse.listIngredient[ingredientIndex].quantity += quantity;
        } else {
            // Nếu chưa tồn tại, thêm mới
            warehouse.listIngredient.push({ ingredientId, quantity });
        }

        await warehouse.save();
        res.status(200).json({ message: "Cập nhật thành công!", warehouse });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

