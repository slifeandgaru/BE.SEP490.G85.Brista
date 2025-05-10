const Voucher = require("../models/voucher");

// Lấy danh sách voucher
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách voucher", error });
  }
};

// Lấy voucher theo ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy voucher", error });
  }
};

// Tạo mới voucher
exports.createVoucher = async (req, res) => {
  try {
    const newVoucher = new Voucher(req.body);
    await newVoucher.save();
    res.status(201).json({ message: "Tạo voucher thành công", newVoucher });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo voucher", error });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVoucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json(updatedVoucher);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật voucher", error });
  }
};

// Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!deletedVoucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json({ message: "Xóa voucher thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa voucher", error });
  }
};
