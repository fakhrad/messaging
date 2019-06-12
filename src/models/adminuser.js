var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    username : {type:String, required : true, unique : true},
    password : {type:String},
    roles : {type:Array},
    lastlogin : {type : Date},
    access_token : {type : String},
    active : {type : Boolean, default : true},
    emailConfirmed : {type : Boolean, default : false},
    account_type : {type:String, enum : ['free', 'advanced', 'premium'], default : "free"},
    profile : {type : Object}
}, { toJSON: { virtuals: true } });

module.exports = mongoose.model("AdminUsers", user);