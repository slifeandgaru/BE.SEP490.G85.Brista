const { getAllUser, updateUserInfo, changePassword, getOneUser, updateAddress, createNewUser } = require('../controllers/userController');
// const { checkLogin } = require('../middleware/auth');
// const { upload } = require('../services/userServices');
const router = require('express').Router();

router.get('/get-all-user', getAllUser);
router.post('/create-new-user', createNewUser);
// router.get('/get-one-user/:userId', getOneUser);
// router.patch('/update-user-info/:userId', checkLogin, upload.single('avatar'), updateUserInfo);
// router.patch('/change-password/:userId', checkLogin, changePassword);
// router.patch('/update-address', checkLogin, updateAddress);

module.exports = router;