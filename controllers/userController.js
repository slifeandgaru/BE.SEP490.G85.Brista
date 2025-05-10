const {User} = require('../models/user');
const bcrypt = require('bcrypt');
const fs = require('fs');

exports.getAllUser = async (req, res) => {
    try {
        const currentRole = req.user?.role; // middleware decode token phải gán req.user
        const search = req.query.search || '';
        const searchField = req.query.searchField || 'fullname';
        const filterRole = req.query.role || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const warehouseId = req.query.warehouseId;

        const filter = {};

        // Phân quyền xem user
        if (currentRole === 'manager') {
            filter.role = { $in: ['employee', 'guest'] };
        }

        // Lọc theo role nếu có chỉ định
        if (filterRole !== 'all') {
            filter.role = filter.role
                ? { $in: [filter.role, filterRole] } // combine manager filter + role
                : filterRole;
        }

        // Lọc theo warehouseId 👇
        if (warehouseId) {
            filter.warehouseId = warehouseId;
        }

        // Tìm kiếm theo trường
        if (search) {
            filter[searchField] = { $regex: search, $options: 'i' };
        }

        const listUser = await User.find(filter)
            .select('-password -token')
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            listUser,
            total,
            page,
            limit,
        });
    } catch (error) {
        res.status(500).json({ message: 'server error', error });
    }
};

exports.createNewUser = async (req, res) => {
    try {
        const { phone, email } = req.body;

        // Kiểm tra xem phone đã tồn tại chưa
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
        }

        // Nếu email có trong request, kiểm tra xem email đã tồn tại chưa
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }
        }

        // Nếu không có trùng, tạo user mới
        const newUser = await User.create(req.body);
        console.log(newUser)
        res.status(201).json({ newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


exports.UserOrder = async (req, res) => {
    try {
        const { phone, email } = req.body;
        // Kiểm tra xem phone đã tồn tại chưa
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(200).json({ message: " Người dùng cũ " });
        }

        // Nếu không có trùng, tạo user mới
        const newUser = await User.create(req.body);

        res.status(201).json({ newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



exports.getOneUser = async (req, res) => {
    try {
        console.log(req.params.userId)
        const user = await User.findOne({_id: req.params.userId}).select(['-password', '-token']);
        if(!user) return res.status(400).json({message: 'user not exist'});
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}


exports.updateUserInfo = async (req, res) => {
    try {
        const checkUser = await User.findById(req.params.userId)
        if(req.file){ req.body.avatar = req.file.path;}

        if(checkUser.avatar.startsWith('public') && req.file){ 
            fs.unlink(checkUser.avatar, function(err){ return }) 
        };
        if(req.body.address){
            req.body.$push = {address: req.body.address};
            
        }
        delete req.body.password;
        delete req.body.address;
        const user = await User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}).select(['-password', '-token']);
        res.status(200).json({user});
    } catch (error) {
        console.log(39, error);
        if(error.code === 11000) return res.status(400).json({message: `${Object.keys(error.keyValue)[0]} is used`, error});
        res.status(500).json({message: 'server error', error});
    }
}

exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        const checkPass = await bcrypt.compare(req.body.oldPass, user.password);
        if(!checkPass) return res.status(400).json({message: 'wrong password'});

        await User.updateOne({_id: req.params.userId}, {password: req.body.newPass});
        res.status(200).json({message: 'update success'});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

// exports.changeAvatar = async (req, res) => {
//     try {
//         if(!req.file) return res.status(400).json({message: 'please choose an image to upload'});

//         const user = await User.findById(req.user.id);

//         if(checkUser.avatar.startsWith('public') && req.file){ 
//             fs.unlink(user.avatar, (err) => {return});
//         }

//         const newUser = await User.findOneAndUpdate({_id: req.user.id}, {avatar: req.file.path}, {new: true, runValidators: true});
//         delete newUser._doc.password;
//         delete newUser._doc.token;
//         res.status(200).json({newUser});
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message: 'server error', error});  
//     }
// }

// exports.updateAddress = async (req, res) => {
//     try {
//         console.log(93, req.user.id);
//         res.status(200).json({user: req.user.id});
//     } catch (error) {
//         res.status(500).json({message: 'server error', error});  
//     }
// }