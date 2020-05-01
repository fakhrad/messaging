const axios = require('axios');
var apiKey = process.env.SenderApiKey || "d39e2520c25afa92b5f91723ebe1da3e"
exports.sendMessage = (msg, callback) => {
    console.log(msg);
    const message = {
        "api_key": apiKey,
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
    };
    var apiRoot = "https://app.sender.net/api";
    var config = {
        url: "",
        baseURL: apiRoot,
        method: "POST",
        params: [{
            method: "sendTransactionalEmail",
            params: {
                "api_key": "your_api_key_here",
                "transactional_campaign_id": msg.campaignid,
                "email": msg.to
            }
        }]
    };
    console.log(config);
    axios(config)
        .then(function (response) {

        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
            console.log(error.config);
        });
}