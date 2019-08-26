var Kavenegar = require("kavenegar");
var api = Kavenegar.KavenegarApi({
  apikey:
    process.env.KAVENEGAR_API ||
    "6B62613648303131747448786E324C7531744E4D2F682B7A2F504F797A4F4450"
});
exports.sendVerifyCode = (phoneNumber, code, clientId, callback) => {
  var template = "loanverify";
  console.log(clientId + ":" + process.env[clientId]);
  if (clientId) template = process.env[clientId];
  var message = {
    receptor: phoneNumber,
    token: code,
    template: template || "loanverify"
  };
  console.log(message);
  api.VerifyLookup(message, function(response, status) {
    if (status == 200) {
      callback(status, response);
    } else {
      callback(status, response);
    }
  });
};

exports.sendMessage = (phoneNumber, message, callback) => {
  var message = {
    receptor: phoneNumber,
    sender: process.env.KAVENEGAR_LINE || "100065995",
    message: message
  };
  console.log(message);

  api.Send(message, function(response, status) {
    // console.log(response);
    // console.log(status);
    if (status == 200) {
      callback(status, response);
    } else {
      callback(status, response);
    }
  });
};
