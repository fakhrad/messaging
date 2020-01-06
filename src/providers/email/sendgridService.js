const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMessage = (msg, callback) => {
    console.log(msg);
    const message = {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
    };
    sgMail.send(message, false).then((response) => {
        // Response is a message ID string.
        callback(200, response);
    })
        .catch((error) => {
            console.log('Error in sending message:', error);
            callback(400, error);
        });
}

