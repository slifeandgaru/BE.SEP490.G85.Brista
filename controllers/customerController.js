const { Customer } = require("../models/customer");

// Tạo khách hàng mới
exports.createNewCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(200).json({ customer });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'This phone number is already used' });
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy danh sách tất cả khách hàng
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({ customers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy thông tin khách hàng theo ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json({ customer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Tìm khách hàng theo số điện thoại hoặc tên
exports.findCustomerByRegex = async (req, res) => {
    try {
        const { query } = req.query;
        const customers = await Customer.find({
            $or: [
                { customerName: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        });
        res.status(200).json({ customers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Cập nhật thông tin khách hàng
exports.updateCustomerInfo = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json({ customer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Xóa khách hàng theo ID
exports.deleteCustomerById = async (req, res) => {
    try {
        const { customerId } = req.body; // Nhận ID từ body

        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        const customer = await Customer.findByIdAndDelete(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
