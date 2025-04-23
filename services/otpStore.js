// const Redis = require('ioredis');
// const redis = new Redis(); // default localhost:6379

// function saveOTP(phoneNumber, otp) {
//   return redis.setex(`otp:${phoneNumber}`, 300, otp); // 5 phút TTL
// }

// function verifyOTP(phoneNumber, otp) {
//   return redis.get(`otp:${phoneNumber}`).then(storedOtp => storedOtp === otp);
// }

// module.exports = { saveOTP, verifyOTP };
