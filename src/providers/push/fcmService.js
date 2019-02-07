var admin = require("firebase-admin");

var serviceAccount = require('./exchange-88517-firebase-adminsdk-5rprz-a692961f25.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://exchange-api.firebaseio.com"
});

exports.sendMessage = (device, msg, dataObject, callback)=>
{
    console.log(msg);
    // This registration token comes from the client FCM SDKs.
    var registrationToken = device;
    var notify = {
        title : msg.title,
        body : msg.body
    }
    // See documentation on defining a message payload.
    var message = {
        notification: notify,
        data : dataObject,
        token: registrationToken,
        android: {
            ttl: 3600 * 1000,
            notification: {
              icon: msg.icon,
              color: msg.color,
            },
          },
          apns: {
            payload: {
              aps: {
                badge: 1,
              },
            },
          }
    };

    try{
    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        callback(200, response);
    })
    .catch((error) => {
        console.log('Error sending message:', undefined);
        callback(400, error);
    });
}
catch(e)
{
    console.log(e);
}
}