var mongoose = require('mongoose');
var Templates = require('../models/templates');
var async = require('async')
var init = function()
{
    var dev_db_url = 'mongodb://fakhrad:logrezaee24359@ds135427.mlab.com:35427/messaging'
    var mongoDB = process.env.DATABASE_URL || dev_db_url;
    mongoose.connect(mongoDB);  
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('connected', ()=>{
      console.log('MongoDb connected');
      var activateAccount = new Templates({
        name : "activateAccount",
        title : {
          "fa" : "فعال سازی حساب کاربری",
          "en" : "Activate account"
        },
        isHtml : false,
        body : "Dear {@first_name} \r\nWelcome to {@appName}\r\nPlease click this link : {@link} to verify your account.\r\nThank you"
      });    
      var welcome = new Templates({
        name : "welcome",
        title : {
          "fa" : "خوش آمد گویی",
          "en" : "Welcome email"
        },
        isHtml : false,
        body : "Dear {@first_name} \r\nWelcome to {@appName}\r\n"
      });    
      var forgotpassword = new Templates({
        name : "forgotpassword",
        title : {
          "fa" : "فراموشی رمز عبور",
          "en" : "Forgot password"
        },
        isHtml : false,
        body : "Dear {@first_name} \r\nWelcome to {@appName}\r\n"
      });
      try
      {
      async.parallel(
        {
          "activation" : function(callback) {
            Templates.findOne({name : "activateAccount"}).exec((err, result)=>{
              if (err)
              {
                 callback(err);
              }
              else
              {
                if (!result)
                  activateAccount.save(callback)
                else
                  callback("Activation email already exists");
              }
            });
            
          },
          "welcome" : function(callback) {
            Templates.findOne({name : "welcome"}).exec((err, result)=>{
              if (err)
              {
                 callback(err);
              }
              else
              {
                if (!result)
                  welcome.save(callback)
                else
                  callback("Welcome email already exists");
              }
            });
            
          },
          "forgotpassword" : function(callback) {
            Templates.findOne({name : "forgotpassword"}).exec((err, result)=>{
              if (err)
              {
                 callback(err);
              }
              else
              {
                if (!result)
                  forgotpassword.save(callback)
                else
                  callback("Forgot password email already exists");
              }
            });
            
          }
        }, (error, results)=>{

        });  
      } 
      catch{
        
      }
    });
}
module.exports = init;