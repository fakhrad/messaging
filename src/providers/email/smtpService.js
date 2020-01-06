const sgMail = require('sendmail')();
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMessage = (msg, callback) => {
    console.log(msg);
    sgMail({
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text
    }, function (err, reply) {
        if (err) {
            console.log(err && err.stack);
            callback(500, err);
        }
        else
            callback(200, reply);

    });
}

