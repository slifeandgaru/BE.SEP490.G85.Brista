const twilio = require('twilio');

const accountSid = 'AC5b6a428af42107a45f6cb8c62f9f7a34';
const authToken = '02792d256d9b0263ea05a17a4a560bf8';
const fromPhone = '+84989782248'; // vd: +12025551234

const client = twilio(accountSid, authToken);

async function sendOTP(phoneNumber, otpCode) {
  const message = `Mã xác thực của bạn là: ${otpCode}`;
  return client.messages.create({
    body: message,
    from: fromPhone,
    to: phoneNumber,
  });
}

module.exports = sendOTP;
