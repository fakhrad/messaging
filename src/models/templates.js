var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Sys = new Schema({
    spaceId : {type : String},
    issuer : {type: Schema.Types.ObjectId, ref: 'AdminUsers'},
    issueDate : {type : Date, required : true, default : new Date()},
    lastUpdater : {type : Object},
    lastUpdateTime : {type : Date}
}, {_id : false}, {id : false}, { toJSON: { virtuals: true } });

var user = new Schema({
    sys : {type : Sys},
    name : {type:String, required : true},
    title : {type : Object, required : true},
    body : {type : Object},
    isHtml : {type : Boolean, default : false}
}, { toJSON: { virtuals: true } });

module.exports = mongoose.model("Templates", user);