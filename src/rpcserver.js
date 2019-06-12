var amqp = require('amqplib/callback_api');
const msgController = require('./controllers/messagingController');
const adminController = require('./controllers/adminController');
const spaceController = require('./controllers/spaceController');
const AdminUsers = require('./models/adminuser');

var db = require('./db/init-db');

var rabbitHost = process.env.RABBITMQ_HOST || "amqp://gvgeetrh:6SyWQAxDCpcdg1S0Dc-Up0sUxfmBUVZU@chimpanzee.rmq.cloudamqp.com/gvgeetrh";
//var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:5672";

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
      //return setTimeout(start, 1000);
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
            //return setTimeout(start, 1000);
        }
        ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function() {
        console.log("[AMQP] channel closed");
        });
        console.log('Client connected.');
        this.channel = ch;

        ch.prefetch(1);
        console.log('Messaging service broker started!');

      //SendMessage API
      ch.assertQueue("sendMessage", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            try{
                msgController.sendMessage(req.body.phoneNumber, req.body.message, (result)=>{
                  console.log(result);
                  ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                  ch.ack(msg);
              });
            }
            catch(ex)
            {
              console.log(ex);
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
                  ch.ack(msg);
            } 

        });
      });
    //SendMessage API
    ch.assertQueue("sendVerifyCode", {durable: false}, (err, q)=>{
      ch.consume(q.queue, function reply(msg) {
          var req = JSON.parse(msg.content.toString('utf8'));
          try{
                  msgController.sendMessage(req.body.phoneNumber, req.body.code, (result)=>{
                    if (!result.success)
                      console.log(result);
                    ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                    ch.ack(msg);
              });
          }
          catch(ex)
          {
            console.log(ex);
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
          } 

      });
    });
    //Send Email Message API
    ch.assertQueue("sendEmailMessage", {durable: false}, (err, q)=>{
      ch.consume(q.queue, function reply(msg) {
          var req = JSON.parse(msg.content.toString('utf8'));
          try{
            msgController.sendEmailMessage(req.body.message, (result)=>{
              console.log(result);
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
              ch.ack(msg);
          });
          }
          catch(ex)
          {
            console.log(ex);
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
          } 

      });
    });
    //SendPushMessge API
    ch.assertQueue("sendPushMessage", {durable: false}, (err, q)=>{
      ch.consume(q.queue, function reply(msg) {
          var req = JSON.parse(msg.content.toString('utf8'));
          try{
            msgController.sendPushMessage(req.body.device, req.body.message, req.body.data, (result)=>{
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
              ch.ack(msg);
          });
          }
          catch(ex)
          {
            console.log(ex);
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
          } 

      });
    });

       //Exchanges
       var exchange = 'messaging';

       channel.assertExchange(exchange, 'fanout', {
         durable: false
       });
 
       ch.assertQueue("adminuserregistered", {durable: false}, (err, q)=>{
         if (!err)
         {
           ch.bindQueue(q.queue, "adminauth", "adminuserregistered")
           ch.consume(q.queue, function(msg) {
             // console.log(msg);
             var req = JSON.parse(msg.content.toString('utf8'));
             console.log("Admin user registered. adding to local database and sending activation email");
             try
             {
                adminController.registeruser(req, (result)=>{
                  if (result.success)
                  {
                    msgController.sendEmailByTemplate('activateAccount', result.data, (emailResult)=>{
                      
                    });
                  }
                });
             }
             catch(ex)
             {
               console.log(ex);
             }
           }, {
             noAck: true
           });
         }
       });
 
       ch.assertQueue("spacecreated", {durable: false}, (err, q)=>{
        if (!err)
        {
          ch.bindQueue(q.queue, "contentservice", "spacecreated")
          ch.consume(q.queue, function(msg) {
            // console.log(msg);
            var req = JSON.parse(msg.content.toString('utf8'));
            console.log("New space created. adding to local database and sending activation email to space admin",);
            try
            {
                spaceController.createuserspace(req, (result)=> {});
            }
            catch(ex)
            {
                console.log(ex);
            }
          }, {
            noAck: true
          });
        }
    });
    });
  };
start();

db();
