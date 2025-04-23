const { createNewUser, loginUser, getMyInfo, loginToShop, adminLogin, forgotPassword, resetPasswordWithOTP } = require('../controllers/authController');
const { checkLogin } = require('../middlewares/auth');
const router = require('express').Router();

router.post('/register', createNewUser);

router.post('/login', loginUser);
// router.post('/login/shop', loginToShop);
// router.post('/login/admin', adminLogin);

router.get('/me', checkLogin, getMyInfo);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOTP);

module.exports = router;