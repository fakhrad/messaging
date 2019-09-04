var amqp = require("amqplib/callback_api");
const msgController = require("./controllers/messagingController");
const adminController = require("./controllers/adminController");
const spaceController = require("./controllers/spaceController");
const Spaces = require("./models/space");
const ContentTypes = require("./models/contentType");
const async = require("async");

var db = require("./db/init-db");

var rabbitHost =
  process.env.RABBITMQ_HOST ||
  "amqp://gvgeetrh:6SyWQAxDCpcdg1S0Dc-Up0sUxfmBUVZU@chimpanzee.rmq.cloudamqp.com/gvgeetrh";
//var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:5672";

var amqpConn = null;
function start() {
  console.log("Start connecting : " + process.env.RABBITMQ_HOST);
  amqp.connect(rabbitHost, (err, conn) => {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      //return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}
function whenConnected() {
  amqpConn.createChannel((err, ch) => {
    if (err) {
      console.error("[AMQP]", err.message);
      //return setTimeout(start, 1000);
    }
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });
    console.log("Client connected.");
    this.channel = ch;

    ch.prefetch(1);
    console.log("Messaging service broker started!");

    //SendMessage API
    ch.assertQueue("sendMessage", { durable: false }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString("utf8"));
        try {
          msgController.sendMessage(
            req.body.phoneNumber,
            req.body.message,
            result => {
              console.log(result);
              ch.sendToQueue(
                msg.properties.replyTo,
                new Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId }
              );
              ch.ack(msg);
            }
          );
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer.from(JSON.stringify(ex)),
            { correlationId: msg.properties.correlationId }
          );
          ch.ack(msg);
        }
      });
    });
    //SendMessage API
    ch.assertQueue("sendVerifyCode", { durable: false }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString("utf8"));
        try {
          msgController.sendVerfiyCode(
            req.body.phoneNumber,
            req.body.code,
            req.body.clientId,
            result => {
              if (!result.success) console.log(result);
              ch.sendToQueue(
                msg.properties.replyTo,
                new Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId }
              );
              ch.ack(msg);
            }
          );
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer.from(JSON.stringify(ex)),
            { correlationId: msg.properties.correlationId }
          );
          ch.ack(msg);
        }
      });
    });
    //Send Email Message API
    ch.assertQueue("sendEmailMessage", { durable: false }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString("utf8"));
        try {
          msgController.sendEmailMessage(req.body.message, result => {
            console.log(result);
            ch.sendToQueue(
              msg.properties.replyTo,
              new Buffer.from(JSON.stringify(result)),
              { correlationId: msg.properties.correlationId }
            );
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer.from(JSON.stringify(ex)),
            { correlationId: msg.properties.correlationId }
          );
          ch.ack(msg);
        }
      });
    });
    //SendPushMessge API
    ch.assertQueue("sendPushMessage", { durable: false }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString("utf8"));
        try {
          msgController.sendPushMessage(
            req.body.device,
            req.body.message,
            req.body.data,
            result => {
              ch.sendToQueue(
                msg.properties.replyTo,
                new Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId }
              );
              ch.ack(msg);
            }
          );
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer.from(JSON.stringify(ex)),
            { correlationId: msg.properties.correlationId }
          );
          ch.ack(msg);
        }
      });
    });

    //Exchanges
    var exchange = "messaging";

    ch.assertExchange(exchange, "direct", {
      durable: false
    });

    ch.assertExchange("contentservice", "direct", {
      durable: false
    });

    ch.assertExchange("adminauth", "direct", {
      durable: false
    });

    ch.assertQueue("", { durable: false, exclusive: true }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "adminauth", "admintokencreated");
        ch.consume(
          q.queue,
          function(msg) {
            // console.log(msg);
            var req = JSON.parse(msg.content.toString("utf8"));
            console.log("Admin user token created. adding tokens");
            try {
              adminController.savetoken(req, () => {});
            } catch (ex) {
              console.log(ex);
            }
          },
          {
            noAck: true
          }
        );
      }
    });

    ch.assertQueue("", { durable: false, exclusive: true }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "adminauth", "adminuserregistered");
        ch.consume(
          q.queue,
          function(msg) {
            // console.log(msg);
            var req = JSON.parse(msg.content.toString("utf8"));
            console.log(
              "Admin user registered. adding to local database and sending activation email"
            );
            try {
              adminController.registeruser(req, result => {
                console.log(
                  "Admin user result finished. checking result : " +
                    JSON.stringify(result)
                );
                if (result.success) {
                  msgController.sendEmailByTemplate(
                    "5cffc3487e01a5006b9937f6",
                    result.data,
                    result.data,
                    undefined,
                    emailResult => {}
                  );
                }
              });
            } catch (ex) {
              console.log(ex);
            }
          },
          {
            noAck: true
          }
        );
      }
    });

    ch.assertQueue("", { durable: false, exclusive: true }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "contentservice", "spacecreated");
        ch.consume(
          q.queue,
          function(msg) {
            // console.log(msg);
            var req = JSON.parse(msg.content.toString("utf8"));
            console.log("New space created. adding to local database");
            try {
              spaceController.createuserspace(req, result => {});
            } catch (ex) {
              console.log(ex);
            }
          },
          {
            noAck: true
          }
        );
      }
    });
    ch.assertQueue("", { durable: false, exclusive: true }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "contentservice", "contentsubmitted");
        ch.consume(
          q.queue,
          function(msg) {
            // console.log(msg);
            var req = JSON.parse(msg.content.toString("utf8"));
            console.log(
              "New content submitted." + msg.content.toString("utf8")
            );
            try {
              async.parallel(
                {
                  space: function(callback) {
                    Spaces.findById(req.body.data.sys.spaceId).exec(callback);
                  }
                },
                (err, results) => {
                  console.log(results);
                  if (results.space) {
                    msgController.sendEmailMessage(
                      {
                        to:
                          results.space.notification_email ||
                          "info.reqter@gmail.com",
                        from:
                          process.env.REQTER_NOTIFICATION_EMAIL ||
                          "noreply@reqter.com",
                        subject: req.body.data.fields.name,
                        text:
                          "شما یک درخواست جدید دارید.\r\n" +
                          +JSON.stringify(req.body.data.fields)
                      },
                      () => {}
                    );
                  } else {
                    msgController.sendEmailMessage(
                      {
                        to: "info.reqter@gmail.com",
                        from:
                          process.env.REQTER_NOTIFICATION_EMAIL ||
                          "noreply@reqter.com",
                        subject: req.body.data.fields.name,
                        text: "شما یک درخواست جدید دارید.\r\n"
                      },
                      () => {}
                    );
                  }
                }
              );
            } catch (ex) {
              console.log(ex);
            }
          },
          {
            noAck: true
          }
        );
      }
    });
  });
}
start();

db();
