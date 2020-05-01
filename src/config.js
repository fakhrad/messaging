const pushprovider = 'fcm';
const emailProvider = "smtp";
const smsProvider = "kavenegar";

module.exports = {
    pushProvider: process.env.PUSH_PROVIDER || pushprovider,
    smsProvider: process.env.SMS_PROVIDER || smsProvider,
    emailProvider: process.env.EMAIL_PROVIDER || emailProvider
};