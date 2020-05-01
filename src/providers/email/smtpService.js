const nodemailer = require('nodemailer');

exports.sendMessage = async (msg, callback) => {
    console.log(msg);


    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.googlemail.com', // Gmail Host
        port: process.env.SMTP_PORT || 465, // Port
        secure: (process.env.SMTP_SSL && process.env.SMTP_SSL.toLowerCase() === "true") || false, // this is true as port is 465
        auth: {
            user: process.env.SMTP_USERNAME, //Gmail username
            pass: process.env.SMTP_PASSWORD // Gmail password
        }
    });

    let mailOptions = {
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        callback(200, info);
    });
}