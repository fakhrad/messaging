var amqp = require('amqplib/callback_api');
const msgController = require('./controllers/messagingController')

var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:5672";

var amqpConn = null;
function start() {
    console.log('Start connecting : ' + process.env.RABBITMQ_HOST );;
  amqp.connect(rabbitHost, (err, conn)=>{
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
      return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}
function whenConnected() {
    amqpConn.createChannel( (err, ch) => {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
        }
        ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function() {
        console.log("[AMQP] channel closed");
        });
        console.log('Client connected.');
        this.channel = ch;

        ch.prefetch(10);
        console.log('Messaging service broker started!');

      //SendMessage API
      ch.assertQueue("sendMessage", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            msgController.sendMessage(req.body.phoneNumber, req.body.message, (result)=>{
              console.log(result);
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
              ch.ack(msg);
          });
        });
      });
    //SendMessage API
    ch.assertQueue("sendVerifyCode", {durable: false}, (err, q)=>{
      ch.consume(q.queue, function reply(msg) {
          var req = JSON.parse(msg.content.toString('utf8'));
          console.log(req);
          //msgController.sendVerfiyCode(req.body.phoneNumber, req.body.code, (result)=>{
            msgController.sendMessage(req.body.phoneNumber, req.body.code, (result)=>{
              if (!result.success)
                console.log(result);
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
              ch.ack(msg);
        });
      });
    });
    //SendPushMessge API
    ch.assertQueue("sendPushMessage", {durable: false}, (err, q)=>{
      ch.consume(q.queue, function reply(msg) {
          var req = JSON.parse(msg.content.toString('utf8'));
          console.log(req);
          msgController.sendPushMessage(req.body.device, req.body.message, req.body.data, (result)=>{
            console.log(result);
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
            ch.ack(msg);
        });
      });
    });
    });
  };
start();