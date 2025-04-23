const VAT = require("../models/VAT");

// Lấy danh sách tất cả VAT
exports.getAllVAT = async (req, res) => {
  try {
    const vats = await VAT.find();
    res.json(vats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy VAT theo ID
exports.getVATById = async (req, res) => {
  try {
    const vat = await VAT.findById(req.params.id);
    if (!vat) return res.status(404).json({ message: "VAT không tồn tại" });
    res.json(vat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mới VAT
exports.createVAT = async (req, res) => {
  try {
    const { code, description, rate, status } = req.body;
    const newVAT = new VAT({ code, description, rate, status });
    await newVAT.save();
    res.status(201).json(newVAT);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật VAT
exports.updateVAT = async (req, res) => {
  try {
    const updatedVAT = await VAT.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVAT) return res.status(404).json({ message: "VAT không tồn tại" });
    res.json(updatedVAT);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa VAT
exports.deleteVAT = async (req, res) => {
  try {
    const deletedVAT = await VAT.findByIdAndDelete(req.params.id);
    if (!deletedVAT) return res.status(404).json({ message: "VAT không tồn tại" });
    res.json({ message: "Đã xóa VAT thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
