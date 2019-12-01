var admin = require("firebase-admin");

var serviceAccount = require("./loaner-b5ff1-firebase-adminsdk-kwtu6-a84f5e3fae.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://loaner-b5ff1.firebaseio.com"
});

exports.sendMessage = (device, msg, dataObject, callback) => {
  console.log(msg, device);
  // This registration token comes from the client FCM SDKs.
  var registrationToken = device;
  var notify = {
    title: msg.title,
    body: msg.body
  };
  // See documentation on defining a message payload.
  var message = {
    notification: notify,
    data: dataObject,
    token: registrationToken,
    android: {
      ttl: 3600 * 1000,
      notification: {
        icon: msg.icon,
        color: msg.color
      }
    },
    apns: {
      payload: {
        aps: {
          badge: 1
        }
      }
    }
  };

  try {
    // Send a message to the device corresponding to the provided
    // registration token.
    admin
      .messaging()
      .send(message)
      .then(response => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
        callback(200, response);
      })
      .catch(error => {
        console.log("Error sending message:", error);
        //callback(400, error);
      });
  } catch (e) {
    console.log(e);
  }
};
