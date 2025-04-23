// const { Cart } = require("../models/cart");
const { User } = require("../models/user");
const { checkEmailAndPassword } = require("../services/authServices");
const sendOTP = require("../services/twilioService")
const { saveOTP, verifyOTP } = require("../services/otpStore")

exports.createNewUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(200).json({ message: 'create success' });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `${duplicateField} is already in use`,
                field: duplicateField,
                error
            });
        }
        res.status(500).json({ message: 'server error', error });
    }
}

exports.loginUser = async (req, res) => {
    try {
        // console.log(18, req.body);
        const user = await checkEmailAndPassword(req, res);
        if (user.error) return res.status(400).json({ message: user.error });

        const token = user.user.createToken();
        res.status(200).json({ message: 'login success', token });
    } catch (error) {
        res.status(500).json({ message: 'server error', error });
    }
}

exports.getMyInfo = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id }).populate('shop').select(['-password', '-token']);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'server error', error });
    }
}

// exports.loginToShop = async (req, res) => {
//     try {
//         // console.log(40, req.body);
//         const user = await checkEmailAndPassword(req, res);
//         if(user.error) return res.status(400).json({message: user.error});

//         if(!user.user.shop) return res.status(400).json({message: `you don't have a shop yet, please create a shop first`});

//         const token = user.user.createToken();
//         res.status(200).json({message: 'login success', token});
//     } catch (error) {
//         res.status(500).json({message: 'server error', error});
//     }
// }

exports.adminLogin = async (req, res) => {
    try {
        // console.log(55, req.body);
        const user = await checkEmailAndPassword(req, res);
        if (user.error) return res.status(400).json({ message: user.error });

        if (user.user.role !== 'admin') return res.status(400).json({ message: `you don't have permission to login to this page` })

        const token = user.user.createToken();
        res.status(200).json({ message: 'login success', token });
    } catch (error) {
        res.status(500).json({ message: 'server error', error });
    }
}

// exports.sendOTP = async (req, res) => {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) return res.status(400).json({ error: 'Missing phone number' });

//     const otp = Math.floor(100000 + Math.random() * 900000); // mã 6 số

//     try {
//         await sendOTP(phoneNumber, otp);
//         // Lưu otp vào DB hoặc Redis (TTL ~ 5 phút)
//         res.json({ success: true, message: 'OTP sent successfully' });
//     } catch (err) {
//         console.error('Send OTP error:', err.message);
//         res.status(500).json({ success: false, error: 'Failed to send OTP' });
//     }
// }

exports.forgotPassword = async (req, res) => {
    const { phone } = req.body;
    console.log(phone);
    if (!phone) return res.status(400).json({ message: 'Vui lòng nhập số điện thoại' });
  
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'Số điện thoại không tồn tại' });
  
    const otp = Math.floor(100000 + Math.random() * 900000); // random 6 chữ số
    
    try {
      // Lưu OTP vào trường verifyOTP của user
      user.verifyOTP = otp.toString();  // Lưu OTP dưới dạng chuỗi
      await user.save();  // Lưu thay đổi vào database

    //   const normalizePhone = (phone) => {
    //     if (phone.startsWith('0')) {
    //       return '+84' + phone.slice(1);
    //     }
    //     return phone;
    //   }
  
    //   // Gửi OTP qua SMS/ZNS
    //   await sendOTP(normalizePhone(phone), otp); 
      res.json({ message: 'Mã OTP đã được gửi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Không gửi được OTP' });
    }
  };

  exports.resetPasswordWithOTP = async (req, res) => {
    const { phone, otp, newPassword } = req.body;
  
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
  
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  
    // Kiểm tra OTP
    if (user.verifyOTP !== otp) {
      return res.status(401).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }
  
    // Mã OTP hợp lệ, tiến hành đổi mật khẩu
    // const bcrypt = require('bcrypt');
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(newPassword, salt);
    console.log(143, user._id)
    user.verifyOTP = ""
    await User.updateOne({_id: user._id}, {password: newPassword})
  
    res.json({ message: 'Đổi mật khẩu thành công' });
  };